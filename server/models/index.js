'use strict';

const { Sequelize } = require('sequelize');
const Service = require('./Service');
const Category = require('./Category');

// Sequelize instance
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  logging: console.log, // Toggle logging with console.log
  define: {
    timestamps: false // Assuming you don't want default timestamps
  }
});

// Test the connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    // Sync all models
    await sequelize.sync();
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

// Import models
const Service = require('./Service')(sequelize, Sequelize.DataTypes);
const Category = require('./Category')(sequelize, Sequelize.DataTypes);

// Define associations
Service.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
});
Category.hasMany(Service, {
  foreignKey: 'category_id',
  as: 'services'
});

module.exports = {
  sequelize, // the Sequelize instance
  Sequelize, // the Sequelize library
  Service,
  Category
};