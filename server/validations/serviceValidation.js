const { body } = require('express-validator');

exports.validateService = [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('categoryId').notEmpty().withMessage('Category ID is required').isInt().withMessage('Category ID must be an integer'),
  body('street_address').notEmpty().withMessage('Street address is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('state').notEmpty().withMessage('State is required'),
  body('postal_code').notEmpty().withMessage('Postal code is required'),
  body('country').notEmpty().withMessage('Country is required'),
  body('phone_number').notEmpty().withMessage('Phone number is required'),
];