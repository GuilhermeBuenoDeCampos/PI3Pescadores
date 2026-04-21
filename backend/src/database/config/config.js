module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME || 'pescadores_db',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    define: {
      underscored: true,
      freezeTableName: true,
      timestamps: false,
    },
  },
  test: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME_TEST || 'pescadores_db_test',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    define: {
      underscored: true,
      freezeTableName: true,
      timestamps: false,
    },
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'mysql',
    define: {
      underscored: true,
      freezeTableName: true,
      timestamps: false,
    },
  },
};