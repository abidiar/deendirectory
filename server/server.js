require('dotenv').config();
const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('./db/db');
const path = require('path');
const setupMiddlewares = require('./middlewares/middlewareSetup');
const servicesRouter = require('./routes/servicesRouter');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { fetchCoordinatesFromGoogle } = require('./utils/locationUtils'); // Adjust the path to where your locationUtils file is located


// Initialize Express app
const app = express();

// Define the port
const PORT = process.env.PORT || 5000;

// Trust the first proxy when behind a reverse proxy on Render.com
app.set('trust proxy', 1);

// Setup middlewares
setupMiddlewares(app);

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
      const radius = 40233.6;  // 25 miles
      searchQuery += ' AND ST_DWithin(location::GEOGRAPHY, ST_SetSRID(ST_MakePoint($2, $3), 4326)::GEOGRAPHY, $4)';
      values.push(longitude, latitude, radius);
    } else if (location) {
      const coords = await fetchCoordinatesFromGoogle(location);
      if (coords) {
        const radius = 40233.6;  // 25 miles
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

// Set featured category IDs
const featuredCategoryIds = [1, 8, 3, 7, 5];

app.get('/api/categories/featured', async (req, res) => {
  const { lat, lng } = req.query;

  // Create query to fetch categories based on fixed IDs and optional location parameters
  let query = `
    SELECT id, name, description, ...
    FROM categories
    WHERE id = ANY($1)
  `;

  const queryParams = [featuredCategoryIds];

  // If latitude and longitude are provided, modify the query to filter based on location
  if (lat && lng) {
    query += `
      AND EXISTS (
        SELECT 1 FROM services
        WHERE services.category_id = categories.id
        AND ST_DWithin(
          services.location::GEOGRAPHY,
          ST_MakePoint($2, $3)::GEOGRAPHY,
          40233.6
        )
      )
    `;
    queryParams.push(parseFloat(lng), parseFloat(lat));
  }

  // Execute the query
  try {
    const result = await pool.query(query, queryParams);
    // Send back the filtered categories
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching featured categories:', error);
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

app.get('/api/categories', async (req, res) => {
  try {
    const { ids, lat, lng } = req.query;
    const radius = 40233.6; // Define the radius for proximity search (in meters)

    let queryParams = [];
    let whereClauses = [];
    let index = 1; // Used for parameter placeholders ($1, $2, etc.)

    let query = `
      SELECT 
        c.id, 
        c.name, 
        c.parent_category_id
    `;

    if (lat && lng) {
      // Add services and location-based filtering only if lat and lng are provided
      query += `,
        COALESCE(json_agg(json_build_object(
          'id', s.id, 
          'name', s.name, 
          'description', s.description,
          'latitude', s.latitude,
          'longitude', s.longitude,
          'location', s.location,
          'date_added', s.date_added,
          'category_id', s.category_id,
          'street_address', s.street_address,
          'city', s.city,
          'state', s.state,
          'postal_code', s.postal_code,
          'country', s.country,
          'phone_number', s.phone_number,
          'website', s.website,
          'hours', s.hours,
          'is_halal_certified', s.is_halal_certified,
          'average_rating', s.average_rating,
          'review_count', s.review_count
        )) FILTER (WHERE s.id IS NOT NULL AND ST_DWithin(
          ST_MakePoint(s.longitude, s.latitude)::GEOGRAPHY,
          ST_MakePoint($${index + 1}, $${index})::GEOGRAPHY,
          $${index + 2}
        )), '[]') AS services
      `;

      queryParams.push(parseFloat(lat), parseFloat(lng), radius);
      index += 3; // Increase the index to account for the added parameters
    } else {
      // If no location is provided, return an empty array for services
      query += `,
        '[]'::json AS services
      `;
    }

    // Continue with the rest of the query
    query += `
      FROM 
        categories c
    `;

    if (lat && lng) {
      // Join with services only if lat and lng are provided
      query += `
      LEFT JOIN 
        services s ON c.id = s.category_id
      `;
    }

    if (ids) {
      // Filtering by category IDs
      const idArray = ids.split(',').map(Number); // Convert to array of numbers
      queryParams.push(idArray);
      whereClauses.push(`c.id = ANY($${index}::int[])`);
      index++;
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    query += `
      GROUP BY c.id
    `;

    const result = await pool.query(query, queryParams);
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

app.get('/api/reverse-geocode', async (req, res) => {
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  const apiKey = process.env.GOOGLE_GEO_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

  try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
          const location = data.results[0].formatted_address;
          res.json({ location });
      } else {
          res.status(404).json({ error: 'Location not found' });
      }
  } catch (error) {
      console.error('Error in reverse geocoding:', error);
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
