const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');
const Category = require('./Category'); // If you use this, ensure Category model is exported similarly

module.exports = (sequelize) => {
    class Service extends Model {}

    Service.init({
        // Model attributes are defined here
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  location: {
    type: DataTypes.GEOMETRY('POINT'),
    allowNull: true
  },
  date_added: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categories', // This is a reference to another model
      key: 'id'           // This is the column name of the referenced model
    }
  },
  street_address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true
  },
  postal_code: {
    type: DataTypes.STRING,
    allowNull: true
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: true
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true
  },
  hours: {
    type: DataTypes.STRING,
    allowNull: true
  },
  is_halal_certified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  average_rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  review_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
    sequelize, // This is the sequelize instance that's passed in
    modelName: 'Service',
    tableName: 'services',
    timestamps: false // Assuming your table doesn't use Sequelize's automatic timestamp fields
  });

  return Service; // Return the initialized model
};
// Associations can be defined here. For example:
Service.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category' // This alias is optional, but it helps with readability
});

module.exports = Service;
