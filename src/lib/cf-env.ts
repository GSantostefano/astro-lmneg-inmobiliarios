import { env } from 'cloudflare:workers';

/** Variables públicas del Worker (Astro 6+: no usar Astro.locals.runtime.env). */
export type PublicWorkerEnv = {
  PUBLIC_API_URL?: string;
  PUBLIC_WHATSAPP_NUMBER?: string;
  PUBLIC_GOOGLE_CLIENT_ID?: string;
};

export function getWorkerEnv(): PublicWorkerEnv {
  return env as PublicWorkerEnv;
}
