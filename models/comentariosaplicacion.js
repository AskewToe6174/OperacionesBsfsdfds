'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ComentariosAplicacion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ComentariosAplicacion.init({
    idAplicacion: DataTypes.INTEGER,
    Comentario: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ComentariosAplicacion',
  });
  return ComentariosAplicacion;
};