const { Pool } = require('pg');
const Sequelize = require('sequelize');

// Database connection configuration
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      rejectUnauthorized: false
    }
  }
});

// Define the Service model
const Service = sequelize.define('Service', {
  name: Sequelize.STRING,
  description: Sequelize.TEXT,
  latitude: Sequelize.FLOAT,
  longitude: Sequelize.FLOAT,
  location: Sequelize.GEOMETRY('POINT'),
  date_added: Sequelize.DATE,
  category_id: {
    type: Sequelize.INTEGER,
    references: {
      model: 'Categories',
      key: 'id'
    }
  },
  street_address: Sequelize.STRING,
  city: Sequelize.STRING,
  state: Sequelize.STRING,
  postal_code: Sequelize.STRING,
  country: Sequelize.STRING,
  phone_number: Sequelize.STRING,
  website: Sequelize.STRING,
  hours: Sequelize.STRING,
  is_halal_certified: Sequelize.BOOLEAN,
  average_rating: Sequelize.FLOAT,
  review_count: Sequelize.INTEGER,
  image_url: Sequelize.STRING
}, {
  timestamps: false
});

// Define the Category model
const Category = sequelize.define('Category', {
  name: Sequelize.STRING
}, {
  timestamps: false
});

// Define associations between models
Service.belongsTo(Category);

// Synchronize the models with the database
sequelize.sync();

// Export the sequelize instance and models
module.exports = {
  sequelize,
  Service,
  Category
};
