import type { APIRoute } from 'astro';
import { getApiUrl } from '../../../lib/api';
import { getWorkerEnv } from '../../../lib/cf-env';

export const prerender = false;

/**
 * Proxy same-origin → API del túnel.
 * El browser habla solo con el dominio del front; el Worker llama al back.
 */
async function proxy({
  request,
  params,
}: {
  request: Request;
  params: { path?: string | string[] };
}) {
  const base = getApiUrl(getWorkerEnv());
  const parts = Array.isArray(params.path) ? params.path : params.path ? [params.path] : [];
  const path = parts.join('/');
  const search = new URL(request.url).search;
  const target = `${base}/${path}${search}`;

  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  const accept = request.headers.get('accept');
  if (accept) headers.set('accept', accept);
  const authorization = request.headers.get('authorization');
  if (authorization) headers.set('authorization', authorization);

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: 'manual',
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.arrayBuffer();
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, init);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'fetch failed';
    return Response.json(
      {
        ok: false,
        message: `No se pudo hablar con la API (${base}). ¿Están el back y el túnel?`,
        details: message,
      },
      { status: 502 },
    );
  }

  const out = new Headers();
  const upstreamType = upstream.headers.get('content-type');
  if (upstreamType) out.set('content-type', upstreamType);
  if (path.startsWith('uploads/')) {
    out.set('cache-control', 'public, max-age=86400');
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: out,
  });
}

export const ALL: APIRoute = async (context) => proxy(context);
