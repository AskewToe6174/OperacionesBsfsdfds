'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class desgloseImpuestos extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  desgloseImpuestos.init({
    idRegistro: DataTypes.INTEGER,
    iva: DataTypes.DECIMAL,
    isrPmorales: DataTypes.DECIMAL,
    isrRetencionesSalarios: DataTypes.DECIMAL,
    isrRetencionesAsim: DataTypes.DECIMAL,
    isrRetencionesServ: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'desgloseImpuestos',
  });
  return desgloseImpuestos;
};