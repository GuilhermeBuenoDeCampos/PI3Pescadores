const path = require('path');
const loadEnv = require('./src/config/loadEnv');

loadEnv(path.resolve(__dirname, '.env'));

const app = require('./src/app');
const db = require('./src/database/models');

const port = Number(process.env.PORT) || 3000;

async function start() {
  await db.sequelize.authenticate();

  app.listen(port, () => {
    console.log(`Backend running on port ${port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start backend');
  console.error(error);
  process.exitCode = 1;
});
