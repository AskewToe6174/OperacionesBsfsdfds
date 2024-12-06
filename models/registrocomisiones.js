'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class registroComisiones extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  registroComisiones.init({
    fechapago: DataTypes.DATE,
    idComisionista: DataTypes.INTEGER,
    idRegistroAplicacion: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'registroComisiones',
  });
  return registroComisiones;
};