const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const sequelize = require('../src/libs/sequelize');

async function migrate() {
  console.log('Aplicando columnas de ubicación en properties…');
  await sequelize.sync({ alter: true });
  console.log('✅ Migración ubicación completada.');
  process.exit(0);
}

migrate().catch((error) => {
  console.error('Migración falló:', error);
  process.exit(1);
});
