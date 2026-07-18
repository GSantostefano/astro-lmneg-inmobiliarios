import { DEFAULT_PROPERTY_IMAGE } from '../data/properties';
import type { Currency, Property } from '../data/properties';

export function formatPrice(price: number, currency: Currency) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function getPropertyBySlug(slug: string, catalog: Property[]) {
  return catalog.find((property) => property.slug === slug);
}

export function getPropertyGalleryImages(property: Property) {
  if (property.galleryImages.length > 0) return property.galleryImages;
  return [property.heroImage || DEFAULT_PROPERTY_IMAGE];
}

export function operationLabel(operation: Property['operation']) {
  const labels: Record<Property['operation'], string> = {
    venta: 'Venta',
    alquiler: 'Alquiler',
    alquiler_temporal: 'Alquiler temporal',
  };
  return labels[operation] ?? operation;
}

export function typeLabel(type: Property['type']) {
  const labels: Record<Property['type'], string> = {
    departamento: 'Departamento',
    casa: 'Casa',
    ph: 'PH',
    duplex: 'Dúplex',
    cochera: 'Cochera',
    terreno: 'Terreno',
    local: 'Local comercial',
  };
  return labels[type] ?? type;
}

export function catalogHasOperation(catalog: Property[], operation: Property['operation']) {
  return catalog.some((p) => p.operation === operation);
}

export function showsRoomMetrics(type: Property['type']) {
  return type !== 'terreno' && type !== 'cochera' && type !== 'local';
}

export function formatPropertyMeta(property: Property) {
  const parts = [`${property.neighborhood}, ${property.city}`];
  if (showsRoomMetrics(property.type) && property.rooms > 0) {
    parts.push(`${property.rooms} amb`);
  }
  if (property.coveredM2 > 0) {
    parts.push(`${property.coveredM2} m²`);
  } else if (property.type === 'terreno' && property.semiCoveredM2 > 0) {
    parts.push(`${property.semiCoveredM2} m²`);
  }
  return parts.join(' · ');
}
