import { SITE } from '../config/site';

type LocationParts = {
  address?: string | null;
  neighborhood: string;
  city?: string;
  province?: string;
};

export function buildPropertyMapQuery(
  neighborhood: string,
  city: string = SITE.city,
  province: string = SITE.province,
) {
  return `${neighborhood}, ${city}, ${province}, ${SITE.country}`;
}

export function buildPropertyLocationQuery(parts: LocationParts) {
  const chunks = [
    parts.address?.trim(),
    parts.neighborhood?.trim(),
    parts.city?.trim() || SITE.city,
    parts.province?.trim() || SITE.province,
    SITE.country,
  ].filter(Boolean);
  return chunks.join(', ');
}

export function buildOpenStreetMapSearchUrl(query: string) {
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(query)}`;
}

export function buildOpenStreetMapPinUrl(latitude: number, longitude: number) {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`;
}

export function resolvePropertyMapUrl(parts: LocationParts & {
  mapUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}) {
  const mapUrl = parts.mapUrl?.trim();
  if (mapUrl) return mapUrl;

  const lat = parts.latitude != null ? Number(parts.latitude) : null;
  const lng = parts.longitude != null ? Number(parts.longitude) : null;
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return buildOpenStreetMapPinUrl(lat, lng);
  }

  return buildOpenStreetMapSearchUrl(buildPropertyLocationQuery(parts));
}

export async function geocodeLocation(query: string) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
    { headers: { 'Accept-Language': 'es' } },
  );
  if (!res.ok) return null;
  const results = await res.json();
  const first = results?.[0];
  if (!first) return null;
  const lat = Number(first.lat);
  const lng = Number(first.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng, label: first.display_name as string | undefined };
}

export function formatPropertyLocationLabel(parts: LocationParts) {
  if (parts.address?.trim()) {
    return `${parts.address.trim()}, ${parts.neighborhood}, ${parts.city || SITE.city}`;
  }
  return `${parts.neighborhood}, ${parts.city || SITE.city}`;
}
