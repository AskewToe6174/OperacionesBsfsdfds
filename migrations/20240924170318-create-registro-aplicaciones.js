'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('RegistroAplicaciones', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idCliente: {
        type: Sequelize.INTEGER
      },
      idPlaza: {
        type: Sequelize.INTEGER
      },
      idPromotor: {
        type: Sequelize.INTEGER
      },
      idGrupo: {
        type: Sequelize.INTEGER
      },
      idTipoCliente: {
        type: Sequelize.INTEGER
      },
      idTipoOperacion: {
        type: Sequelize.INTEGER
      },
      idTipoServicio: {
        type: Sequelize.INTEGER
      },
      mesAplicado: {
        type: Sequelize.INTEGER
      },
      anualAplicado: {
        type: Sequelize.INTEGER
      },
      idPeriodo: {
        type: Sequelize.INTEGER
      },
      anualPeriodo: {
        type: Sequelize.INTEGER
      },
      estimulo: {
        type: Sequelize.DECIMAL
      },
      ivaCliente: {
        type: Sequelize.DECIMAL
      },
      isrPmorales: {
        type: Sequelize.DECIMAL
      },
      isrRetencionesSalarios: {
        type: Sequelize.DECIMAL
      },
      isrRetencionesAsim: {
        type: Sequelize.DECIMAL
      },
      isrRetencionesServ: {
        type: Sequelize.DECIMAL
      },
      deal: {
        type: Sequelize.DECIMAL
      },
      subtotal: {
        type: Sequelize.DECIMAL
      },
      ivaFacturacion: {
        type: Sequelize.DECIMAL
      },
      total: {
        type: Sequelize.DECIMAL
      },
      porcentajeDsb: {
        type: Sequelize.DECIMAL
      },
      montoDsb: {
        type: Sequelize.DECIMAL
      },
      porcentajePromotor: {
        type: Sequelize.DECIMAL
      },
      montoPromotor: {
        type: Sequelize.DECIMAL
      },
      porcentajeProveedor: {
        type: Sequelize.DECIMAL
      },
      montoProveedor: {
        type: Sequelize.DECIMAL
      },
      ahorro: {
        type: Sequelize.DECIMAL
      },
      status: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('RegistroAplicaciones');
  }
};
