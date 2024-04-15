const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { check, validationResult } = require('express-validator');
const { Service } = require('../models');
const { uploadImage } = require('../utils/imageUpload');
const logger = require('../utils/logger');

// Route to add a new service
router.post(
  '/',
  upload.single('image'),
  [
    check('name').trim().notEmpty().withMessage('Name is required'),
    check('description').trim().notEmpty().withMessage('Description is required'),
    check('category').trim().notEmpty().withMessage('Category is required'),
    check('address').trim().notEmpty().withMessage('Address is required'),
    check('city').trim().notEmpty().withMessage('City is required'),
    check('state').trim().notEmpty().withMessage('State is required'),
    check('postalCode').trim().notEmpty().withMessage('Postal code is required'),
    check('website').optional({ nullable: true }).isURL().withMessage('Invalid website URL'),
    check('hours').optional({ nullable: true }).isArray().withMessage('Invalid hours format'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadImage(req.file).catch(uploadError => {
        logger.error('Error uploading image:', uploadError);
        return res.status(500).json({ error: 'Failed to upload image', details: uploadError.message });
      });
    }

    const {
      name,
      description,
      category,
      address,
      city,
      state,
      postalCode,
      website,
      hours,
    } = req.body;

    try {
      const service = await Service.create({
        name,
        description,
        category,
        address,
        city,
        state,
        postalCode,
        website: website || null,
        hours: hours || null,
        image_url: imageUrl,
      });

      res.status(201).json(service);
    } catch (error) {
      logger.error('Failed to create service:', error);
      res.status(500).json({ error: 'Failed to create service', details: error.message });
    }
  }
);

module.exports = router;
