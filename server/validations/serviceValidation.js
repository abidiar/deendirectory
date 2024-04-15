const { body, validationResult, check } = require('express-validator');
const { Category } = require('../models');

exports.validateService = [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('categoryId').notEmpty().withMessage('Category ID is required')
    .isInt().withMessage('Category ID must be an integer')
    .custom(async (value, { req }) => {
      const categoryExists = await Category.findByPk(value);
      if (!categoryExists) {
        throw new Error('Category ID does not exist');
      }
    }),
  body('street_address').notEmpty().withMessage('Street address is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('state').notEmpty().withMessage('State is required'),
  body('postal_code').notEmpty().withMessage('Postal code is required')
    .matches(/^\d{5}(-\d{4})?$/).withMessage('Invalid postal code format'),
  body('country').notEmpty().withMessage('Country is required'),
  body('phone_number').notEmpty().withMessage('Phone number is required')
    .matches(/^\(\d{3}\)\s\d{3}-\d{4}$/).withMessage('Invalid phone number format'),
  body('website').optional({ checkFalsy: true }).isURL().withMessage('Invalid URL format'),
];