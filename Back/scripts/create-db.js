const path = require('path');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function createDb() {
  const dbName = process.env.DB_NAME || 'lmneg_inmobiliarios';
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  console.log(`✅ Base de datos lista: ${dbName}`);
  await connection.end();
}

createDb().catch((error) => {
  console.error('No se pudo crear la base:', error.message);
  process.exit(1);
});
