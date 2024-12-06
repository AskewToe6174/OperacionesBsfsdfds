'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Cliente extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Cliente.init({
    idPlaza: DataTypes.INTEGER,
    idPromotor: DataTypes.INTEGER,
    idGrupo: DataTypes.INTEGER,
    idTipoCliente: DataTypes.INTEGER,
    idTipoOperacion: DataTypes.INTEGER,
    idTipoServicio: DataTypes.INTEGER,
    razonSocial: DataTypes.STRING,
    responsableSolidario: DataTypes.STRING, // Añadido aquí
    rfc: DataTypes.STRING,
    status: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Cliente',
  });
  return Cliente;
};
