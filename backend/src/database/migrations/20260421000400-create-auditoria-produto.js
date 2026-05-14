'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('auditoria_produto', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      product_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'produto',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      quantidade_sistema: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      quantidade_fisica: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      diferenca: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      acuracidade: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      usuario_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('auditoria_produto', ['product_id'], {
      name: 'idx_auditoria_produto_product_id',
    });
    await queryInterface.addIndex('auditoria_produto', ['usuario_id'], {
      name: 'idx_auditoria_produto_usuario_id',
    });
    await queryInterface.addIndex('auditoria_produto', ['created_at'], {
      name: 'idx_auditoria_produto_created_at',
    });

    await queryInterface.addConstraint('auditoria_produto', {
      fields: ['quantidade_sistema'],
      type: 'check',
      name: 'chk_auditoria_produto_quantidade_sistema_non_negative',
      where: {
        quantidade_sistema: {
          [Sequelize.Op.gte]: 0,
        },
      },
    });

    await queryInterface.addConstraint('auditoria_produto', {
      fields: ['quantidade_fisica'],
      type: 'check',
      name: 'chk_auditoria_produto_quantidade_fisica_non_negative',
      where: {
        quantidade_fisica: {
          [Sequelize.Op.gte]: 0,
        },
      },
    });

    await queryInterface.addConstraint('auditoria_produto', {
      fields: ['acuracidade'],
      type: 'check',
      name: 'chk_auditoria_produto_acuracidade_range',
      where: {
        acuracidade: {
          [Sequelize.Op.between]: [0, 100],
        },
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('auditoria_produto');
  },
};
