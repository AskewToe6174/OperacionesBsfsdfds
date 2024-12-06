'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PagosAplicacionesProvedores extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PagosAplicacionesProvedores.init({
    idAplicacion: DataTypes.INTEGER,
    idProvedor: DataTypes.INTEGER,
    montoPagado: DataTypes.DECIMAL,
    idStatusPago: DataTypes.INTEGER,
    Status: DataTypes.BOOLEAN,
    comentarios: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'PagosAplicacionesProvedores',
  });
  return PagosAplicacionesProvedores;
};