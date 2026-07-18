const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const sequelize = require('../src/libs/sequelize');
const UserService = require('../src/services/user.service');
const { importCatalog } = require('./import-static-properties');

async function seed() {
  await sequelize.sync();

  const userService = new UserService();

  let admin;
  try {
    admin = await userService.register({
      name: 'Admin LM Negocios',
      email: 'admin@lmneg.test',
      password: 'admin123',
      phone: '3434647737',
      role: 'admin',
    });
    await userService.update(admin.id, { role: 'admin' });
    admin = await userService.findOne(admin.id);
    console.log('✅ Usuario admin:', admin.email, '(password: admin123)');
  } catch (error) {
    if (error?.output?.statusCode === 409) {
      admin = await sequelize.models.User.findOne({
        where: { email: 'admin@lmneg.test' },
      });
      console.log('ℹ️  Admin ya existía:', admin?.email);
    } else {
      throw error;
    }
  }

  await importCatalog({ userId: admin?.id || null });
  console.log('Seed completado.');
  process.exit(0);
}

seed().catch((error) => {
  console.error('Seed falló:', error);
  process.exit(1);
});
