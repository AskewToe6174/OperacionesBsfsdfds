'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PagosAplicacionesProvedores', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idAplicacion: {
        type: Sequelize.INTEGER
      },
      idProvedor: {
        type: Sequelize.INTEGER
      },
      montoPagado: {
        type: Sequelize.DECIMAL
      },
      idStatusPago: {
        type: Sequelize.INTEGER
      },
      Status: {
        type: Sequelize.BOOLEAN
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
    await queryInterface.dropTable('PagosAplicacionesProvedores');
  }
};