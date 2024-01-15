require('dotenv').config();
const { body, validationResult } = require('express-validator');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const path = require('path');
const servicesRouter = require('./routes/servicesRouter');
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

// Add this function to convert city and state to coordinates
async function convertCityStateToCoords(city, state) {
  const apiKey = process.env.GOOGLE_GEO_API_KEY;
  const location = `${city}, ${state}`;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      return {
        latitude: parseFloat(data.results[0].geometry.location.lat.toFixed(6)),
        longitude: parseFloat(data.results[0].geometry.location.lng.toFixed(6)),
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error converting city and state to coordinates:', error);
    return null;
  }
}

// Replace fetchCoordinatesFromOpenCage with fetchCoordinatesFromGoogle
async function fetchCoordinatesFromGoogle(location) {
  const apiKey = process.env.GOOGLE_GEO_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      return {
        latitude: parseFloat(data.results[0].geometry.location.lat.toFixed(6)),
        longitude: parseFloat(data.results[0].geometry.location.lng.toFixed(6))
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching coordinates from Google:', error);
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

// API route for search
app.get('/api/search', async (req, res) => {
  try {
    const { searchTerm, location, latitude, longitude } = req.query;
    console.log(`[Search API] searchTerm: ${searchTerm}, location: ${location}, latitude: ${latitude}, longitude: ${longitude}`);

    // Update the SELECT statement to include new fields in the services table
    let searchQuery = `
      SELECT
        id, name, description, latitude, longitude, location, date_added,
        category_id, street_address, city, state, postal_code, country,
        phone_number, website, hours, is_halal_certified, average_rating, review_count
      FROM services
      WHERE name ILIKE $1
    `;
    let values = [`%${searchTerm}%`];

    if (latitude && longitude) {
      const radius = 40233.6;  // Define radius here for proximity search (25 miles)
      searchQuery += ' AND ST_DWithin(location::GEOGRAPHY, ST_SetSRID(ST_MakePoint($2, $3), 4326)::GEOGRAPHY, $4)';
      values.push(longitude, latitude, radius);
    } else if (location) {
      const coords = await fetchCoordinatesFromGoogle(location);
      if (coords) {
        const radius = 40233.6;  // Define radius here for proximity search (25 miles)
        searchQuery += ' AND ST_DWithin(location::GEOGRAPHY, ST_SetSRID(ST_MakePoint($2, $3), 4326)::GEOGRAPHY, $4)';
        values.push(coords.longitude, coords.latitude, radius);
      } else {
        console.error('[Search API] No coordinates found');
        return res.status(404).json({ message: 'Could not find coordinates for the given location' });
      }
    }

    console.log(`[Search API] SQL Query: ${searchQuery}, Values: ${values}`);
    const result = await pool.query(searchQuery, values);

    if (result.rows.length === 0) {
      console.log('[Search API] No results found');
      return res.status(200).json([]);
    }

    // Map the result to include only the necessary fields
    const services = result.rows.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      latitude: service.latitude,
      longitude: service.longitude,
      location: service.location,
      date_added: service.date_added,
      category_id: service.category_id,
      street_address: service.street_address,
      city: service.city,
      state: service.state,
      postal_code: service.postal_code,
      country: service.country,
      phone_number: service.phone_number,
      website: service.website,
      hours: service.hours,
      is_halal_certified: service.is_halal_certified,
      average_rating: service.average_rating,
      review_count: service.review_count
    }));

    res.json(services);
  } catch (error) {
    console.error('[Search API] Search error:', error);
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

    // Update the SELECT statement to include new fields
    const query = `
      SELECT
        id, name, description, latitude, longitude, location, date_added,
        category_id, street_address, city, state, postal_code, country,
        phone_number, website, hours, is_halal_certified, average_rating, review_count
      FROM services
      WHERE ST_DWithin(
        location::GEOGRAPHY,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::GEOGRAPHY,
        $3
      ) AND date_added >= current_date - interval '30 days'
      ORDER BY date_added DESC;
    `;

    const values = [longitude, latitude, radius];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No new services found near you' });
    }

    // Map the result to include only the necessary fields
    const newServices = result.rows.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      latitude: service.latitude,
      longitude
: service.longitude,
location: service.location,
date_added: service.date_added,
category_id: service.category_id,
street_address: service.street_address,
city: service.city,
state: service.state,
postal_code: service.postal_code,
country: service.country,
phone_number: service.phone_number,
website: service.website,
hours: service.hours,
is_halal_certified: service.is_halal_certified === 't', // Assuming the database stores this as a boolean
average_rating: service.average_rating,
review_count: service.review_count
}));

res.json(newServices);
} catch (error) {
console.error('Error fetching new services:', error);
res.status(500).json({ error: 'Internal Server Error' });
}
});

