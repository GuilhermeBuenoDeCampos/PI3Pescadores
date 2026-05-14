'use strict';

async function describeTable(queryInterface, tableName) {
  try {
    return await queryInterface.describeTable(tableName);
  } catch {
    return null;
  }
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const usuarios = await describeTable(queryInterface, 'usuarios');

    if (usuarios) {
      if (!usuarios.created_at) {
        await queryInterface.addColumn('usuarios', 'created_at', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        });
      }

      if (!usuarios.updated_at) {
        await queryInterface.addColumn('usuarios', 'updated_at', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        });
      }

      if (usuarios.criado_em) {
        await queryInterface.removeColumn('usuarios', 'criado_em');
      }
    }

    const sessoes = await describeTable(queryInterface, 'sessoes_usuario');

    if (sessoes) {
      if (sessoes.criado_em && !sessoes.created_at) {
        await queryInterface.renameColumn('sessoes_usuario', 'criado_em', 'created_at');
      } else if (!sessoes.created_at) {
        await queryInterface.addColumn('sessoes_usuario', 'created_at', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        });
      }

      const refreshed = await describeTable(queryInterface, 'sessoes_usuario');
      if (refreshed && !refreshed.updated_at) {
        await queryInterface.addColumn('sessoes_usuario', 'updated_at', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        });
      }
    }
  },

  async down(queryInterface) {
    const sessoes = await describeTable(queryInterface, 'sessoes_usuario');
    if (sessoes?.updated_at) {
      await queryInterface.removeColumn('sessoes_usuario', 'updated_at');
    }
  },
};
