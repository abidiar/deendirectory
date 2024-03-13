const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize, models) => {
  class Category extends Model {
    static associate(models) {
      // Define association here
      Category.hasMany(models.Service, {
        foreignKey: 'categoryId',
        as: 'services'
      });
    }
  }

  Category.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    parentCategoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id',
      },
      field: 'parent_category_id',
    },
  }, {
    sequelize,
    modelName: 'Category',
    tableName: 'categories',
    timestamps: false,
    underscored: true,
  });

  return Category;
};