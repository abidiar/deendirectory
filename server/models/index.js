const sequelize = require('../db/sequelize');
const Service = require('./Service')(sequelize);

module.exports = {
  Service,
  // other models
};
