const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db/db'); // Adjust the path as needed
const { convertCityStateToCoords } = require('../utils/locationUtils'); // Adjust the path as needed

const router = express.Router();

router.post('/add', [
    body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
    body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
    // Add more validation rules as needed
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, category, city, state /* Add other fields as needed */ } = req.body;

    try {
        // Convert category name to category ID
        const categoryResult = await db.query('SELECT id FROM categories WHERE name = $1', [category]);
        if (categoryResult.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid category name' });
        }
        const categoryId = categoryResult.rows[0].id;

        // Convert city and state to coordinates
        let coords = null;
        if (city && state) {
            coords = await convertCityStateToCoords(city, state);
            if (!coords) {
                return res.status(400).json({ message: 'Invalid city or state for coordinates' });
            }
        }

        // Insert the new service
        const insertQuery = `
            INSERT INTO services (name, description, latitude, longitude, category_id /* Add other fields */)
            VALUES ($1, $2, $3, $4, $5 /* Add other placeholders */)
            RETURNING *;
        `;
        const values = [name, description, coords?.latitude, coords?.longitude, categoryId /* Add other values */];

        const result = await db.query(insertQuery, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
