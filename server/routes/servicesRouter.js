const express = require('express');
const { validationResult } = require('express-validator');
const multer = require('multer');
const { convertCityStateToCoords } = require('../utils/locationUtils');
const { uploadToCloudflare } = require('../utils/cloudflareUtils');
const { Service, Category, sequelize } = require('../models');
const { validateService } = require('../validations/serviceValidation');
const { checkBusinessOwnership, sendClaimVerification } = require('../utils/claimUtils'); // These would be utilities you create for claim verification.
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
        imageUrl = await uploadToCloudflare(req.file.buffer, req.file.originalname);
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
        imageUrl: imageUrl, // Update the field name to match the model
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

// Route to initiate a claim
router.post('/claim-business/:id', async (req, res) => {
  const { userId, proof } = req.body; // `userId` is the ID of the user claiming the business. `proof` is whatever proof of ownership the user submits.
  const businessId = req.params.id;

  try {
    // Validate the user's claim
    const isValidClaim = await checkBusinessOwnership(userId, businessId, proof);
    if (!isValidClaim) {
      return res.status(403).json({ message: 'Invalid claim attempt' });
    }

    // Send a claim verification to the business email
    await sendClaimVerification(userId, businessId);
    
    res.status(200).json({ message: 'Claim request received. Please check the business email for verification.' });
  } catch (error) {
    logger.error('Error claiming business:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
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