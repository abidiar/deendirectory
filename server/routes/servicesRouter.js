const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const sharp = require('sharp');
const db = require('../db/db');
const { convertCityStateToCoords } = require('../utils/locationUtils');
const { uploadToCloudflare } = require('../utils/cloudflareUtils');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

function isValidUSAddress(address) {
    const regex = /^[0-9]{1,6}\s[a-zA-Z0-9\s,'-]{3,40},\s[a-zA-Z\s]{2,20},\s[A-Z]{2}\s[0-9]{5}$/;
    return regex.test(address);
}

router.get('/api/search', async (req, res) => {
    const {
      searchTerm = '',
      category,
      isHalalCertified,
      latitude,
      longitude,
      sort = 'relevance', // Default sort
      page = 1,
      pageSize = 10
    } = req.query;
  
    const offset = (page - 1) * pageSize;
  
    let queryParams = [pageSize, offset];
    let whereConditions = [];
    let orderByClause = '';
  
    // Building WHERE conditions based on filters
    if (searchTerm) {
      whereConditions.push(`to_tsvector('english', name || ' ' || description) @@ plainto_tsquery('english', $${queryParams.unshift(searchTerm)})`);
    }
    if (category) {
      whereConditions.push(`category_id = $${queryParams.unshift(category)}`);
    }
    if (isHalalCertified) {
      whereConditions.push(`is_halal_certified = $${queryParams.unshift(isHalalCertified === 'true')}`);
    }
  
    // Geographic distance filter
    if (latitude && longitude) {
      queryParams.unshift(latitude, longitude);
      whereConditions.push(`ST_DWithin(geographic_location, ST_SetSRID(ST_MakePoint($${queryParams.length - 1}, $${queryParams.length}), 4326), 10000)`); // Example distance 10km
    }
  
    // Building ORDER BY clause based on sort parameter
    switch (sort) {
      case 'rating':
        orderByClause = 'ORDER BY average_rating DESC';
        break;
      case 'newest':
        orderByClause = 'ORDER BY date_added DESC';
        break;
      case 'distance':
        // Assuming you have a geographic_location column
        orderByClause = `ORDER BY geographic_location <-> ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)`;
        break;
      default:
        orderByClause = 'ORDER BY relevance DESC';
    }
  
    const baseQuery = `
      FROM services
      ${whereConditions.length ? `WHERE ${whereConditions.join(' AND ')}` : ''}
    `;
  
    try {
      // Fetching the paginated results
      const resultsQuery = `
        SELECT *, COUNT(*) OVER() AS full_count
        ${baseQuery}
        ${orderByClause}
        LIMIT $1 OFFSET $2
      `;
      const { rows } = await pool.query(resultsQuery, queryParams);
      const totalRows = rows[0] ? rows[0].full_count : 0;
  
      res.json({
        results: rows,
        total: parseInt(totalRows, 10),
        page,
        pageSize
      });
    } catch (error) {
      console.error('Search API error:', error);
      res.status(500).send('Internal Server Error');
    }
  });

router.post('/add',
    upload.single('image'),
    body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
    body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
    body('category').trim().isLength({ min: 1 }).withMessage('Category is required'),
    body('is_halal_certified').optional().isBoolean(),
    body('phone_number').optional().matches(/^\(\d{3}\) \d{3}-\d{4}$/),
    body('postal_code').optional().matches(/^\d{5}(-\d{4})?$/),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { name, description, category, city, state, street_address, postal_code, country, phone_number, website, hours, is_halal_certified } = req.body;
            if (!isValidUSAddress(`${street_address}, ${city}, ${state} ${postal_code}`)) {
                return res.status(400).json({ message: 'Invalid address format' });
            }

            const categoryResult = await db.query('SELECT id FROM categories WHERE name = $1', [category]);
            if (categoryResult.rows.length === 0) {
                return res.status(400).json({ message: 'Invalid category name' });
            }
            const categoryId = categoryResult.rows[0].id;

            let coords = await convertCityStateToCoords(city, state);
            if (!coords) {
                return res.status(400).json({ message: 'Invalid city or state for coordinates' });
            }

            let imageUrl = 'defaultImageUrl'; // Fallback image URL
            if (req.file) {
                const buffer = await sharp(req.file.buffer)
                    .rotate() // This auto-orients the image based on its Exif data
                    .resize(256, 256, { fit: sharp.fit.cover, position: sharp.strategy.entropy })
                    .jpeg({ quality: 80 })
                    .toBuffer();
            
                try {
                    imageUrl = await uploadToCloudflare(buffer, req.file.originalname);
                } catch (uploadError) {
                    console.error('Error uploading to Cloudflare:', uploadError);
                    return res.status(500).json({ error: 'Error uploading image to Cloudflare', details: uploadError.message });
                }
            }

            // Debug log for the values being inserted into the database
            console.log("Inserting into database with imageUrl:", imageUrl);

            const insertQuery = `INSERT INTO services (
                name, description, latitude, longitude, category_id, street_address, city, state, postal_code, country, phone_number, website, hours, is_halal_certified, average_rating, review_count, image_url, location
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, ST_SetSRID(ST_MakePoint($4, $3), 4326)) RETURNING *;`;

            const values = [name, description, coords.latitude, coords.longitude, categoryId, street_address, city, state, postal_code, country, phone_number, website, hours, is_halal_certified, 0, 0, imageUrl];

            try {
                const result = await db.query(insertQuery, values);
                res.status(201).json(result.rows[0]);
            } catch (dbError) {
                console.error('Error inserting into database:', dbError);
                return res.status(500).json({ error: 'Error inserting service into database', details: dbError.message });
            }
        } catch (error) {
            console.error('Error during request processing:', error);
            res.status(500).json({ error: 'Internal server error', details: error.message });
        }
    }
);

router.get('/:id', async (req, res) => {
    const businessId = parseInt(req.params.id, 10);
    if (isNaN(businessId)) {
        return res.status(400).json({ error: 'Business ID must be an integer' });
    }
    try {
        const businessQuery = `
            SELECT
                id, name, description, latitude, longitude, location, date_added,
                category_id, street_address, city, state, postal_code, country,
                phone_number, website, hours, is_halal_certified, average_rating, review_count, image_url 
            FROM services
            WHERE id = $1;
        `;
        const businessResult = await db.query(businessQuery, [businessId]);
        if (businessResult.rows.length === 0) {
            return res.status(404).json({ message: 'Business not found' });
        }
        res.json(businessResult.rows[0]);
    } catch (error) {
        console.error('Error fetching business details:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

module.exports = router;