// Endpoint to add a new service
app.post('/api/services/add', async (req, res) => {
  const {
    name,
    description,
    category_id,
    street_address,
    city,
    state,
    postal_code,
    country,
    phone_number,
    website,
    hours,
    is_halal_certified
  } = req.body;

  // Convert city and state to coordinates if provided
  let coords = { latitude: null, longitude: null };
  if (city && state) {
    coords = await convertCityStateToCoords(city, state);
    if (!coords) {
      console.error('[Add Service API] Invalid city or state for coordinates');
      return res.status(400).json({ message: 'Invalid city or state' });
    }
  }

  try {
    const insertQuery = `
      INSERT INTO services (
        name, description, latitude, longitude, location, date_added,
        category_id, street_address, city, state, postal_code,
        country, phone_number, website, hours, is_halal_certified
      )
      VALUES (
        $1, $2, $3, $4, ST_SetSRID(ST_MakePoint($3, $4), 4326),
        NOW(), $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
      )
      RETURNING *;
    `;
    const values = [
      name, description, coords.latitude, coords.longitude, category_id,
      street_address, city, state, postal_code, country,
      phone_number, website, hours, is_halal_certified
    ];
    console.log(`[Add Service API] SQL Insert Query: ${insertQuery}, Values: ${values}`);
    const result = await pool.query(insertQuery, values);

    console.log(`[Add Service API] Service added with ID: ${result.rows[0].id}`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('[Add Service API] Error adding service:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.post('/api/users/register', async (req, res) => {
  // Implement user registration logic
});

app.post('/api/reviews/add', async (req, res) => {
  // Implement logic to add a review
  // This should be a function called within the review add/update endpoints
async function updateAverageRating(business_id) {
  // Implement logic to calculate and update the average rating
}
});

app.post('/api/photos/add', async (req, res) => {
  // Implement logic to add a photo
});

app.put('/api/services/:id', async (req, res) => {
  const businessId = req.params.id;
  const {
    name,
    description,
    category_id,
    street_address,
    city,
    state,
    postal_code,
    country,
    phone_number,
    website,
    hours,
    is_halal_certified
    // Add other fields you want to update here
  } = req.body;

  try {
    // Construct the update query dynamically to include only the fields provided in the request
    const fields = [
      { key: 'name', value: name },
      { key: 'description', value: description },
      { key: 'category_id', value: category_id },
      { key: 'street_address', value: street_address },
      { key: 'city', value: city },
      { key: 'state', value: state },
      { key: 'postal_code', value: postal_code },
      { key: 'country', value: country },
      { key: 'phone_number', value: phone_number },
      { key: 'website', value: website },
      { key: 'hours', value: hours },
      { key: 'is_halal_certified', value: is_halal_certified }
      // Add other fields you want to update here
    ].filter(field => field.value !== undefined);

    const updates = fields.map(field => `${field.key} = $${fields.indexOf(field) + 2}`).join(', ');
    const values = fields.map(field => field.value);
    values.unshift(businessId); // Add businessId as the first parameter for the WHERE clause

    if(fields
.length === 0) {
return res.status(400).json({ message: 'No fields to update' });
}

const updateQuery = `
  UPDATE services
  SET ${updates}
  WHERE id = $1
  RETURNING *;
`;

const result = await pool.query(updateQuery, values);

if(result.rowCount === 0) {
  return res.status(404).json({ message: 'Business not found' });
}

res.json(result.rows[0]);
} catch (error) {
console.error('Error updating business details:', error);
res.status(500).json({ error: 'Internal Server Error', details: error.message });
}
});

app.get('/api/services/:id', async (req, res) => {
  const businessId = req.params.id;
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

// Endpoint to get all categories with their subcategories
app.get('/api/categories', async (req, res) => {
  try {
    const ids = req.query.ids;
    let query = `
      SELECT c.id, c.name, c.parent_category_id, 
             array_agg(sc.*) as subcategories
      FROM categories c
      LEFT JOIN categories sc ON c.id = sc.parent_category_id
    `;
    let params = [];

    if (ids) {
      query += ' WHERE c.id = ANY($1::int[]) GROUP BY c.id';
      params = [ids.split(',')];
    } else {
      query += ' GROUP BY c.id';
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
    // Update the SELECT statement to include new fields
    const servicesQuery = `
      SELECT
        id, name, description, latitude, longitude, location, date_added,
        category_id, street_address, city, state, postal_code, country,
        phone_number, website, hours, is_halal_certified, average_rating, review_count
      FROM services
      WHERE category_id = $1;
    `;
    const servicesResult = await pool.query(servicesQuery, [subcategoryId]);

    if (servicesResult.rows.length === 0) {
      return res.status(404).json({ message: 'No services found for this subcategory' });
    }

    res.json(servicesResult.rows);
  } catch (error) {
    console.error('Error fetching services for subcategory:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.get('/api/category/:id/services', async (req, res) => {
  const categoryId = parseInt(req.params.id);
  try {
    // Update the SELECT statement to include new fields
    const servicesQuery = `
      WITH RECURSIVE subcategories AS (
        SELECT id FROM categories WHERE id = $1
        UNION ALL
        SELECT c.id FROM categories c INNER JOIN subcategories s ON c.parent_category_id = s.id
      )
      SELECT
        s.id, s.name, s.description, s.latitude, s.longitude, s.location, s.date_added,
        s.category_id, s.street_address, s.city, s.state, s.postal_code, s.country,
        s.phone_number, s.website, s.hours, s.is_halal_certified, s.average_rating, s.review_count
      FROM services s INNER JOIN subcategories sc ON s.category_id = sc.id;
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
    // Update the SELECT statement to include new fields
    const query = `
      WITH RECURSIVE subcategories AS (
        SELECT id FROM categories WHERE id = $1
        UNION ALL
        SELECT c.id FROM categories c JOIN subcategories s ON c.parent_category_id = s.id
      )
      SELECT
        s.id, s.name, s.description, s.latitude, s.longitude, s.location, s.date_added,
        s.category_id, s.street_address, s.city, s.state, s.postal_code, s.country,
        s.phone_number, s.website, s.hours, s.is_halal_certified, s.average_rating, s.review_count
      FROM services s JOIN subcategories sc ON s.category_id = sc.id;
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

app.use('/api/services', servicesRouter);

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled application error:', error);
  res.status(500).send('An error occurred.');
});

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../client/dist')));

// All other GET requests not handled before will return the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
