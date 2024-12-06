'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class declaraciones extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  declaraciones.init({
    idRegistroApp: DataTypes.INTEGER,
    status: DataTypes.TINYINT,
    recepcionPrevia: DataTypes.DATE,
    fechaElaboracionAviso: DataTypes.DATE,
    folioResponsableSolidario: DataTypes.STRING,
    fechaRecepcionDeclaracion: DataTypes.DATE,
    folioDeclaracion: DataTypes.STRING,
    fechaDeclaracion: DataTypes.STRING,
    fechaAvisoCliente: DataTypes.DATE,
    folioAvisoCliente: DataTypes.STRING,
    opinionCumplimiento: DataTypes.STRING,
    fechaGeneracionOpinionCumplimiento: DataTypes.TEXT,
    fechaEnvioExpediente: DataTypes.DATE,
    fechaElaboracionEscrito: DataTypes.DATE,
    fechaRetornoAvisoFirmado: DataTypes.DATE,
    fechaIngresoAviso: DataTypes.DATE,
    envioPrevia: DataTypes.DATE,
    recepcionAvisoResponsableSolidario: DataTypes.DATE,
    envioDeclaracion: DataTypes.DATE,
    retornoExpediente: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'declaraciones',
  });
  return declaraciones;
};

