'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RegistroPagoPromotor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  RegistroPagoPromotor.init({
    idPromotor: DataTypes.INTEGER,
    idAplicacion: DataTypes.INTEGER,
    montoPagado: DataTypes.DECIMAL,
    remanente: DataTypes.DECIMAL,
    fecha: DataTypes.DATE,
    idStatusPago: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'RegistroPagoPromotor',
  });
  return RegistroPagoPromotor;
};