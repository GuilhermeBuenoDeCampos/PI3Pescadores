'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SessaoUsuario extends Model {
    static associate(models) {
      SessaoUsuario.belongsTo(models.Usuario, {
        as: 'usuario',
        foreignKey: 'usuario_id',
      });
    }
  }

  SessaoUsuario.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      usuario_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      refresh_token_hash: {
        type: DataTypes.STRING(128),
        allowNull: false,
        unique: true,
      },
      user_agent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      ip: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      expira_em: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      revogado_em: {
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
      modelName: 'SessaoUsuario',
      tableName: 'sessoes_usuario',
      timestamps: false,
    }
  );

  return SessaoUsuario;
};
