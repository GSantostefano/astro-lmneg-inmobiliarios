const path = require('path');
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const setupModels = require('../db/models/index');

dotenv.config();

const dialect = (process.env.DB_DIALECT || 'sqlite').toLowerCase();
const logging = process.env.DB_LOG === '1' ? console.log : false;

let sequelize;

if (dialect === 'sqlite') {
  const storage = process.env.DB_PATH || path.join(process.cwd(), 'database.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage,
    logging,
  });
} else if (dialect === 'mysql') {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'lmneg_inmobiliarios',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 3306),
      dialect: 'mysql',
      logging,
      dialectOptions: {
        charset: 'utf8mb4',
      },
      define: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
      },
    },
  );
} else {
  throw new Error(`DB_DIALECT no soportado: ${dialect}. Usá sqlite | mysql`);
}

setupModels(sequelize);

const syncEnabled =
  process.env.DB_SYNC === '1' ||
  (process.env.DB_SYNC !== '0' && process.env.NODE_ENV !== 'production');

if (syncEnabled) {
  sequelize
    .sync()
    .then(() => {
      console.log(`✅ Conexión a la base de datos exitosa (${dialect})`);
    })
    .catch((error) => {
      console.error('Error de conexión a la base de datos:', error);
    });
} else {
  sequelize
    .authenticate()
    .then(() => {
      console.log(`✅ Conexión a la base de datos exitosa (${dialect}, sin sync)`);
    })
    .catch((error) => {
      console.error('Error de conexión a la base de datos:', error);
    });
}

module.exports = sequelize;
module.exports.models = sequelize.models;
