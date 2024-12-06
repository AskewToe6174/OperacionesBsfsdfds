'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PagosAplicaciones', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idAplicacion: {
        type: Sequelize.INTEGER
      },
      idPromotor: {
        type: Sequelize.INTEGER
      },
      montoPagado: {
        type: Sequelize.DECIMAL
      },
      idStatusPago: {
        type: Sequelize.INTEGER
      },
      Status: {
        type: Sequelize.STRING
      },
      comentarios: {
        type: Sequelize.TEXT
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
    await queryInterface.dropTable('PagosAplicaciones');
  }
};