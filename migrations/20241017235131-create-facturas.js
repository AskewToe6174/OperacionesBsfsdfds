'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Facturas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idTipoFactura: {
        type: Sequelize.INTEGER
      },
      folioFactura: {
        type: Sequelize.STRING
      },
      nombreAFacturar: {
        type: Sequelize.STRING
      },
      deal: {
        type: Sequelize.DECIMAL
      },
      subtotal: {
        type: Sequelize.DECIMAL
      },
      montoIva: {
        type: Sequelize.DECIMAL
      },
      totalFactura: {
        type: Sequelize.DECIMAL
      },
      idStatus: {
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable('Facturas');
  }
};