const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');
const Service = require('./Service'); // Make sure to add this if you are going to use the reverse association

class Category extends Model {}

Category.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  parent_category_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'categories', // This is a reference to another model
      key: 'id'           // This is the column name of the referenced model
    }
  }
}, {
  sequelize,
  modelName: 'Category',
  tableName: 'categories',
  timestamps: false // Assuming your table doesn't use Sequelize's automatic timestamp fields
});

// Here's how you could define the association back to the Service if needed
// This sets up a 1:many relationship between categories and services
Category.hasMany(Service, {
  foreignKey: 'category_id',
  as: 'services' // This alias is optional, but it helps with readability
});

module.exports = Category;
