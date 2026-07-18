import { featuredPropertyIds, properties as staticProperties, type Property } from '../data/properties';
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
