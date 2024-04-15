const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, models) => {
  class Service extends Model {
    static associate(models) {
      // Define association here
      Service.belongsTo(models.Category, {
        foreignKey: 'categoryId',
        as: 'category'
      });
    }
  }

  Service.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
    },
    location: {
      type: DataTypes.GEOGRAPHY('POINT'),
      allowNull: true,
    },
    dateAdded: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'date_added',
    },
    categoryId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'categories',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      field: 'category_id',
    },
    streetAddress: {
      type: DataTypes.STRING,
      field: 'street_address',
    },
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    postalCode: {
      type: DataTypes.STRING,
      field: 'postal_code',
    },
    country: DataTypes.STRING,
    phoneNumber: {
      type: DataTypes.STRING,
      field: 'phone_number',
    },
    website: DataTypes.STRING,
    hours: DataTypes.STRING,
    isHalalCertified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_halal_certified',
    },
    averageRating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      field: 'average_rating',
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'review_count',
    },
    imageUrl: {
      type: DataTypes.STRING,
      field: 'image_url',
    },
  }, {
    sequelize,
    modelName: 'Service',
    tableName: 'services',
    timestamps: false,
    underscored: true,
  });

  return Service;
};