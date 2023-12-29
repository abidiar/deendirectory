require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

// Trust the proxy to get the real IP address for rate limiting
app.set('trust proxy', true);

// PostgreSQL connection setup
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? {
        rejectUnauthorized: false
    } : false
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all requests
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Basic route for testing
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Versioned API route example
app.get('/api/v1/example', (req, res) => {
    res.json({ message: 'This is an example API endpoint for version 1' });
});

// "New Near You" API Endpoint
app.get('/api/services/new-near-you', async (req, res) => {
    try {
        const { latitude, longitude } = req.query;
        const radius = 40233.6; // 25 miles in meters

        const query = `
            SELECT * FROM services
            WHERE ST_DWithin(
                location,
                ST_MakePoint($1, $2)::GEOGRAPHY,
                $3
            ) AND date_added >= current_date - interval '30 days'
            ORDER BY date_added DESC;
        `;

        const values = [longitude, latitude, radius];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No new services found near you' });
        }

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching new services:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Serve static files from the React app in the 'client' directory
app.use(express.static(path.join(__dirname, '../client/dist')));

// The "catchall" handler: for any request that doesn't
// match the above, send back the frontend's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

// Global error handling middleware
app.use((error, req, res, next) => {
    console.error(error.stack);
    res.status(500).send('Something broke!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
