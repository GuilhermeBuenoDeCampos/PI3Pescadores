const path = require('path');
const loadEnv = require('../../config/loadEnv');

loadEnv(path.resolve(__dirname, '../../../.env'), { override: true });

const isRemotePostgres = (host) => host && host !== '127.0.0.1' && host !== 'localhost';

const sslOptions = {
  require: true,
  rejectUnauthorized: false,
};

const commonOptions = {
  dialect: 'postgres',
  define: {
    underscored: true,
    freezeTableName: true,
    timestamps: false,
  },
};

function withSsl(config) {
  if (!isRemotePostgres(config.host) && !process.env.DATABASE_URL?.includes('supabase.com')) {
    return config;
  }

  return {
    ...config,
    dialectOptions: {
      ...config.dialectOptions,
      ssl: sslOptions,
    },
  };
}

module.exports = {
  development: withSsl({
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME || 'pescadores_db',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    ...commonOptions,
  }),
  test: withSsl({
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME_TEST || 'pescadores_db_test',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    ...commonOptions,
  }),
  production: withSsl({
    use_env_variable: 'DATABASE_URL',
    ...commonOptions,
  }),
};
