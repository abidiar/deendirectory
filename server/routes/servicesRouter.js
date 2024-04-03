const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const { convertCityStateToCoords } = require('../utils/locationUtils');
const { uploadImage } = require('../utils/imageUpload');
const { Service, Category } = require('../models');
const { validateService } = require('../validations/serviceValidation');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

function isValidUSAddress(address) {
  const regex = /^\d{1,6}\s[a-zA-Z0-9\s,'-]{3,40},\s[a-zA-Z\s]{2,20},\s[A-Z]{2}\s\d{5}$/;
  return regex.test(address);
}

router.post(
  '/add',
  upload.single('image'),
  validateService,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        name,
        description,
        category,
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

      if (!isValidUSAddress(`${street_address}, ${city}, ${state} ${postal_code}`)) {
        return res.status(400).json({ message: 'Invalid address format' });
      }

      const categoryInstance = await Category.findOne({ where: { name: category } });
      if (!categoryInstance) {
        return res.status(400).json({ message: 'Invalid category name' });
      }
      const categoryId = categoryInstance.id;

      let coords = await convertCityStateToCoords(city, state);
      if (!coords) {
        return res.status(400).json({ message: 'Invalid city or state for coordinates' });
      }

      let imageUrl;
      if (req.file) {
        try {
          imageUrl = await uploadImage(req.file);
        } catch (uploadError) {
          logger.error('Error uploading image:', uploadError);
          return res.status(500).json({ error: 'Error uploading image', details: uploadError.message });
        }
      }

      const service = await sequelize.transaction(async (t) => {
        const createdService = await Service.create(
          {
            name,
            description,
            latitude: coords.latitude,
            longitude: coords.longitude,
            category_id: categoryId,
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
          },
          { transaction: t }
        );

        return createdService;
      });

      res.status(201).json(service);
    } catch (error) {
      logger.error('Error during request processing:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
);

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