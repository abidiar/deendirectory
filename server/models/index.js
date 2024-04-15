const sequelize = require('../db/sequelize');
const Service = require('./Service')(sequelize);
const Category = require('./Category')(sequelize);

module.exports = {
  sequelize,
  Service,
  Category,
};