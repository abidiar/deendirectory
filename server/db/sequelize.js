const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  define: {
    // Default options for all models
    freezeTableName: true,
    timestamps: false,
  },
  // other global options
});

module.exports = sequelize;
