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

// Define the port
const PORT = process.env.PORT || 5000;

// Trust the first proxy when behind a reverse proxy on Render.com
app.set('trust proxy', 1);

// Create a new PostgreSQL pool using connection string from environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

// CORS configuration
app.use(cors({
  origin: 'https://deendirectory.onrender.com',
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

// Utility function to reverse geocode using OpenCage API
async function reverseGeocode(latitude, longitude) {
  const apiKey = process.env.OPENCAGE_API_KEY;
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.results.length > 0) {
      return data.results[0].formatted; // or any other format you need
    } else {
      return null; // No location found
    }
  } catch (error) {
    console.error('Error in reverse geocoding:', error);
    return null;
  }
}

// Utility function to directly fetch coordinates from OpenCage API
async function fetchCoordinatesFromOpenCage(location) {
  const apiKey = process.env.OPENCAGE_API_KEY;
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.results.length > 0 && data.results[0].geometry) {
      return {
        latitude: data.results[0].geometry.lat,
        longitude: data.results[0].geometry.lng
      };
    } else {
      return null; // No coordinates found
    }
  } catch (error) {
    console.error('Error fetching coordinates:', error);
    return null;
  }
}

// API route for the homepage to verify the server is running
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// API route example for version 1
app.get('/api/v1/example', (req, res) => {
  res.json({ message: 'This is an example API endpoint for version 1' });
});

// ... (Other API routes like /api/search, /api/services/new-near-you, /api/business/:id)

app.get('/api/reverse-geocode', async (req, res) => {
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'Latitude and longitude are required.' });
  }

  const locationName = await reverseGeocode(latitude, longitude);
  if (locationName) {
    res.json({ location: locationName });
  } else {
    res.status(404).json({ error: 'Location not found.' });
  }
});

// API route for search
app.get('/api/search', async (req, res) => {
  try {
    const { searchTerm, location } = req.query;

    if (!searchTerm) {
      return res.status(400).json({ message: 'Search term is required' });
    }

    // Adjusted to ensure search works without location
    let searchQuery = 'SELECT * FROM services WHERE name ILIKE $1';
    let values = [`%${searchTerm}%`];

    // Only add location-based search if location is provided
    if (location) {
      const coords = await fetchCoordinatesFromOpenCage(location);
      if (coords) {
        searchQuery += ' AND ST_DWithin(location::GEOGRAPHY, ST_SetSRID(ST_MakePoint($2, $3), 4326)::GEOGRAPHY, $4)';
        values.push(coords.longitude, coords.latitude, 40233.6); // 25 miles in meters
      } else {
        // Provide a clear error message if coordinates can't be fetched
        return res.status(404).json({ message: 'Could not find coordinates for the given location' });
      }
    }

    const result = await pool.query(searchQuery, values);

    if (result.rows.length === 0) {
      return res.status(200).json([]);
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Search error:', error);
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

app.get('/api/services/:id', async (req, res) => {
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
    const ids = req.query.ids;
    let query = 'SELECT * FROM categories';
    let params = [];

    if (ids) {
      query += ' WHERE id = ANY($1::int[])';
      params = [ids.split(',')]; // Split the string by commas and cast each to integer
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
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

app.get('/api/category/:id/services', async (req, res) => {
  const categoryId = parseInt(req.params.id);
  try {
    // Query to select services from the selected category and its subcategories
    const servicesQuery = `
      WITH RECURSIVE subcategories AS (
        SELECT id FROM categories WHERE id = $1
        UNION ALL
        SELECT c.id FROM categories c INNER JOIN subcategories s ON c.parent_category_id = s.id
      )
      SELECT s.* FROM services s INNER JOIN subcategories sc ON s.category_id = sc.id;
    `;

    const servicesResult = await pool.query(servicesQuery, [categoryId]);
    res.json(servicesResult.rows);
  } catch (error) {
    console.error(`Error fetching services for category ${categoryId}:`, error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.get('/api/category/:id/businesses', async (req, res) => {
  const categoryId = parseInt(req.params.id);
  try {
    const query = `
      WITH RECURSIVE subcategories AS (
        SELECT id FROM categories WHERE id = $1
        UNION ALL
        SELECT c.id FROM categories c JOIN subcategories s ON c.parent_category_id = s.id
      )
      SELECT s.* FROM services s JOIN subcategories sc ON s.category_id = sc.id;
    `;
    const result = await pool.query(query, [categoryId]);
    res.json(result.rows);
  } catch (error) {
    console.error(`Error fetching businesses for category ${categoryId}:`, error);
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

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled application error:', error);
  res.status(500).send('An error occurred.');
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

// Endpoint to get services by category ID, including services in its subcategories
app.get('/api/category/:id/services', async (req, res) => {
  const categoryId = parseInt(req.params.id);
  try {
    // Query to select services from the selected category and its subcategories
    const servicesQuery = `
      WITH RECURSIVE subcategories AS (
        SELECT id FROM categories WHERE id = $1
        UNION ALL
        SELECT c.id FROM categories c INNER JOIN subcategories s ON c.parent_category_id = s.id
      )
      SELECT s.* FROM services s INNER JOIN subcategories sc ON s.category_id = sc.id;
    `;

    const servicesResult = await pool.query(servicesQuery, [categoryId]);
    res.json(servicesResult.rows);
  } catch (error) {
    console.error(`Error fetching services for category ${categoryId}:`, error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
