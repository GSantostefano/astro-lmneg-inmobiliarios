import { featuredPropertyIds, heroSliderPropertyIds, properties as staticProperties, type Property } from '../data/properties';
import { fetchPropertyBySlug, fetchProperties } from './api';

export async function loadProperties(apiBase?: string): Promise<Property[]> {
  try {
    return (await fetchProperties({}, apiBase)) as Property[];
  } catch (error) {
    console.warn('[catalog] API no disponible, uso datos estáticos:', error);
    return staticProperties;
  }
}

export async function loadPropertyBySlug(slug: string, apiBase?: string): Promise<Property | null> {
  try {
    const property = await fetchPropertyBySlug(slug, apiBase);
    if (property) return property as Property;
  } catch (error) {
    console.warn('[catalog] API slug falló, busco en estáticos:', error);
  }
  return staticProperties.find((property) => property.slug === slug) ?? null;
}

export async function loadFeaturedProperties(apiBase?: string): Promise<Property[]> {
  const catalog = await loadProperties(apiBase);
  const featured = catalog.filter((property) => featuredPropertyIds.includes(property.id));
  if (featured.length > 0) return featured.slice(0, featuredPropertyIds.length);
  return catalog.filter((p) => p.status === 'disponible').slice(0, 6);
}

/** USD directo; ARS con tipo orientativo solo para ordenar el slider. */
function comparablePrice(property: Property): number {
  if (property.currency === 'USD') return property.price;
  return property.price / 1200;
}

export async function loadTopPricedProperties(apiBase?: string, limit = 6): Promise<Property[]> {
  const catalog = await loadProperties(apiBase);
  return catalog
    .filter((property) => property.status === 'disponible' && property.price > 0)
    .sort((a, b) => comparablePrice(b) - comparablePrice(a))
    .slice(0, limit);
}

export async function loadHeroSliderProperties(apiBase?: string): Promise<Property[]> {
  const catalog = await loadProperties(apiBase);
  const byId = new Map(catalog.map((property) => [property.id, property]));
  const slides = heroSliderPropertyIds
    .map((id) => byId.get(id))
    .filter((property): property is Property => Boolean(property && property.status === 'disponible'));

  if (slides.length > 0) return slides;
  return loadTopPricedProperties(apiBase, 6);
}
