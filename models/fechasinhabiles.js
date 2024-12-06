'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class fechasInhabiles extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  fechasInhabiles.init({
    fecha: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'fechasInhabiles',
  });
  return fechasInhabiles;
};