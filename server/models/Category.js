const { Model, DataTypes } = require('sequelize');

// The require for Service is removed since cyclic dependencies should be handled in the index.js file.

module.exports = (sequelize) => {
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
        model: 'categories', // This is correctly pointing to the table name, not the model
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Category',
    tableName: 'categories',
    timestamps: false
  });

  // Associations should be defined in index.js to avoid cyclic dependency issues.

  return Category;
};
