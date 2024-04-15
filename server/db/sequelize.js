const Sequelize = require('sequelize');

// Only require dotenv if DB_HOST is not set (indicating local development)
if (!process.env.DB_HOST) {
  require('dotenv').config();
}

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  logging: console.log,
  define: {
    timestamps: false
  }
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// Define Sequelize models for your tables
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
      model: 'Categories', // Assuming 'Categories' is the name of your Category model
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

module.exports = {
  sequelize,
  Service
};
