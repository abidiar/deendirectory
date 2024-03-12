if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const express = require('express');
const { body, validationResult } = require('express-validator');
// Adjust the path according to your project structure for sequelize and models import
const { sequelize, Service, Category } = require('./models'); 
const path = require('path');
const setupMiddlewares = require('./middlewares/middlewareSetup');
const servicesRouter = require('./routes/servicesRouter');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { fetchCoordinatesFromGoogle } = require('./utils/locationUtils');

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

app.get('/api/search', async (req, res) => {
  const {
    searchTerm = '',
    category,
    isHalalCertified,
    latitude,
    longitude,
    sort = 'relevance',
    page = 1,
    pageSize = 10
  } = req.query;

  try {
    const whereConditions = {};
    const include = [];

    // Text search condition
    if (searchTerm) {
      whereConditions.name = { [sequelize.Op.iLike]: `%${searchTerm}%` };
    }

    // Category filter
    if (category) {
      const categoryInstance = await Category.findOne({ where: { name: category } });
      if (!categoryInstance) {
        return res.status(404).json({ message: 'Category not found' });
      }
      whereConditions.categoryId = categoryInstance.id;
    }

    // Halal certification filter
    if (isHalalCertified !== undefined) {
      whereConditions.isHalalCertified = isHalalCertified;
    }

    let distanceCondition = '';
    let locationAttributes = [];
    // Location-based search
    if (latitude && longitude) {
      const point = sequelize.literal(`ST_SetSRID(ST_Point(${longitude}, ${latitude}), 4326)`);
      const location = sequelize.col('location');
      distanceCondition = sequelize.fn('ST_DistanceSphere', location, point);
      locationAttributes = [
        [distanceCondition, 'distance']
      ];

      // Adding a having clause for distance-based filtering if necessary
      // Example for 10km radius: sequelize.where(distanceCondition, {[sequelize.Op.lte]: 10000})
    }

    // Sorting logic
    let order = [];
    switch (sort) {
      case 'rating':
        order = [['averageRating', 'DESC']];
        break;
      case 'newest':
        order = [['dateAdded', 'DESC']];
        break;
      case 'distance':
        // Ensuring latitude and longitude are provided for distance sort
        if (latitude && longitude) {
          order = sequelize.literal('distance ASC');
        }
        break;
      default:
        // Fallback or default ordering logic
        order = [['name', 'ASC']];
    }

    // Executing the query with filters, sorting, and pagination
    const { rows: services, count: totalRows } = await Service.findAndCountAll({
      where: whereConditions,
      attributes: {
        include: locationAttributes
      },
      include,
      order,
      offset: (page - 1) * pageSize,
      limit: pageSize
    });

    // Adjusting the response data if location-based sorting is used
    const responseData = services.map(service => {
      const serviceData = service.get({ plain: true });
      if (serviceData.distance) {
        // Convert meters to kilometers, if necessary, or adjust the formatting as needed
        serviceData.distance = parseFloat(serviceData.distance).toFixed(2);
      }
      return serviceData;
    });

    res.json({ data: responseData, totalRows });
  } catch (error) {
    console.error('Search API error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});


app.get('/api/suggestions', async (req, res) => {
  const { term } = req.query;

  if (!term) {
    return res.status(400).json({ message: 'Search term is required' });
  }

  try {
    // Search in the Services table
    const servicesSuggestions = await Service.findAll({
      attributes: ['name'],
      where: {
        name: {
          [sequelize.Op.iLike]: `%${term}%`
        }
      },
      limit: 5 // Adjust limit as needed
    });

    // Search in the Categories table
    const categoriesSuggestions = await Category.findAll({
      attributes: ['name'],
      where: {
        name: {
          [sequelize.Op.iLike]: `%${term}%`
        }
      },
      limit: 5 // Adjust limit as needed
    });

    // Combine and deduplicate suggestions
    const combinedSuggestions = [
      ...servicesSuggestions.map(suggestion => suggestion.name),
      ...categoriesSuggestions.map(suggestion => suggestion.name)
    ];

    // Deduplicate names
    const uniqueSuggestions = [...new Set(combinedSuggestions)].slice(0, 10); // Ensuring up to 10 unique suggestions

    res.json(uniqueSuggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.get('/api/services/new-near-you', async (req, res) => {
  try {
    const { latitude, longitude, limit = 5 } = req.query; // Default limit to 5 if not provided
    const radius = 40233.6; // 25 miles in meters

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const query = `
      SELECT
        id, name, description, latitude, longitude, location, date_added,
        category_id, street_address, city, state, postal_code, country,
        phone_number, website, hours, is_halal_certified, average_rating, review_count
      FROM services
      WHERE ST_DWithin(
        location::GEOGRAPHY,
        ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::GEOGRAPHY,
        :radius
      ) AND date_added >= current_date - interval '30 days'
      ORDER BY date_added DESC
      LIMIT :limit;
    `;

    // Sequelize query to execute raw SQL, with replacements to prevent SQL injection
    const services = await sequelize.query(query, {
      replacements: { latitude, longitude, radius, limit: parseInt(limit, 10) },
      type: sequelize.QueryTypes.SELECT,
      model: Service, // This is optional, allows mapping the raw query results to the model
      mapToModel: true // This is optional as well
    });

    if (services.length === 0) {
      return res.status(404).json({ message: 'No new services found near you' });
    }

    res.json(services);
  } catch (error) {
    console.error('Error fetching new services:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});


app.get('/api/categories/featured', async (req, res) => {
  const featuredCategoryIds = [1, 8, 3, 7, 5];
  const { lat, lng } = req.query;

  try {
    // Initial query to get featured categories without considering location
    const featuredCategories = await Category.findAll({
      where: { id: featuredCategoryIds },
      attributes: ['id', 'name']
    });

    // If latitude and longitude are provided, perform a spatial query
    if (lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
      const locationQuery = `
        SELECT
          c.id,
          json_agg(
            json_build_object(
              'id', s.id,
              'name', s.name,
              'latitude', s.latitude,
              'longitude', s.longitude
            )
          ) FILTER (WHERE s.id IS NOT NULL AND ST_DWithin(
            ST_SetSRID(ST_MakePoint(s.longitude, s.latitude), 4326)::GEOGRAPHY,
            ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::GEOGRAPHY,
            40233.6
          )) AS services
        FROM categories c
        LEFT JOIN services s ON c.id = s.category_id
        WHERE c.id IN (:categoryIds)
        GROUP BY c.id;
      `;

      const featuredServices = await sequelize.query(locationQuery, {
        replacements: { lat, lng, categoryIds: featuredCategoryIds },
        type: sequelize.QueryTypes.SELECT
      });

      // Map the featuredServices to include in the featuredCategories response
      const enrichedCategories = featuredCategories.map(category => {
        const matchingService = featuredServices.find(service => service.id === category.id);
        return {
          ...category.get({ plain: true }),
          services: matchingService ? matchingService.services : []
        };
      });

      res.json(enrichedCategories);
    } else {
      // Respond with categories without location-based services if no lat/lng provided
      const categoriesWithoutServices = featuredCategories.map(category => ({
        ...category.get({ plain: true }),
        services: []
      }));
      res.json(categoriesWithoutServices);
    }
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
  } = req.body;

  try {
    // Use Sequelize's update method
    const [updateCount, updatedRows] = await Service.update({
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
    }, {
      where: { id: businessId },
      returning: true // This option is needed to get the updated rows back
    });

    if (updateCount === 0) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Since `returning: true` returns an array of updated rows, take the first.
    const updatedService = updatedRows[0];
    res.json(updatedService); // Send back the updated service data
  } catch (error) {
    console.error('Error updating business details:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.get('/api/categories', async (req, res) => {
  const { ids, lat, lng } = req.query;
  const radius = 40233.6; // Define the radius for proximity search (in meters)

  let locationCondition = '';
  let idsCondition = '';
  let queryParams = [];

  if (lat && lng) {
      const floatLat = parseFloat(lat);
      const floatLng = parseFloat(lng);
      locationCondition = `, COALESCE(json_agg(json_build_object(
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
          ST_MakePoint(${floatLng}, ${floatLat})::GEOGRAPHY,
          ${radius}
        )), '[]') AS services `;
  }

  if (ids) {
      const idArray = ids.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
      if (idArray.length > 0) {
          idsCondition = `WHERE c.id = ANY(ARRAY[${idArray.join(',')}])`;
      }
  }

  const query = `
      SELECT 
          c.id, 
          c.name, 
          c.parent_category_id
          ${locationCondition}
      FROM 
          categories c
      LEFT JOIN 
          services s ON c.id = s.category_id
      ${idsCondition}
      GROUP BY c.id
  `;

  try {
      const [results, metadata] = await sequelize.query(query, {
          type: sequelize.QueryTypes.SELECT
      });
      res.json(results);
  } catch (error) {
      console.error('Error fetching categories with Sequelize:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Endpoint to get services by subcategory ID
app.get('/api/services/subcategory/:id', async (req, res) => {
  const subcategoryId = parseInt(req.params.id);
  if (isNaN(subcategoryId)) {
    return res.status(400).json({ error: 'Subcategory ID must be a valid number' });
  }

  try {
    const services = await Service.findAll({
      where: { categoryId: subcategoryId },
      attributes: ['id', 'name', 'description', 'latitude', 'longitude', 'location', 'dateAdded', 'categoryId', 'streetAddress', 'city', 'state', 'postalCode', 'country', 'phoneNumber', 'website', 'hours', 'isHalalCertified', 'averageRating', 'reviewCount']
    });

    if (services.length === 0) {
      return res.status(404).json({ message: 'No services found for this subcategory' });
    }

    res.json(services);
  } catch (error) {
    console.error('Error fetching services for subcategory:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.get('/api/category/:id/services', async (req, res) => {
  const categoryId = parseInt(req.params.id);
  if (isNaN(categoryId)) {
    return res.status(400).json({ error: 'Invalid category ID' });
  }

  const query = `
    WITH RECURSIVE subcategories AS (
      SELECT id FROM categories WHERE id = :categoryId
      UNION
      SELECT c.id FROM categories c JOIN subcategories s ON c.parent_category_id = s.id
    )
    SELECT
      s.id, s.name, s.description, s.latitude, s.longitude, s.location, s.date_added,
      s.category_id, s.street_address, s.city, s.state, s.postal_code, s.country,
      s.phone_number, s.website, s.hours, s.is_halal_certified, s.average_rating, s.review_count
    FROM services s
    JOIN subcategories sc ON s.category_id = sc.id;
  `;

  try {
    const servicesResult = await sequelize.query(query, { 
      replacements: { categoryId: categoryId },
      type: sequelize.QueryTypes.SELECT
    });
    res.json(servicesResult);
  } catch (error) {
    console.error(`Error fetching services for category ${categoryId}:`, error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.get('/api/category/:id/businesses', async (req, res) => {
  const categoryId = req.params.id;
  const { lat, lng } = req.query;

  const floatLat = parseFloat(lat);
  const floatLng = parseFloat(lng);
  if (isNaN(floatLat) || isNaN(floatLng)) {
    return res.status(400).json({ error: 'Invalid latitude or longitude' });
  }

  const query = `
    SELECT
      id,
      name,
      description,
      latitude,
      longitude,
      location
    FROM services
    WHERE category_id = :categoryId
    AND ST_DWithin(
      ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::GEOGRAPHY,
      ST_SetSRID(ST_MakePoint(:floatLng, :floatLat), 4326)::GEOGRAPHY,
      40233.6
    )
  `;

  try {
    const result = await sequelize.query(query, {
      replacements: { categoryId: categoryId, floatLat: floatLat, floatLng: floatLng },
      type: sequelize.QueryTypes.SELECT
    });
    res.json(result);
  } catch (error) {
    console.error('Error fetching businesses for category:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
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

// New endpoint for geocoding
app.get('/api/geocode', async (req, res) => {
  const { location } = req.query;

  if (!location) {
    return res.status(400).json({ error: 'Location parameter is required.' });
  }

  try {
    const coords = await fetchCoordinatesFromGoogle(location);

    if (coords) {
      return res.json({ latitude: coords.latitude, longitude: coords.longitude });
    } else {
      return res.status(404).json({ error: 'Coordinates not found for the given location.' });
    }
  } catch (error) {
    console.error('[Geocode API] Error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.use('/api/services', servicesRouter);

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../client/dist')));

// All other GET requests not handled before will return the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled application error:', error);
  res.status(500).json('An error occurred.');
});

// Sync Sequelize models
sequelize.sync().then(() => {
  console.log('Database synced successfully.');
}).catch((error) => {
  console.error('Failed to sync database:', error);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
