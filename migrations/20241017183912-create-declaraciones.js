'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('declaraciones', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idRegistroApp: {
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.TINYINT
      },
      recepcionPrevia: {
        type: Sequelize.DATE
      },
      fechaElaboracionAviso: {
        type: Sequelize.DATE
      },
      folioResponsableSolidario: {
        type: Sequelize.STRING
      },
      fechaRecepcionDeclaracion: {
        type: Sequelize.DATE
      },
      folioDeclaracion: {
        type: Sequelize.STRING
      },
      fechaDeclaracion: {
        type: Sequelize.STRING
      },
      fechaAvisoCliente: {
        type: Sequelize.DATE
      },
      folioAvisoCliente: {
        type: Sequelize.STRING
      },
      opinionCumplimiento: {
        type: Sequelize.STRING
      },
      fechaGeneracionOpinionCumplimiento: {
        type: Sequelize.TEXT
      },
      fechaEnvioExpediente: {
        type: Sequelize.DATE
      },
      fechaElaboracionEscrito: {
        type: Sequelize.DATE
      },
      fechaRetornoAvisoFirmado: {
        type: Sequelize.DATE
      },
      fechaIngresoAviso: {
        type: Sequelize.DATE
      },
      envioPrevia: {
        type: Sequelize.DATE
      },
      recepcionAvisoResponsableSolidario: {
        type: Sequelize.DATE
      },
      envioDeclaracion: {
        type: Sequelize.DATE
      },
      retornoExpediente: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('declaraciones');
  }
};