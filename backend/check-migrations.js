const { sequelize } = require('./src/database/models');

async function test() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco\n');
    
    // Ver quais migrações rodaram
    const [migrations] = await sequelize.query(`SELECT * FROM "SequelizeMeta" ORDER BY name`);
    
    console.log('📊 Migrações rodadas:\n');
    migrations.forEach(m => {
      console.log(`  - ${m.name}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
  
  process.exit(0);
}

test();
