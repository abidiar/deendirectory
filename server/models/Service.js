const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Service extends Model {}

  Service.init({
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
        model: 'categories', // Note: This should reference the table name
        key: 'id'
      }
    },
    street_address: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    postal_code: DataTypes.STRING,
    country: DataTypes.STRING,
    phone_number: DataTypes.STRING,
    website: DataTypes.STRING,
    hours: DataTypes.STRING,
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
    image_url: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Service',
    tableName: 'services',
    timestamps: false
  });

  // Define associations within the same file can lead to circular dependency issues.
  // Usually, associations are defined in a separate step, after all models have been imported.

  return Service;
};
