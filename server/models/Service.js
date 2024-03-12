const { Model, DataTypes } = require('sequelize');
const sequelize = require('../sequelize'); // Adjust the path as necessary
const Category = require('./Category');

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
        allowNull: false
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Category,
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
    timestamps: false // Assuming your table doesn't use Sequelize's automatic timestamp fields
});

// Define the relationship
Service.belongsTo(Category, {
    foreignKey: 'category_id',
    as: 'category'
});

module.exports = Service;
