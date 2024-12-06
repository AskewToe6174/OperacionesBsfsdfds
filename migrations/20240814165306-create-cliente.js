'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Clientes', {
      idPrimaria: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idPlazaÍndice: {
        type: Sequelize.INTEGER
      },
      idPromotorÍndice: {
        type: Sequelize.INTEGER
      },
      idGrupoÍndice: {
        type: Sequelize.INTEGER
      },
      idTipoClienteÍndice: {
        type: Sequelize.INTEGER
      },
      idTipoOperacionÍndice: {
        type: Sequelize.INTEGER
      },
      idTipoServicioÍndice: {
        type: Sequelize.INTEGER
      },
      razonSocial: {
        type: Sequelize.STRING
      },
      responsableSolidario: {
        type: Sequelize.STRING
      },
      rfc: {
        type: Sequelize.STRING
      },
      status: {
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
    await queryInterface.dropTable('Clientes');
  }
};
