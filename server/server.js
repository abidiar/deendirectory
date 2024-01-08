require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Initialize Express app
const app = express();
const port = process.env.PORT || 5000;

// Trust the first proxy when behind a reverse proxy on Render.com
app.set('trust proxy', 1);

// Create a new PostgreSQL pool using connection string from environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

// CORS configuration
app.use(cors({
  origin: 'https://deendirectory.onrender.com', // Make sure this matches the domain of your frontend application
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

// Security-related HTTP headers
app.use(helmet());

// GZIP compression
app.use(compression());

// HTTP request logger
app.use(morgan('dev'));

// Parse JSON and url-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// API route for the homepage to verify the server is running
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// API route example for version 1
app.get('/api/v1/example', (req, res) => {
  res.json({ message: 'This is an example API endpoint for version 1' });
});

// ... (Other API routes like /api/search, /api/services/new-near-you, /api/business/:id)

app.get('/api/search', async (req, res) => {
  try {
    const { searchTerm, location, latitude, longitude } = req.query;

    if (!searchTerm) {
      return res.status(400).json({ message: 'Search term is required' });
    }

    let coords;
    if (location) {
      coords = await convertZipCodeToCoordinates(location);
    } else if (latitude && longitude) {
      coords = { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
    } else {
      return res.status(400).json({ message: 'Location or coordinates are required' });
    }

    const searchQuery = `
      SELECT * FROM services
      WHERE name ILIKE $1
      ORDER BY date_added DESC;`;
    const values = [`%${searchTerm}%`];

    const result = await pool.query(searchQuery, values);

    if (result.rows.length === 0) {
      return res.status(200).json({ message: 'No results found' });
    }

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.get('/api/services/new-near-you', async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    const radius = 40233.6; // 25 miles in meters

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

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

app.get('/api/business/:id', async (req, res) => {
  const businessId = req.params.id;
  try {
    const businessQuery = 'SELECT * FROM services WHERE id = $1;';
    const businessResult = await pool.query(businessQuery, [businessId]);

    if (businessResult.rows.length === 0) {
      return res.status(404).json({ message: 'Business not found' });
    }

    res.json(businessResult.rows[0]);
  } catch (error) {
    console.error('Error fetching business details:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Endpoint to get all categories with their subcategories
app.get('/api/categories', async (req, res) => {
  try {
    const categoriesResult = await pool.query(`
      SELECT c.id, c.name, c.parent_category_id, 
      COALESCE(json_agg(sc.*) FILTER (WHERE sc.id IS NOT NULL), '[]') as subcategories
      FROM categories c
      LEFT JOIN categories sc ON c.id = sc.parent_category_id
      GROUP BY c.id;
    `);
    res.json(categoriesResult.rows);
  } catch (error) {
    console.error('Error fetching categories with subcategories:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Endpoint to get services by subcategory ID
app.get('/api/services/subcategory/:id', async (req, res) => {
  const subcategoryId = parseInt(req.params.id);
  try {
    const servicesResult = await pool.query(`
      SELECT * FROM services WHERE category_id = $1;
    `, [subcategoryId]);
    res.json(servicesResult.rows);
  } catch (error) {
    console.error('Error fetching services for subcategory:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// ... (Other API routes like /api/services/cleaners, /api/services/babysitters)

app.get('/api/services/cleaners', async (req, res) => {
  try {
    const cleanersQuery = 'SELECT * FROM services WHERE category_id = (SELECT id FROM categories WHERE name = \'Cleaners\');';
    const cleaners = await pool.query(cleanersQuery);

    if (cleaners.rows.length === 0) {
      return res.status(404).json({ message: 'No cleaners found' });
    }

    res.json(cleaners.rows);
  } catch (error) {
    console.error('Error fetching cleaners:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/services/babysitters', async (req, res) => {
  try {
    const babysittersQuery = 'SELECT * FROM services WHERE category_id = (SELECT id FROM categories WHERE name = \'Babysitters\');';
    const babysitters = await pool.query(babysittersQuery);

    if (babysitters.rows.length === 0) {
      return res.status(404).json({ message: 'No babysitters found' });
    }

    res.json(babysitters.rows);
  } catch (error) {
    console.error('Error fetching babysitters:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../client/dist')));

// All other GET requests not handled before will return the React app
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  } else {
    res.status(404).send('API route not found');
  }
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled application error:', error);
  res.status(500).send('An error occurred.');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
