'use strict';

const { Sequelize } = require('sequelize');
const sequelize = require('../db/sequelize'); // Adjust the path to where your configured sequelize instance is located

// Import model definitions as functions
const defineService = require('../models/Service');
const defineCategory = require('../models/Category');

// Initialize models by invoking the imported functions
const Service = defineService(sequelize, Sequelize.DataTypes);
const Category = defineCategory(sequelize, Sequelize.DataTypes);

// Setup associations
const models = {
  Service,
  Category
};

Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Export the sequelize instance and models
module.exports = {
  sequelize, // the configured sequelize instance
  Sequelize, // the Sequelize class
  ...models
};