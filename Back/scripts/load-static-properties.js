const fs = require('fs');
const path = require('path');

const STATIC_FILE = path.join(__dirname, '../../src/data/properties.ts');

function loadStaticProperties() {
  const source = fs.readFileSync(STATIC_FILE, 'utf8');
  const marker = 'export const properties: Property[] = ';
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error('No se encontró el array properties en src/data/properties.ts');
  }

  const equalsIndex = source.indexOf('=', markerIndex);
  if (equalsIndex === -1) {
    throw new Error('No se pudo parsear el array properties');
  }

  const arrayStart = source.indexOf('[', equalsIndex);

  let depth = 0;
  let arrayEnd = -1;
  for (let i = arrayStart; i < source.length; i += 1) {
    const char = source[i];
    if (char === '[') depth += 1;
    if (char === ']') {
      depth -= 1;
      if (depth === 0) {
        arrayEnd = i + 1;
        break;
      }
    }
  }

  if (arrayEnd === -1) {
    throw new Error('Array properties sin cerrar en src/data/properties.ts');
  }

  const raw = JSON.parse(source.slice(arrayStart, arrayEnd));
  return raw.map(toDbPayload);
}

function toDbPayload(property) {
  return {
    slug: property.slug,
    title: property.title,
    operation: property.operation,
    type: property.type,
    status: property.status,
    price: property.price,
    currency: property.currency,
    neighborhood: property.neighborhood,
    city: property.city,
    coveredM2: property.coveredM2 ?? 0,
    semiCoveredM2: property.semiCoveredM2 ?? 0,
    rooms: property.rooms ?? 0,
    bathrooms: property.bathrooms ?? 0,
    description: property.description,
    features: property.features ?? [],
    heroImage: property.heroImage || '/assets/property-placeholder.png',
    galleryImages: property.galleryImages ?? [],
    refCode: property.refCode,
    tokkoId: property.tokkoId || null,
  };
}

module.exports = { loadStaticProperties, toDbPayload, STATIC_FILE };
