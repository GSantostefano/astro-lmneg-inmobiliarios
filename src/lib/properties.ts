import { DEFAULT_PROPERTY_IMAGE, featuredPropertyIds, properties } from '../data/properties';
import type { Currency, Property } from '../data/properties';

export function formatPrice(price: number, currency: Currency) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function getPropertyBySlug(slug: string) {
  return properties.find((property) => property.slug === slug);
}

export function getFeaturedProperties() {
  return properties.filter((property) => featuredPropertyIds.includes(property.id));
}

export function getPropertyGalleryImages(property: Property) {
  if (property.galleryImages.length > 0) return property.galleryImages;
  return [property.heroImage || DEFAULT_PROPERTY_IMAGE];
}

export function operationLabel(operation: Property['operation']) {
  return operation === 'venta' ? 'Venta' : 'Alquiler';
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

export function catalogHasOperation(operation: Property['operation']) {
  return properties.some((p) => p.operation === operation);
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
