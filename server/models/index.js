'use strict';

// Replace './path/to/your/sequelize/config' with the actual path to your sequelize configuration file
const { Sequelize } = require('sequelize');
const sequelize = require('../db/sequelize'); // Adjust the path to where your configured sequelize instance is located

// Import models
const Service = require('../models/Service')(sequelize, Sequelize.DataTypes);
const Category = require('../models/Category')(sequelize, Sequelize.DataTypes);

// Define associations
Service.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
});

Category.hasMany(Service, {
  foreignKey: 'category_id',
  as: 'services'
});

// Export the sequelize instance and models
module.exports = {
  sequelize, // the configured sequelize instance
  Sequelize, // the Sequelize class
  Service,
  Category
};
