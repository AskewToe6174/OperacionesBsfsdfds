'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Facturas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Facturas.init({
    idTipoFactura: DataTypes.INTEGER,
    folioFactura: DataTypes.STRING,
    nombreAFacturar: DataTypes.STRING,
    deal: DataTypes.DECIMAL,
    subtotal: DataTypes.DECIMAL,
    montoIva: DataTypes.DECIMAL,
    totalFactura: DataTypes.DECIMAL,
    idStatus: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Facturas',
  });
  return Facturas;
};