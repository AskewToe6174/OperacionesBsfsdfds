'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PagosProveedoresMensuales extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PagosProveedoresMensuales.init({
    idtipooperacion: DataTypes.INTEGER,
    monto: DataTypes.DECIMAL,
    status: DataTypes.BOOLEAN,
    comentarios: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'PagosProveedoresMensuales',
  });
  return PagosProveedoresMensuales;
};