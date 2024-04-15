const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { uploadImage } = require('../utils/cloudflare');
const logger = require('../utils/logger');
const Service = require('../models/Service');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Route to add a new service
router.post('/', upload.single('image'), async (req, res) => {
  try {
    let imageUrl = null;

    if (req.file) {
      imageUrl = await uploadImage(req.file).catch(uploadError => {
        logger.error('Error uploading image:', uploadError);
        res.status(500).json({ error: 'Failed to upload image', details: uploadError.message });
        return;
      });
    }

    const { name, description, website, hours } = req.body;

    const newService = new Service({
      name,
      description,
      website,
      hours,
      image_url: imageUrl,
    });

    const savedService = await newService.save();

    res.status(201).json(savedService);
  } catch (error) {
    logger.error('Error adding service:', error);
    res.status(500).json({ error: 'Failed to add service', details: error.message });
  }
});

module.exports = router;
