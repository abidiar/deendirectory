const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Service extends Model {
    static associate(models) {
      // Define associations here
      Service.belongsTo(models.Category, {
        foreignKey: 'categoryId',
        as: 'category',
      });
    }
  }

  Service.init(
    {
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
        type: DataTypes.GEOMETRY('POINT'),
        allowNull: false,
      },
      dateAdded: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'date_added',
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id',
        },
        field: 'category_id',
      },
      streetAddress: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'street_address',
        validate: {
          notEmpty: {
            msg: 'Street address is required',
          },
        },
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      postalCode: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'postal_code',
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'phone_number',
      },
      website: DataTypes.STRING,
      hours: DataTypes.STRING,
      isHalalCertified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_halal_certified',
      },
      averageRating: {
        type: DataTypes.DECIMAL(2, 1),
        allowNull: true,
        field: 'average_rating',
      },
      reviewCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'review_count',
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'image_url',
      },
    },
    {
      sequelize,
      modelName: 'Service',
      tableName: 'services',
      timestamps: false,
      underscored: true,
    }
  );

  return Service;
};