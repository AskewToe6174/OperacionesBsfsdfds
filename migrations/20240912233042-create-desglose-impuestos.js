'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('desgloseImpuestos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idRegistro: {
        type: Sequelize.INTEGER
      },
      iva: {
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
    await queryInterface.dropTable('desgloseImpuestos');
  }
};