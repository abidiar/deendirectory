const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');

class Service extends Model {}

Service.init({
  // attributes
}, {
  sequelize,
  modelName: 'Service'
  // other options
});

module.exports = Service;
