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

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/api/v1/example', (req, res) => {
  res.json({ message: 'This is an example API endpoint for version 1' });
});

async function convertZipCodeToCoordinates(location) {
  const apiKey = process.env.OPENCAGE_API_KEY;
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


app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  } else {
    res.status(404).send('API route not found');
  }
});

// GET /api/categories - Fetch all categories
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories;');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

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

app.use((error, req, res, next) => {
  console.error('Unhandled application error:', error);
  res.status(500).send('An error occurred.');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
