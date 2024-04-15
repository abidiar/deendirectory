const { body, validationResult } = require('express-validator');

const validateService = [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category_id').notEmpty().withMessage('Category ID is required').isInt().withMessage('Category ID must be a valid integer'),
  body('street_address').optional().isLength({ min: 5 }).withMessage('Street address must be at least 5 characters long'),
  body('city').optional().isAlpha('en-US', { ignore: ' ' }).withMessage('City must contain only letters'),
  body('state').optional().isAlpha('en-US', { ignore: ' ' }).withMessage('State must contain only letters'),
  body('postal_code').optional().isPostalCode('any').withMessage('Postal code must be a valid postal code'),
  body('country').optional().isAlpha('en-US', { ignore: ' ' }).withMessage('Country must contain only letters'),
  body('phone_number').optional().isMobilePhone('any').withMessage('Phone number must be a valid phone number'),
  body('website').optional().isURL().withMessage('Website must be a valid URL'),
  body('hours').optional().isString().withMessage('Hours must be a valid string'),
  body('is_halal_certified').optional().isBoolean().withMessage('Is Halal Certified must be a valid boolean'),
  body('latitude').optional().isFloat().withMessage('Latitude must be a valid float number'),
  body('longitude').optional().isFloat().withMessage('Longitude must be a valid float number'),
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
