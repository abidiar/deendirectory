const sequelize = require('../db/sequelize');
const Service = require('./Service')(sequelize);
const Category = require('./Category')(sequelize);

// Set up associations
Object.keys(sequelize.models).forEach((modelName) => {
  if (sequelize.models[modelName].associate) {
    sequelize.models[modelName].associate(sequelize.models);
  }
});

module.exports = {
  sequelize,
  Service,
  Category,
};