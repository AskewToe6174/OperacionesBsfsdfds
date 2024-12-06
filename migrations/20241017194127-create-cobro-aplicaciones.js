'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CobroAplicaciones', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idFactura: {
        type: Sequelize.INTEGER
      },
      idRegistro: {
        type: Sequelize.INTEGER
      },
      idStatusCobro: {
        type: Sequelize.INTEGER
      },
      cobro: {
        type: Sequelize.DECIMAL
      },
      pagado: {
        type: Sequelize.DECIMAL
      },
      remanente: {
        type: Sequelize.DECIMAL
      },
      montoTotal: {
        type: Sequelize.DECIMAL
      },
      liberado: {
        type: Sequelize.BOOLEAN
      },
      fechaCobro: {
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
    await queryInterface.dropTable('CobroAplicaciones');
  }
};