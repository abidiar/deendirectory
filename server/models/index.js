'use strict';

const { Sequelize } = require('sequelize');
const sequelizeConfig = require('../db/sequelize'); // Adjust the path as necessary

// Import model files
const ServiceModel = require('./Service');
const CategoryModel = require('./Category');

// Initialize models
const Service = ServiceModel(sequelizeConfig, Sequelize.DataTypes);
const Category = CategoryModel(sequelizeConfig, Sequelize.DataTypes);

// Define model associations
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
  sequelize: sequelizeConfig,
  Sequelize,
  Service,
  Category
};