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

router.post('/add', upload.single('image'), validateService, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      name,
      description,
      categoryId,
      city,
      state,
      streetAddress,
      postalCode,
      country,
      phoneNumber,
      website,
      hours,
      isHalalCertified,
    } = req.body;

    const coords = await convertCityStateToCoords(city, state);
    if (!coords) {
      return res.status(400).json({ message: 'Unable to convert city and state to coordinates' });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadImage(req.file);
    }

    const service = await sequelize.transaction(async (t) => {
      return await Service.create({
        name,
        description,
        latitude: coords.latitude,
        longitude: coords.longitude,
        location: sequelize.fn('ST_MakePoint', coords.longitude, coords.latitude),
        categoryId,
        streetAddress,
        city,
        state,
        postalCode,
        country,
        phoneNumber,
        website,
        hours,
        isHalalCertified,
        image_url: imageUrl,
      }, { transaction: t });
    });

    res.status(201).json(service);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map((err) => ({
        field: err.path,
        message: err.message,
      }));
      res.status(400).json({ errors: validationErrors });
    } else if (error.name === 'SequelizeDatabaseError') {
      // Handle database errors
      logger.error('Database error:', error);
      res.status(500).json({ error: 'Database error', details: 'An error occurred while interacting with the database.' });
    } else {
      // Handle other errors
      logger.error('Internal server error:', error);
      res.status(500).json({ error: 'Internal server error', details: 'An unexpected error occurred.' });
    }
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