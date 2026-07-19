import heroSlideImages from '../data/heroSlideImages.json';
import { DEFAULT_PROPERTY_IMAGE, type Property } from '../data/properties';

type HeroSlideManifest = Record<string, string>;

/** Imagen HD para el slider (manifest por tokkoId o fallback del catálogo). */
export function getHeroSlideImage(property: Property): string {
  if (property.heroImage?.startsWith('/uploads/') || property.heroImage?.startsWith('http')) {
    return property.heroImage;
  }

  const tokkoId = property.tokkoId || property.id.replace(/^prop-/, '');
  const fromManifest = (heroSlideImages as HeroSlideManifest)[tokkoId];
  if (fromManifest) return fromManifest;

  return property.heroImage || property.galleryImages?.[0] || DEFAULT_PROPERTY_IMAGE;
}
