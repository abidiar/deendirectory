const { body } = require('express-validator');

// Custom validation functions
const isValidAddressComponent = (value) => {
  // Modify regex pattern to allow for more valid characters
  const pattern = /^[a-zA-Z0-9\s.,'-]*$/;
  return pattern.test(value);
};

const serviceValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('address.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required')
    .bail()
    .custom(isValidAddressComponent)
    .withMessage('Invalid street address'),
  body('address.city')
    .trim()
    .notEmpty()
    .withMessage('City is required')
    .bail()
    .custom(isValidAddressComponent)
    .withMessage('Invalid city'),
  body('address.state')
    .trim()
    .notEmpty()
    .withMessage('State is required')
    .bail()
    .custom(isValidAddressComponent)
    .withMessage('Invalid state'),
  body('address.postalCode')
    .trim()
    .notEmpty()
    .withMessage('Postal code is required')
    .bail()
    .custom(isValidAddressComponent)
    .withMessage('Invalid postal code'),
  body('website')
    .optional({ nullable: true }) // Allow website to be optional
    .trim()
    .isURL()
    .withMessage('Invalid website URL'),
  body('hours')
    .optional({ nullable: true }) // Allow hours to be optional
    .isArray()
    .withMessage('Invalid hours format'),
];

module.exports = serviceValidation;
