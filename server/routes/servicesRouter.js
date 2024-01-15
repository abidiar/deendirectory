const express = require('express');
const { body, validationResult } = require('express-validator');
const { Pool } = require('pg');

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Add additional database configuration as needed
});

const router = express.Router();

// Validation and route for adding a service
router.post('/api/services/add', [
    body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
    body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
    body('category_id').isInt().withMessage('Category ID must be an integer'),
    // Add more validation rules here
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Extract data from request body
    const { name, description, category_id /* Add other fields as needed */ } = req.body;

    // SQL query to insert a new service
    const query = 'INSERT INTO services (name, description, category_id /* Add other fields */) VALUES ($1, $2, $3 /* Add other placeholders */) RETURNING *;';
    const values = [name, description, category_id /* Add other values */];

    // Execute the query
    db.query(query, values)
        .then(result => {
            res.status(201).json(result.rows[0]);
        })
        .catch(err => {
            console.error('Error executing query', err.stack);
            res.status(500).json({ error: 'Internal server error' });
        });
});

module.exports = router;
