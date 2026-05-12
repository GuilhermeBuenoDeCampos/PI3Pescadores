module.exports = (sequelize, DataTypes) => {
  const AuditoriaProduto = sequelize.define(
    'AuditoriaProduto',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'produto',
          key: 'id',
        },
      },
      quantidade_sistema: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      quantidade_fisica: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      diferenca: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      acuracidade: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
      },
      usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'auditoria_produto',
      timestamps: false,
    }
  );

  AuditoriaProduto.associate = (models) => {
    AuditoriaProduto.belongsTo(models.Produto, {
      foreignKey: 'product_id',
      as: 'produto',
    });
  };

  return AuditoriaProduto;
};
