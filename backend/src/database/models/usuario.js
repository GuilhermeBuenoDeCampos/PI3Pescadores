'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    static associate(models) {
      Usuario.hasMany(models.SessaoUsuario, {
        as: 'sessoes',
        foreignKey: 'usuario_id',
      });

      Usuario.hasMany(models.AuditoriaProduto, {
        as: 'auditorias',
        foreignKey: 'usuario_id',
      });
    }
  }

  Usuario.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      nome: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(120),
        allowNull: false,
        unique: true,
      },
      cpf: {
        type: DataTypes.STRING(11),
        allowNull: false,
        unique: true,
      },
      telefone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      senha_hash: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      tipo_usuario: {
        type: DataTypes.ENUM('cliente', 'administrador', 'vendedor'),
        allowNull: false,
        defaultValue: 'cliente',
      },
      ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      ultimo_login_em: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created_at',
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'updated_at',
      },
    },
    {
      sequelize,
      modelName: 'Usuario',
      tableName: 'usuarios',
      timestamps: false,
    }
  );

  return Usuario;
};
