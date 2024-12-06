'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TipoOperacion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  TipoOperacion.init({
    nombre: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'TipoOperacion',
  });
  return TipoOperacion;
};