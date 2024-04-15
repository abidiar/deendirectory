const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');

class Service extends Model {}

Service.init({
  // Model attributes definition
}, {
  sequelize,
  modelName: 'Service'
  // other model options
});

module.exports = Service;
