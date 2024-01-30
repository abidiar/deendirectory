const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db/db');
const { convertCityStateToCoords } = require('../utils/locationUtils');

const router = express.Router();

// Regex for basic US address validation (street, city, state, and ZIP code)
function isValidUSAddress(address) {
    const regex = /^[0-9]{1,6}\s[a-zA-Z0-9\s,'-]{3,40},\s[a-zA-Z\s]{2,20},\s[A-Z]{2}\s[0-9]{5}$/;
    return regex.test(address);
}

router.post('/add', [
    body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
    body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
    body('category').trim().isLength({ min: 1 }).withMessage('Category is required'),
    body('is_halal_certified').optional().isBoolean().withMessage('is_halal_certified must be a boolean'),
    body('phone_number').optional().matches(/^\(\d{3}\) \d{3}-\d{4}$/).withMessage('Phone number must be in the format (XXX) XXX-XXXX'),
    body('postal_code').optional().matches(/^\d{5}(-\d{4})?$/).withMessage('Postal code must be a valid ZIP code (XXXXX or XXXXX-XXXX)'),
    // Add more validation rules here if needed
], async (req, res) => {
    console.log('Received request body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, category, city, state, street_address, postal_code, is_halal_certified/* other fields from req.body */ } = req.body;

    // Validate the street address using the regex function
    const fullAddress = `${street_address}, ${city}, ${state} ${postal_code}`;
    if (!isValidUSAddress(fullAddress)) {
        return res.status(400).json({ message: 'Invalid address format' });
    }

    try {
        // Convert category name to category ID
        const categoryResult = await db.query('SELECT id FROM categories WHERE name = $1', [category]);
        if (categoryResult.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid category name' });
        }
        const categoryId = categoryResult.rows[0].id;

        // Convert city and state to coordinates
        let coords = { latitude: null, longitude: null };
        if (city && state) {
            coords = await convertCityStateToCoords(city, state);
            if (!coords) {
                return res.status(400).json({ message: 'Invalid city or state for coordinates' });
            }
        }

    // SQL query to insert a new service
    const insertQuery = `
        INSERT INTO services (
            name, description, latitude, longitude, category_id, street_address, is_halal_certified
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;
    `;
    const values = [name, description, coords.latitude, coords.longitude, categoryId, street_address, is_halal_certified];
    
    console.log(`Executing query: ${insertQuery}`);
    console.log(`With values: ${values}`);
    
    // Execute the query
    const result = await db.query(insertQuery, values);
    res.status(201).json(result.rows[0]);
} catch (err) {
    console.error('Error during database insertion:', err.stack);
    res.status(500).json({ error: 'Internal server error', details: err.message });
}
});

router.get('/:id', async (req, res) => {
    const businessId = parseInt(req.params.id, 10);
    if (isNaN(businessId)) {
      return res.status(400).json({ error: 'Business ID must be an integer' });
    }
    try {
      // Update the SELECT statement to explicitly specify the columns to return
      const businessQuery = `
        SELECT
          id, name, description, latitude, longitude, location, date_added,
          category_id, street_address, city, state, postal_code, country,
          phone_number, website, hours, is_halal_certified, average_rating, review_count
        FROM services
        WHERE id = $1;
      `;
      const businessResult = await pool.query(businessQuery,
  [businessId]);
  
  if (businessResult.rows.length === 0) {
    return res.status(404).json({ message: 'Business not found' });
  }
  
  // Map the result to include only the necessary fields
  const serviceDetails = {
    id: businessResult.rows[0].id,
    name: businessResult.rows[0].name,
    description: businessResult.rows[0].description,
    latitude: businessResult.rows[0].latitude,
    longitude: businessResult.rows[0].longitude,
    location: businessResult.rows[0].location,
    date_added: businessResult.rows[0].date_added,
    category_id: businessResult.rows[0].category_id,
    street_address: businessResult.rows[0].street_address,
    city: businessResult.rows[0].city,
    state: businessResult.rows[0].state,
    postal_code: businessResult.rows[0].postal_code,
    country: businessResult.rows[0].country,
    phone_number: businessResult.rows[0].phone_number,
    website: businessResult.rows[0].website,
    hours: businessResult.rows[0].hours,
    is_halal_certified: businessResult.rows[0].is_halal_certified,
    average_rating: businessResult.rows[0].average_rating,
    review_count:
  businessResult.rows[0].review_count
  };
  
  res.json(serviceDetails);
  } catch (error) {
  console.error('Error fetching business details:', error);
  res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
  });

module.exports = router;