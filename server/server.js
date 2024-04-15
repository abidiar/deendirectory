if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const express = require('express');
const logger = require('./utils/logger');
const cache = require('./utils/cache');
const { body, validationResult } = require('express-validator');
const { Sequelize, Op } = require('sequelize');
const { sequelize, Service, Category } = require('./models');
const path = require('path');
const setupMiddlewares = require('./middlewares/middlewareSetup');
const servicesRouter = require('./routes/servicesRouter');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { fetchCoordinates } = require('./utils/locationUtils');

// Initialize Express app
const app = express();

// Define the port
const PORT = process.env.PORT || 5000;

// Trust the first proxy when behind a reverse proxy on Render.com
app.set('trust proxy', 1);

// Setup middlewares
setupMiddlewares(app);

// API routes for the homepage and version 1
app.get('/', (req, res) => {
  res.send('Hello World!');
});

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

  // Validate that latitude and longitude are provided
  if (!latitude || !longitude) {
    return res.status(400).json({ message: 'Current location required' });
  }

  try {
    const cacheKey = `search:${JSON.stringify(req.query)}`;
    const cachedResults = await cache.get(cacheKey);

    if (cachedResults) {
      return res.json(cachedResults);
    }

    const whereConditions = {};

    // Text search condition
    if (searchTerm) {
      whereConditions.name = { [Op.iLike]: `%${searchTerm}%` };
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
      whereConditions.isHalalCertified = isHalalCertified === 'true';
    }

    // Location-based search
    const distanceInMeters = 10000; // Define the search radius, e.g., 10km
    const userLocation = sequelize.literal(`ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography`);
    whereConditions.location = sequelize.where(
      sequelize.fn(
        'ST_DWithin',
        sequelize.cast(sequelize.col('location'), 'geography'),
        userLocation,
        distanceInMeters
      ),
      true
    );

    // Sorting logic adjustment
    let order = [];
    if (sort === 'rating') {
      order = [sequelize.literal('"averageRating" DESC')]; // Fixed to use an array
    } else if (sort === 'newest') {
      order = [['dateAdded', 'DESC']];
    } else {
      order = [['name', 'ASC']];
    }

    const { rows: services, count: totalRows } = await Service.findAndCountAll({
      where: whereConditions,
      order,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      attributes: {
        include: [
          [sequelize.literal(`(SELECT COUNT(*) FROM reviews WHERE reviews.business_id = "Service"."id")`), 'reviewCount'],
          [sequelize.literal(`(SELECT AVG(rating) FROM reviews WHERE reviews.business_id = "Service"."id")`), 'averageRating'],
        ],
        exclude: ['location'] // Assuming you're excluding 'location' from the query results
      },
      include: [{
        model: Category,
        as: 'category',
        attributes: ['name'],
      }],
    });

    const responseData = services.map(service => service.get({ plain: true }));

    await cache.set(cacheKey, { data: responseData, totalRows }, 60 * 5); // Cache for 5 minutes

    res.json({ data: responseData, totalRows });
  } catch (error) {
    logger.error('Search API error:', error);
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
          [Op.iLike]: `%${term}%`
        }
      },
      limit: 5 // Adjust limit as needed
    });

    // Search in the Categories table
    const categoriesSuggestions = await Category.findAll({
      attributes: ['name'],
      where: {
        name: {
          [Op.iLike]: `%${term}%`
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

    console.log('Suggestions:', uniqueSuggestions); // Add this line

    res.json(uniqueSuggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.get('/api/services/new-near-you', async (req, res) => {
  try {
    const { latitude, longitude, limit = 5 } = req.query;
    const radius = 40233.6; // 25 miles in meters

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const services = await Service.findAll({
      where: sequelize.where(
        sequelize.fn(
          'ST_DWithin',
          sequelize.cast(sequelize.col('location'), 'geography'),
          sequelize.cast(
            sequelize.fn(
              'ST_SetSRID',
              sequelize.fn('ST_MakePoint', parseFloat(longitude), parseFloat(latitude)),
              4326
            ),
            'geography'
          ),
          radius
        ),
        true
      ),
      order: [['id', 'DESC']],
      limit: parseInt(limit, 10),
    });
    
    if (services.length === 0) {
      return res.status(404).json({ message: 'No new services found near you' });
    }

    res.json(services);
  } catch (error) {
    logger.error('Error fetching new services:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.get('/api/categories/featured', async (req, res) => {
  const featuredCategoryIds = [1, 8, 3, 7, 5];
  const { lat, lng } = req.query;
  const radius = 40233.6; // 25 miles in meters

  try {
    const cacheKey = `featured-categories:${lat}:${lng}`;
    const cachedResults = await cache.get(cacheKey);

    if (cachedResults) {
      return res.json(cachedResults);
    }

    const featuredCategories = await Category.findAll({
      where: { id: featuredCategoryIds },
      attributes: ['id', 'name'],
    });

    if (lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
      const featuredServices = await Service.findAll({
        attributes: ['id', 'name', 'latitude', 'longitude'],
        include: [{
          model: Category,
          as: 'category',
          attributes: [],
          where: { id: featuredCategoryIds },
        }],
        where: sequelize.where(
          sequelize.fn(
            'ST_DWithin',
            sequelize.cast(sequelize.col('location'), 'geography'),
            sequelize.cast(
              sequelize.fn(
                'ST_SetSRID',
                sequelize.fn('ST_MakePoint', parseFloat(lng), parseFloat(lat)),
                4326
              ),
              'geography'
            ),
            radius
          ),
          true
        ),
      });

      const enrichedCategories = featuredCategories.map(category => {
        const services = featuredServices.filter(service => service.categoryId === category.id);
        return {
          ...category.get({ plain: true }),
          services: services.map(service => ({
            id: service.id,
            name: service.name,
            latitude: service.latitude,
            longitude: service.longitude,
          })),
        };
      });

      await cache.set(cacheKey, enrichedCategories, 60 * 10); // Cache for 10 minutes

      res.json(enrichedCategories);
    } else {
      const categoriesWithoutServices = featuredCategories.map(category => ({
        ...category.get({ plain: true }),
        services: [],
      }));

      await cache.set(cacheKey, categoriesWithoutServices, 60 * 10); // Cache for 10 minutes

      res.json(categoriesWithoutServices);
    }
  } catch (error) {
    logger.error('Error fetching featured categories:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.post('/api/businesses', async (req, res) => {
  const {
    name,
    description,
    latitude,
    longitude,
    street_address,
    city,
    state,
    postal_code,
    country,
    phone_number,
    website,
    hours,
    is_halal_certified,
    category_id
  } = req.body;

  try {
    const newBusiness = await Service.create({
      name,
      description,
      latitude,
      longitude,
      street_address,
      city,
      state,
      postal_code,
      country,
      phone_number,
      website,
      hours,
      is_halal_certified,
      category_id
    });

    res.status(201).json(newBusiness);
  } catch (error) {
    console.error('Error adding business:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.get('/api/businesses/search', async (req, res) => {
  const { name, category_id, city, state, postal_code, country, is_halal_certified, page = 1, pageSize = 10 } = req.query;

  try {
    const whereClause = {};

    if (name) {
      whereClause.name = {
        [Op.iLike]: `%${name}%`,
      };
    }

    if (category_id) {
      whereClause.categoryId = category_id; // Ensure this matches your model's foreignKey exactly
    }

    if (city) {
      whereClause.city = {
        [Op.iLike]: `%${city}%`,
      };
    }

    if (state) {
      whereClause.state = {
        [Op.iLike]: `%${state}%`,
      };
    }

    if (postal_code) {
      whereClause.postalCode = postal_code; // Match the naming convention used in your model
    }

    if (country) {
      whereClause.country = {
        [Op.iLike]: `%${country}%`,
      };
    }

    if (is_halal_certified !== undefined) {
      whereClause.isHalalCertified = is_halal_certified === 'true'; // Convert query param to boolean
    }

    // Calculate offset for pagination
    const offset = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);

    // Execute the query with pagination
    const result = await Service.findAndCountAll({
      where: whereClause,
      attributes: [
        'id',
        'name',
        'description',
        'latitude',
        'longitude',
        'street_address',
        'city',
        'state',
        'postal_code',
        'country',
        'phone_number',
        'website',
        'hours',
        'is_halal_certified',
        'average_rating',
        'review_count',
        'image_url',
      ],
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
      ],
      limit: parseInt(pageSize, 10),
      offset: offset,
      order: [['name', 'ASC']], // Example: ordering by name, adjust as needed
    });

    // Format and send the response including pagination data
    res.json({
      currentPage: parseInt(page, 10),
      pageSize: parseInt(pageSize, 10),
      totalCount: result.count,
      totalPages: Math.ceil(result.count / parseInt(pageSize, 10)),
      businesses: result.rows,
    });
  } catch (error) {
    console.error('Error searching for businesses:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
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

app.get('/api/all-categories', async (req, res) => {
  try {
    const categories = await Category.findAll();

    res.json(categories);
  } catch (error) {
    console.error('Error fetching all categories with Sequelize:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.get('/api/categories', async (req, res) => {
  const { ids, lat, lng } = req.query;
  const radius = 40233.6; // Define the radius for proximity search (in meters)

  let idsCondition = '';
  if (ids) {
    const parsedIds = ids.split(',').map(id => parseInt(id, 10)).filter(Number.isFinite);
    if (parsedIds.length > 0) {
      idsCondition = `WHERE c.id IN (${parsedIds.join(',')})`;
    }
  }

  const query = `
    SELECT 
      c.id, 
      c.name, 
      c.parent_category_id
    FROM 
      categories c
    ${idsCondition}
  `;

  try {
    let [rawCategories, metadata] = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT
    });

    let categories;
    if (Array.isArray(rawCategories)) {
      categories = rawCategories;
    } else if (!rawCategories) {
      categories = [];
    } else {
      categories = [rawCategories];
    }

    if (lat && lng && categories.length) {
      const floatLat = parseFloat(lat);
      const floatLng = parseFloat(lng);

      const servicesQuery = `
        SELECT 
          s.id,
          s.name,
          s.description,
          s.latitude,
          s.longitude,
          s.location,
          s.date_added,
          s.category_id,
          s.street_address,
          s.city,
          s.state,
          s.postal_code,
          s.country,
          s.phone_number,
          s.website,
          s.hours,
          s.is_halal_certified,
          s.average_rating,
          s.review_count
        FROM 
          services s
        WHERE 
          s.category_id = ANY(ARRAY[${categories.map(c => c.id).join(',')}])
          AND ST_DWithin(
            ST_MakePoint(s.longitude, s.latitude)::GEOGRAPHY,
            ST_MakePoint(${floatLng}, ${floatLat})::GEOGRAPHY,
            ${radius}
          )
      `;

      const [services, servicesMetadata] = await sequelize.query(servicesQuery, {
        type: sequelize.QueryTypes.SELECT
      });

      let servicesArray = Array.isArray(services) ? services : services ? [services] : [];

      const categoriesWithServices = categories.map(category => ({
        ...category,
        services: servicesArray.filter(service => service.category_id === category.id)
      }));

      res.json(categoriesWithServices);
    } else {
      const servicesQuery = `
        SELECT 
          s.id,
          s.name,
          s.description,
          s.latitude,
          s.longitude,
          s.location,
          s.date_added,
          s.category_id,
          s.street_address,
          s.city,
          s.state,
          s.postal_code,
          s.country,
          s.phone_number,
          s.website,
          s.hours,
          s.is_halal_certified,
          s.average_rating,
          s.review_count
        FROM 
          services s
        WHERE 
          s.category_id = ANY(ARRAY[${categories.map(c => c.id).join(',')}])
      `;

      const [services, servicesMetadata] = await sequelize.query(servicesQuery, {
        type: sequelize.QueryTypes.SELECT
      });

      let servicesArray = Array.isArray(services) ? services : services ? [services] : [];

      const categoriesWithServices = categories.map(category => ({
        ...category,
        services: servicesArray.filter(service => service.category_id === category.id)
      }));

      res.json(categoriesWithServices);
    }
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

  try {
    const cacheKey = `category-services:${categoryId}`;
    const cachedResults = await cache.get(cacheKey);

    if (cachedResults) {
      return res.json(cachedResults);
    }

    const services = await Service.findAll({
      where: { categoryId: categoryId },
      attributes: [
        'id',
        'name',
        'description',
        'latitude',
        'longitude',
        'location',
        'dateAdded',
        'categoryId',
        'streetAddress',
        'city',
        'state',
        'postalCode',
        'country',
        'phoneNumber',
        'website',
        'hours',
        'isHalalCertified',
        [
          sequelize.literal(`(SELECT COUNT(*) FROM reviews WHERE reviews.business_id = Service.id)`),
          'reviewCount',
        ],
        [
          sequelize.literal(`(SELECT AVG(rating) FROM reviews WHERE reviews.business_id = Service.id)`),
          'averageRating',
        ],
      ],
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
      ],
    });

    await cache.set(cacheKey, services, 60 * 10); // Cache for 10 minutes

    res.json(services);
  } catch (error) {
    logger.error(`Error fetching services for category ${categoryId}:`, error);
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

  // Note: you need to have LOCATIONIQ_API_KEY set in your environment
  const apiKey = process.env.LOCATIONIQ_API_KEY;
  const url = `https://us1.locationiq.com/v1/reverse.php?key=${apiKey}&lat=${latitude}&lon=${longitude}&format=json`;

  try {
      const response = await fetch(url);
      const data = await response.json();

      if (data && data.address) {
          const location = `${data.address.road}, ${data.address.city}, ${data.address.state}, ${data.address.postcode}`;
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
    const coords = await fetchCoordinates(location);

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

// Use the API router for services before serving static files
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