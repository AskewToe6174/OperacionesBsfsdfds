'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CobroAplicaciones extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CobroAplicaciones.init({
    idFactura: DataTypes.INTEGER,
    idRegistro: DataTypes.INTEGER,
    idStatusCobro: DataTypes.INTEGER,
    cobro: DataTypes.DECIMAL,
    pagado: DataTypes.DECIMAL,
    remanente: DataTypes.DECIMAL,
    montoTotal: DataTypes.DECIMAL,
    liberado: DataTypes.BOOLEAN,
    fechaCobro: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'CobroAplicaciones',
  });
  return CobroAplicaciones;
};