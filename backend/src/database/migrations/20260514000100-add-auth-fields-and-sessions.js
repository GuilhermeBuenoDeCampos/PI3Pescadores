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
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');

    const usuarios = await describeTable(queryInterface, 'usuarios');

    if (!usuarios.senha_hash) {
      await queryInterface.addColumn('usuarios', 'senha_hash', {
        type: Sequelize.STRING(255),
        allowNull: true,
      });
    }

    if (!usuarios.ativo) {
      await queryInterface.addColumn('usuarios', 'ativo', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      });
    }

    if (!usuarios.ultimo_login_em) {
      await queryInterface.addColumn('usuarios', 'ultimo_login_em', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }

    if (!usuarios.id.defaultValue) {
      await queryInterface.changeColumn('usuarios', 'id', {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      });
    }

    const sessoes = await describeTable(queryInterface, 'sessoes_usuario');

    if (!sessoes) {
      await queryInterface.createTable('sessoes_usuario', {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          defaultValue: Sequelize.literal('gen_random_uuid()'),
        },
        usuario_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'usuarios',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        refresh_token_hash: {
          type: Sequelize.STRING(128),
          allowNull: false,
          unique: true,
        },
        user_agent: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        ip: {
          type: Sequelize.STRING(45),
          allowNull: true,
        },
        expira_em: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        revogado_em: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });

      await queryInterface.addIndex('sessoes_usuario', ['usuario_id'], {
        name: 'idx_sessoes_usuario_usuario_id',
      });
      await queryInterface.addIndex('sessoes_usuario', ['refresh_token_hash'], {
        name: 'idx_sessoes_usuario_refresh_token_hash',
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('sessoes_usuario');
    await queryInterface.removeColumn('usuarios', 'ultimo_login_em');
    await queryInterface.removeColumn('usuarios', 'ativo');
    await queryInterface.removeColumn('usuarios', 'senha_hash');
  },
};
