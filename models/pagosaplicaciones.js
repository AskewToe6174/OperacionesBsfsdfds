'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PagosAplicaciones extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PagosAplicaciones.init({
    idAplicacion: DataTypes.INTEGER,
    idPromotor: DataTypes.INTEGER,
    montoPagado: DataTypes.DECIMAL,
    idStatusPago: DataTypes.INTEGER,
    Status: DataTypes.STRING,
    comentarios: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'PagosAplicaciones',
  });
  return PagosAplicaciones;
};