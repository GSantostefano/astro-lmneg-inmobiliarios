# Deploy en Cloudflare (LM · negocios inmobiliarios)

Arquitectura: **front SSR en Cloudflare Workers/Pages** + **API Express en tu PC** expuesta con **cloudflared**. El front no llama al back directamente desde el navegador en producción: usa el proxy `/api/bridge` del Worker.

Referencia: proyecto `astro-mimascota` (mismo patrón).

## Requisitos

- Node.js ≥ 22.12
- Cuenta Cloudflare (`npx wrangler login`)
- Back corriendo en `http://localhost:3020` (carpeta `Back/`)
- Túnel hacia el back: `cloudflared tunnel --url http://localhost:3020`

## Variables de entorno

### Worker (`wrangler.toml` → `[vars]`)

| Variable | Uso |
|----------|-----|
| `PUBLIC_API_URL` | URL pública del túnel (trycloudflare o túnel nombrado). El proxy `/api/bridge` la usa en el servidor. |
| `PUBLIC_WHATSAPP_NUMBER` | Número WhatsApp sin `+` (ej. `5493434647737`). Debe coincidir con `src/config/site.ts`. |

Desarrollo local: copiá `.env.example` a `.env` con los mismos nombres.

### Back (`Back/.env`)

| Variable | Uso |
|----------|-----|
| `PUBLIC_BASE_URL` | URL del front desplegado (workers.dev / pages.dev / dominio custom). |
| `CORS_ORIGINS` | Orígenes permitidos separados por coma. Incluir el dominio del front en CF. |

El back ya acepta orígenes `*.workers.dev` y `*.pages.dev` vía helper en `Back/src/app.js`; igual conviene listar el dominio concreto en `CORS_ORIGINS`.

## KV SESSION

El adapter `@astrojs/cloudflare` puede usar KV para sesiones. Crear namespace y pegar el id en `wrangler.toml`:

```bash
npx wrangler kv namespace create SESSION
# Preview (opcional):
npx wrangler kv namespace create SESSION --preview
```

En `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "SESSION"
id = "<id real>"
```

## Build y deploy

```bash
npm install
npm run build
```

### Deploy recomendado (Workers + assets)

Con `wrangler.toml` y `[assets] directory = "./dist"` (como mimascota):

```bash
npx wrangler deploy
```

Tras el deploy, anotá la URL del Worker. **Deploy actual:**

`https://astro-lmneg-inmobiliarios.gabrielsantostefano.workers.dev`

### Alternativa Pages (scripts npm)

```bash
npm run cf:deploy   # wrangler pages deploy ./dist
npm run cf:dev      # wrangler pages dev ./dist
```

Si el build genera `dist/server/wrangler.json`, también podés usar `npx wrangler deploy` desde la raíz con el `wrangler.toml` del proyecto.

## Flujo túnel + redeploy

1. En la PC: `cd Back && npm start` (puerto **3020**).
2. En otra terminal: `cloudflared tunnel --url http://localhost:3020`.
3. Copiá la URL `https://….trycloudflare.com` del túnel.
4. Actualizá:
   - `wrangler.toml` → `PUBLIC_API_URL`
   - `Back/.env` → `PUBLIC_BASE_URL` = URL del front en Cloudflare
5. Redeploy del front: `npm run build && npx wrangler deploy`.
6. Reiniciá el back si cambiaste `.env`.

**Importante:** la URL trycloudflare **cambia** cada vez que reiniciás cloudflared. Actualizá vars y redeploy.

## Proxy `/api/bridge`

En producción, el cliente usa `getBrowserApiUrl()` → `/api/bridge`. El endpoint `src/pages/api/bridge/[...path].ts` reenvía al `PUBLIC_API_URL` del Worker (túnel). Así evitás CORS en el navegador y no exponés la IP local.

## CORS del back

Para visitantes externos, el back debe permitir el origen del front. Ejemplo en `Back/.env`:

```env
CORS_ORIGINS=http://localhost:4321,https://astro-lmneg-inmobiliarios.gabrielsantostefano.workers.dev
PUBLIC_BASE_URL=https://astro-lmneg-inmobiliarios.gabrielsantostefano.workers.dev
```

## Checklist post-deploy

- [ ] Front carga en workers.dev / dominio custom
- [ ] Túnel activo y `PUBLIC_API_URL` actualizada
- [ ] Listado de propiedades carga (API vía bridge)
- [ ] Login admin y formularios de contacto
- [ ] WhatsApp abre con número correcto

## Comandos útiles

```bash
npm run dev              # Astro local (usa .env → back directo)
npm run build            # Genera dist/
npx wrangler deploy      # Deploy Worker + assets
npm run cf:dev           # Preview Pages sobre ./dist
npx wrangler tail        # Logs en vivo del Worker
```
