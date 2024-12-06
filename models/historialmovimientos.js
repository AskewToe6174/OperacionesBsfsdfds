'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class HistorialMovimientos extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  HistorialMovimientos.init({
    idCobro: DataTypes.INTEGER,
    fecha: DataTypes.DATE,
    monto: DataTypes.DECIMAL,
    numTransferencia: DataTypes.BIGINT,
    folioComplemento: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'HistorialMovimientos',
  });
  return HistorialMovimientos;
};