const express = require('express');
const { validationResult } = require('express-validator');
const multer = require('multer');
const { convertCityStateToCoords } = require('../utils/locationUtils');
const { uploadImage } = require('../utils/imageUpload');
const { Service, Category, sequelize } = require('../models');
const { validateService } = require('../validations/serviceValidation');
const logger = require('../utils/logger');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

function isValidStreetAddress(streetAddress) {
  const regex = /^\d{1,6}\s[a-zA-Z0-9\s.'-]{3,40}$/;
  return regex.test(streetAddress);
}

function isValidCity(city) {
  const regex = /^[a-zA-Z\s]{2,50}$/;
  return regex.test(city);
}

function isValidState(state) {
  const regex = /^[A-Z]{2}$/;
  return regex.test(state);
}

function isValidPostalCode(postalCode) {
  const regex = /^\d{5}(-\d{4})?$/;
  return regex.test(postalCode);
}

router.post('/add', upload.single('image'), validateService, async (req, res) => {
  logger.info('Received request data:', req.body);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      name,
      description,
      category_id,
      city,
      state,
      street_address,
      postal_code,
      country,
      phone_number,
      website,
      hours,
      is_halal_certified,
    } = req.body;

    // Validate each part of the address
    if (!isValidStreetAddress(street_address)) {
      return res.status(400).json({ message: 'Invalid street address format' });
    }
    if (!isValidCity(city)) {
      return res.status(400).json({ message: 'Invalid city format' });
    }
    if (!isValidState(state)) {
      return res.status(400).json({ message: 'Invalid state format. Use state abbreviations, e.g., NY for New York.' });
    }
    if (!isValidPostalCode(postal_code)) {
      return res.status(400).json({ message: 'Invalid postal code format. Use either 5-digit or zip+4 format.' });
    }

    const categoryInstance = await Category.findByPk(category_id);
    if (!categoryInstance) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    let coords = await convertCityStateToCoords(city, state);
    if (!coords) {
      return res.status(400).json({ message: 'Invalid city or state for coordinates' });
    }

    let imageUrl;
    if (req.file) {
      imageUrl = await uploadImage(req.file).catch(uploadError => {
        logger.error('Error uploading image:', uploadError);
        throw new Error('Error uploading image');
      });
    }

    const service = await sequelize.transaction(async (t) => {
      const createdService = await Service.create({
        name,
        description,
        latitude: coords.latitude,
        longitude: coords.longitude,
        category_id,
        street_address,
        city,
        state,
        postal_code,
        country,
        phone_number,
        website,
        hours,
        is_halal_certified,
        average_rating: 0,
        review_count: 0,
        image_url: imageUrl,
      }, { transaction: t });
      logger.info('Created service:', createdService.get({ plain: true }));
      return createdService;
    });

    res.status(201).json(service);
  } catch (error) {
    logger.error('Error during service creation:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

router.get('/:id', async (req, res) => {
  const businessId = parseInt(req.params.id, 10);
  if (isNaN(businessId)) {
    return res.status(400).json({ error: 'Business ID must be an integer' });
  }

  try {
    const service = await Service.findByPk(businessId, {
      include: [
        {
          model: Category,
          as: 'category',
        },
      ],
    });

    if (!service) {
      return res.status(404).json({ message: 'Business not found' });
    }

    res.json(service);
  } catch (error) {
    logger.error('Error fetching business details:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

module.exports = router;