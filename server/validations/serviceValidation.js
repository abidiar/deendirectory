const { body, validationResult } = require('express-validator');
const { Category } = require('../db/sequelize'); // Import the Category model

const validateService = [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').notEmpty().withMessage('Price is required').isFloat().withMessage('Price must be a valid number'),
  body('category_id').notEmpty().withMessage('Category ID is required').isInt().withMessage('Category ID must be a valid integer'),
  body('duration').notEmpty().withMessage('Duration is required').isInt().withMessage('Duration must be a valid integer'),
  body('is_active').notEmpty().withMessage('Is Active is required').isBoolean().withMessage('Is Active must be a valid boolean'),
  // Add validation for additional fields if necessary
  // body('latitude').notEmpty().withMessage('Latitude is required').isFloat().withMessage('Latitude must be a valid number'),
  // body('longitude').notEmpty().withMessage('Longitude is required').isFloat().withMessage('Longitude must be a valid number'),
  // body('street_address').notEmpty().withMessage('Street Address is required'),
  // body('city').notEmpty().withMessage('City is required'),
  // body('state').notEmpty().withMessage('State is required'),
  // body('postal_code').notEmpty().withMessage('Postal Code is required'),
  // body('country').notEmpty().withMessage('Country is required'),
  // body('phone_number').notEmpty().withMessage('Phone Number is required'),
  // body('website').notEmpty().withMessage('Website is required'),
  // body('hours').notEmpty().withMessage('Hours is required'),
  // body('is_halal_certified').notEmpty().withMessage('Is Halal Certified is required').isBoolean().withMessage('Is Halal Certified must be a valid boolean'),
  // body('average_rating').notEmpty().withMessage('Average Rating is required').isFloat().withMessage('Average Rating must be a valid number'),
  // body('review_count').notEmpty().withMessage('Review Count is required').isInt().withMessage('Review Count must be a valid integer'),
  // body('image_url').notEmpty().withMessage('Image URL is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  validateService
};
