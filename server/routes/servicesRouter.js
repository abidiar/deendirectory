const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db/db'); // Ensure this path is correct
const { convertCityStateToCoords } = require('../utils/locationUtils'); // Ensure this path is correct
const router = express.Router();

router.post('/add', [
    body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
    body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
    body('category').trim().isLength({ min: 1 }).withMessage('Category is required'),
    // Add more validation rules here if needed
], async (req, res) => {
    console.log('Received request body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, category, city, state, /* other fields from req.body */ } = req.body;

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
                name, description, latitude, longitude, category_id
                /* Add other fields here if necessary */
            ) VALUES ($1, $2, $3, $4, $5
                /* Add other placeholders here if necessary */
            ) RETURNING *;
        `;
        const values = [name, description, coords.latitude, coords.longitude, categoryId 
            /* Add other values here if necessary */
        ];
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

module.exports = router;
