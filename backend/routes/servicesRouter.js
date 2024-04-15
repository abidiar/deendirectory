const express = require('express');
const multer = require('multer');
const { validateService } = require('../middlewares/validation');
const { uploadImage, convertCityStateToCoords } = require('../utils');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// POST /api/services/add
router.post('/add', upload.single('image'), validateService, async (req, res) => {
  const { name, description, street_address, city, state, postal_code, categoryId } = req.body;
  let imageUrl = null;

  if (req.file) {
    imageUrl = await uploadImage(req.file).catch(uploadError => {
      logger.error('Error uploading image:', uploadError);
      return res.status(500).json({ error: 'Failed to upload image', details: uploadError.message });
    });
  }

  let coords = await convertCityStateToCoords(city, state);
  if (!coords) {
    logger.error('Failed to convert city and state to coordinates:', { city, state });
    return res.status(400).json({ message: 'Invalid city or state for coordinates' });
  }

  // ... rest of the code

});

module.exports = router;
