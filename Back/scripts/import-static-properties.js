const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const sequelize = require('../src/libs/sequelize');
const PropertyService = require('../src/services/property.service');
const { loadStaticProperties } = require('./load-static-properties');

async function importCatalog({ userId = null } = {}) {
  const properties = loadStaticProperties();
  const propertyService = new PropertyService();

  let created = 0;
  let skipped = 0;
  let failed = 0;

  console.log(`Importando ${properties.length} propiedades desde src/data/properties.ts...`);

  for (const property of properties) {
    const existing = await sequelize.models.Property.findOne({ where: { slug: property.slug } });
    if (existing) {
      skipped += 1;
      continue;
    }

    try {
      await propertyService.create(property, userId);
      created += 1;
      if (created % 10 === 0 || created === 1) {
        console.log(`  … ${created} creadas`);
      }
    } catch (error) {
      failed += 1;
      console.error(`  ✗ ${property.slug}:`, error?.message || error);
    }
  }

  console.log(`Importación terminada: ${created} creadas, ${skipped} ya existían, ${failed} fallidas.`);
  return { created, skipped, failed, total: properties.length };
}

async function main() {
  await sequelize.sync();

  const admin = await sequelize.models.User.findOne({
    where: { email: 'admin@lmneg.test' },
  });

  await importCatalog({ userId: admin?.id || null });
  process.exit(0);
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Import falló:', error);
    process.exit(1);
  });
}

module.exports = { importCatalog };
