const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');

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
            model: 'categories',
            key: 'id'
        }
    }
}, {
    sequelize,
    modelName: 'Category',
    tableName: 'categories',
    timestamps: false // Assuming your table doesn't use Sequelize's automatic timestamp fields
});

module.exports = Category;
