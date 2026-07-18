const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const sequelize = require('../src/libs/sequelize');

async function migrate() {
  console.log('Aplicando cambios de auth (Google) en users…');
  await sequelize.sync({ alter: true });
  console.log('✅ Migración auth completada.');
  process.exit(0);
}

migrate().catch((error) => {
  console.error('Migración falló:', error);
  process.exit(1);
});
