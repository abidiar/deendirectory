'use strict';

const { Sequelize } = require('sequelize');
// Adjust the path for sequelize configuration as necessary
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
    define: {
        timestamps: false
    }
});

const ServiceModel = require('./Service');
const CategoryModel = require('./Category');

const Service = ServiceModel(sequelize, Sequelize.DataTypes);
const Category = CategoryModel(sequelize, Sequelize.DataTypes);

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
    sequelize,
    Sequelize,
    Service,
    Category
};
