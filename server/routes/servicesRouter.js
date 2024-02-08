const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const db = require('../db/db');
const sharp = require('sharp');
const { convertCityStateToCoords } = require('../utils/locationUtils');
const { uploadToCloudflare } = require('../utils/cloudflareUtils');

const router = express.Router();

function isValidUSAddress(address) {
    console.log('Validating address:', address);
    const regex = /^[0-9]{1,6}\s[a-zA-Z0-9\s,'-]{3,40},\s[a-zA-Z\s]{2,20},\s[A-Z]{2}\s[0-9]{5}$/;
    return regex.test(address);
}

router.post('/add', upload.single('image'), 
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

        let coords = { latitude: null, longitude: null };
        if (city && state) {
            coords = await convertCityStateToCoords(city, state);
            if (!coords) {
                return res.status(400).json({ message: 'Invalid city or state for coordinates' });
            }
        }

        let imageUrl = 'defaultImageUrl';
        if (req.file) {
            // Resize the image to 256x256 pixels, maintain aspect ratio, and center the image
            // Compress the image to ensure the file size is under 1MB
            const buffer = await sharp(req.file.path)
                .resize(256, 256, {
                    fit: sharp.fit.cover, // Cover will ensure the image covers the dimensions and will be cropped to fit
                    position: sharp.strategy.entropy // Focuses on the region of the image with the highest entropy
                })
                .jpeg({ quality: 80 }) // Adjust the quality to control the final file size
                .toBuffer();
        
            imageUrl = await uploadToCloudflare({ ...req.file, buffer });
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }

        const insertQuery = `INSERT INTO services (
            name, description, latitude, longitude, category_id, street_address, city, state, postal_code, country, phone_number, website, hours, is_halal_certified, average_rating, review_count, image_url, location
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, ST_SetSRID(ST_MakePoint($4, $3), 4326)) RETURNING *;`;

        const values = [name, description, coords.latitude, coords.longitude, categoryId, street_address, city, state, postal_code, country, phone_number, website, hours, is_halal_certified, 0, 0, imageUrl];

        const result = await db.query(insertQuery, values);
        res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error('Error during request processing:', err.stack);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
 });

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
                phone_number, website, hours, is_halal_certified, average_rating, review_count
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
