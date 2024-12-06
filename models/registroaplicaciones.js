'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RegistroAplicaciones extends Model {
    static associate(models) {
      // define association here, si tienes relaciones con otras tablas, agrégalas aquí
    }
  }

  RegistroAplicaciones.init({
    idCliente: DataTypes.INTEGER,
    idPlaza: DataTypes.INTEGER,
    idPromotor: DataTypes.INTEGER,
    idGrupo: DataTypes.INTEGER,
    idTipoCliente: DataTypes.INTEGER,
    idTipoOperacion: DataTypes.INTEGER,
    idTipoServicio: DataTypes.INTEGER,
    mesAplicado: DataTypes.INTEGER,
    anualAplicado: DataTypes.INTEGER,
    idPeriodo: DataTypes.INTEGER,  // Campo agregado
    anualPeriodo: DataTypes.INTEGER,
    estimulo: DataTypes.DECIMAL,
    ivaCliente: DataTypes.DECIMAL,
    isrPmorales: DataTypes.DECIMAL,
    isrRetencionesSalarios: DataTypes.DECIMAL,
    isrRetencionesAsim: DataTypes.DECIMAL,
    isrRetencionesServ: DataTypes.DECIMAL,
    deal: DataTypes.DECIMAL,
    subtotal: DataTypes.DECIMAL,
    ivaFacturacion: DataTypes.DECIMAL,
    total: DataTypes.DECIMAL,
    porcentajeDsb: DataTypes.DECIMAL,
    montoDsb: DataTypes.DECIMAL,
    porcentajePromotor: DataTypes.DECIMAL,
    montoPromotor: DataTypes.DECIMAL,
    porcentajeProveedor: DataTypes.DECIMAL,
    montoProveedor: DataTypes.DECIMAL,
    ahorro: DataTypes.DECIMAL,
    status: DataTypes.BOOLEAN,
    createdAt: DataTypes.DATE,
    createdAt: DataTypes.DATE
    }, {
    sequelize,
    modelName: 'RegistroAplicaciones',
  });

  return RegistroAplicaciones;
};
