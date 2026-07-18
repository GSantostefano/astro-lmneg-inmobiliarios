type EnvLike = { PUBLIC_API_URL?: string } | undefined;

function normalizeBase(url: string) {
  return String(url).trim().replace(/\/$/, '');
}

function isLocalApi(url: string) {
  return /localhost|127\.0\.0\.1/i.test(url);
}

/**
 * En producción nunca preferimos localhost: el browser del visitante no puede
 * llegar a tu PC. Si el runtime de Cloudflare trae localhost, lo ignoramos.
 */
export function getApiUrl(env?: EnvLike) {
  const fromRuntime = env?.PUBLIC_API_URL ? normalizeBase(env.PUBLIC_API_URL) : '';
  const fromMeta = import.meta.env.PUBLIC_API_URL
    ? normalizeBase(String(import.meta.env.PUBLIC_API_URL))
    : '';
  const fallback = 'http://localhost:3020';

  if (import.meta.env.PROD) {
    if (fromRuntime && !isLocalApi(fromRuntime)) return fromRuntime;
    if (fromMeta && !isLocalApi(fromMeta)) return fromMeta;
    return fromRuntime || fromMeta || fallback;
  }

  return fromRuntime || fromMeta || fallback;
}

/**
 * URL que usa el browser. En producción va por el proxy del Worker
 * (`/api/bridge`) para no depender de trycloudflare en la red del visitante.
 */
export function getBrowserApiUrl() {
  if (import.meta.env.PROD) return '/api/bridge';
  return getApiUrl();
}

/** Reescribe URLs de media del túnel para servirlas via el proxy del front. */
export function toBrowserMediaUrl(url?: string | null) {
  if (!url) return '/assets/property-placeholder.png';
  if (url.startsWith('/assets/')) return url;
  if (url.startsWith('/propiedades/')) return url;
  if (url.startsWith('/uploads/')) return `/api/bridge${url}`;
  if (url.startsWith('/api/bridge/')) return url;

  try {
    const parsed = new URL(url);
    if (parsed.pathname.startsWith('/uploads/')) {
      return `/api/bridge${parsed.pathname}`;
    }
  } catch {
    // ignore invalid URLs
  }

  return url;
}

export type ApiProperty = {
  id: number;
  slug: string;
  title: string;
  operation: 'venta' | 'alquiler' | 'alquiler_temporal';
  type: 'departamento' | 'casa' | 'ph' | 'duplex' | 'cochera' | 'terreno' | 'local';
  status: 'disponible' | 'reservada' | 'alquilada' | 'vendida';
  price: number;
  currency: 'USD' | 'ARS';
  neighborhood: string;
  city: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  mapUrl?: string | null;
  coveredM2: number;
  semiCoveredM2: number;
  rooms: number;
  bathrooms: number;
  description: string;
  features: string[];
  heroImage?: string | null;
  galleryImages: string[];
  refCode: string;
  tokkoId?: string | null;
  userId?: number | null;
};

export type ApiUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  avatarUrl?: string | null;
  googleId?: string | null;
};

export type ManagedProperty = ReturnType<typeof normalizeProperty>;

function normalizeProperty(property: ApiProperty) {
  const gallery = (property.galleryImages || []).map((img) => toBrowserMediaUrl(img));
  const publicId = property.tokkoId ? `prop-${property.tokkoId}` : `prop-${property.id}`;

  return {
    ...property,
    id: publicId,
    dbId: property.id,
    tokkoId: property.tokkoId || '',
    heroImage: toBrowserMediaUrl(property.heroImage || '/assets/property-placeholder.png'),
    galleryImages: gallery.length > 0 ? gallery : [toBrowserMediaUrl(property.heroImage)],
    features: property.features || [],
  };
}

export async function fetchProperties(params: Record<string, string> = {}, apiBase?: string) {
  const base = normalizeBase(apiBase || getApiUrl());
  const query = new URLSearchParams(params);
  const url = `${base}/api/properties${query.toString() ? `?${query}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API properties error: ${res.status}`);
  }
  const json = await res.json();
  return (json.data || []).map(normalizeProperty);
}

export async function fetchPropertyById(id: number, apiBase?: string) {
  const base = normalizeBase(apiBase || getApiUrl());
  const res = await fetch(`${base}/api/properties/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`API property error: ${res.status}`);
  }
  const json = await res.json();
  return normalizeProperty(json.data);
}

export async function fetchPropertyBySlug(slug: string, apiBase?: string) {
  const base = normalizeBase(apiBase || getApiUrl());
  const res = await fetch(`${base}/api/properties/slug/${encodeURIComponent(slug)}`);
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`API property error: ${res.status}`);
  }
  const json = await res.json();
  return normalizeProperty(json.data);
}

export async function createProperty(
  payload: Record<string, unknown>,
  token?: string,
  apiBase?: string,
) {
  const base = normalizeBase(apiBase || getApiUrl());
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${base}/api/properties`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || `No se pudo crear la propiedad (${res.status})`);
  }
  return normalizeProperty(json.data);
}

export async function createPropertyWithPhotos(
  formData: FormData,
  token: string,
  apiBase?: string,
) {
  const base = normalizeBase(apiBase || getApiUrl());
  const res = await fetch(`${base}/api/properties`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || `No se pudo crear la propiedad (${res.status})`);
  }
  return normalizeProperty(json.data);
}

export async function fetchMyProperties(
  token: string,
  params: Record<string, string> = {},
  apiBase?: string,
) {
  const base = normalizeBase(apiBase || getApiUrl());
  const query = new URLSearchParams(params);
  const res = await fetch(`${base}/api/users/me/properties${query.toString() ? `?${query}` : ''}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`API mis propiedades error: ${res.status}`);
  }
  const json = await res.json();
  return (json.data || []).map(normalizeProperty);
}

export async function updateProperty(
  id: number,
  payload: Record<string, unknown>,
  token: string,
  apiBase?: string,
) {
  const base = normalizeBase(apiBase || getApiUrl());
  const res = await fetch(`${base}/api/properties/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || `No se pudo actualizar (${res.status})`);
  }
  return normalizeProperty(json.data);
}

export async function updatePropertyWithPhotos(
  id: number,
  formData: FormData,
  token: string,
  apiBase?: string,
) {
  const base = normalizeBase(apiBase || getApiUrl());
  const res = await fetch(`${base}/api/properties/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || `No se pudo actualizar (${res.status})`);
  }
  return normalizeProperty(json.data);
}

export async function deleteProperty(id: number, token: string, apiBase?: string) {
  const base = normalizeBase(apiBase || getApiUrl());
  const res = await fetch(`${base}/api/properties/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || `No se pudo eliminar (${res.status})`);
  }
  return json;
}

export async function loginWithGoogle(credential: string, apiBase?: string) {
  const base = normalizeBase(apiBase || getApiUrl());
  const res = await fetch(`${base}/api/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || `Login con Google falló (${res.status})`);
  }
  return json as { token: string; user: ApiUser };
}

export async function fetchCurrentUser(token: string, apiBase?: string) {
  const base = normalizeBase(apiBase || getApiUrl());
  const res = await fetch(`${base}/api/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Sesión inválida (${res.status})`);
  }
  const json = await res.json();
  return json.user as ApiUser;
}

export async function loginUser(email: string, password: string, apiBase?: string) {
  const base = normalizeBase(apiBase || getApiUrl());
  const res = await fetch(`${base}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || `Login falló (${res.status})`);
  }
  return json as { token: string; user: Record<string, unknown> };
}
