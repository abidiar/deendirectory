const { body } = require('express-validator');

const validateService = [
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
  body('category_id').isInt().withMessage('Category ID must be an integer'),
  body('is_halal_certified').optional().isBoolean(),
  body('phone_number').optional().matches(/^\(\d{3}\) \d{3}-\d{4}$/),
  body('postal_code').optional().matches(/^\d{5}(-\d{4})?$/),
];

module.exports = { validateService };