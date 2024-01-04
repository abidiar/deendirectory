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

const app = express();
const port = process.env.PORT || 5000;

app.set('trust proxy', 1);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

app.use(cors({
  origin: 'https://deendirectory.onrender.com',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Set Cache-Control for API responses
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/api/v1/example', (req, res) => {
  res.json({ message: 'This is an example API endpoint for version 1' });
});

// Function to convert zip code to coordinates using OpenCage
async function convertZipCodeToCoordinates(location) {
  const apiKey = process.env.OPENCAGE_API_KEY; // Your OpenCage API Key
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${apiKey}&limit=1`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry;
      return { latitude: lat, longitude: lng };
    } else {
      throw new Error('No results found for the given location');
    }
  } catch (error) {
    console.error('Error in convertZipCodeToCoordinates:', error);
    throw error;
  }
}

// Search API Endpoint using OpenCage to convert zip code
app.get('/api/search', async (req, res) => {
  try {
    const { searchTerm, location } = req.query;

    // Validate input
    if (!searchTerm || !location) {
      return res.status(400).json({ message: 'Search term and location are required' });
    }

    // Convert zip code to coordinates
    const { latitude, longitude } = await convertZipCodeToCoordinates(location);

    // Construct search query using latitude and longitude
    const searchQuery = `
      SELECT * FROM services
      WHERE name ILIKE $1
      ORDER BY date_added DESC;`;
    const values = [`%${searchTerm}%`];

    const result = await pool.query(searchQuery, values);

    if (result.rows.length === 0) {
      return res.status(200).json({ message: 'No results found' }); // Custom message for no results
    }

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
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

// Business Detail API Endpoint
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

app.use(express.static(path.join(__dirname, '../client/dist')));

// Cache-Control for static files
app.use(express.static(path.join(__dirname, '../client/dist'), {
  setHeaders: (res, path) => {
    if (express.static.mime.lookup(path) === 'text/html') {
      // Custom Cache-Control for HTML files
      res.setHeader('Cache-Control', 'public, max-age=0');
    }
  }
}));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  } else {
    res.status(404).send('API route not found');
  }
});

app.use((error, req, res, next) => {
  console.error('Unhandled application error:', error);
  res.status(500).send('An error occurred.');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
