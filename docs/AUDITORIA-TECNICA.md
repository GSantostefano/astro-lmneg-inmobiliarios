# Auditoría técnica — LM negocios inmobiliarios

**Proyecto:** `astro-lmneg-inmobiliarios`  
**Nota:** Los scripts de migración Tokko viven en `papelera/` (histórico); en `scripts/` solo queda `publish-images-to-public.mjs`.  
**Stack:** Astro 6 (SSG), Tailwind CSS 4, TypeScript strict, Fontsource  
**Alcance:** Código fuente, pipeline de datos/imágenes, UX funcional, preparación para producción  
**Fecha de referencia:** Mayo 2026  
**Nivel:** Revisión de arquitectura y entrega (senior / staff engineer)

---

## 1. Resumen ejecutivo

El sitio es un **catálogo inmobiliario estático** bien encaminado para reemplazar la vitrina Tokko en dominio propio: **51 fichas**, galerías completas, activos **100 % locales** (`/propiedades/{id}/`, fuentes self-hosted), filtros en cliente, CTAs a WhatsApp y marca centralizada en `site.ts`.

**Veredicto:** apto para **staging y piloto en producción** (p. ej. Cloudflare Pages), con deuda técnica **concentrada en datos, formulario de contacto y peso del repositorio**, no en el framework.

| Dimensión | Calificación | Comentario breve |
|-----------|--------------|------------------|
| Arquitectura | B+ | SSG claro; monolito de datos y scripts ad hoc |
| Independencia de Tokko (runtime) | A | Sin CDN Tokko en producción |
| Preparación producción | C+ | Formulario ficticio; sin CI; ~113 MB en `public/` |
| SEO técnico | B | Sitemap, OG, canonical; falta schema y redirects legacy |
| Accesibilidad | B- | Skip link; logo sin `alt`; galerías sin lightbox/foco |
| Mantenibilidad | C+ | `properties.ts` de 2.2k líneas; riesgo al re-ejecutar scripts |
| Seguridad | B (sitio estático) | Superficie baja; formulario engañoso para el usuario |

---

## 2. Contexto y objetivos de negocio

**Objetivo implícito del código:** migrar desde [lmneginmobiliarios.com.ar](https://www.lmneginmobiliarios.com.ar) (Tokko Broker) hacia un sitio **propiedad de la marca**, con catálogo sincronizado históricamente desde Tokko y **fotos servidas desde el propio host**.

**Estado alcanzado:**

- Catálogo en `src/data/properties.ts` (51 propiedades).
- Imágenes en `public/propiedades/` (**812 archivos, ~113 MB**).
- Respaldo de URLs Tokko en `data/scraped/galerias-scrapeadas.json` (fuente de verdad histórica del scrape).
- Toolkit de scripts en `scripts/` para listado, galerías, descarga y publicación.

**No resuelto a nivel producto:** sincronización periódica con Tokko, alquileres en catálogo, formulario real, redirects desde URLs `/p/{id}-...` del sitio viejo, disclaimer legal al pie (como en Tokko).

---

## 3. Arquitectura

### 3.1 Diagrama lógico

```
                    ┌─────────────────────────────────────┐
                    │  Tokko (solo sync / histórico)      │
                    │  HTML listado + fichas data-big     │
                    └──────────────┬──────────────────────┘
                                   │ scripts (manual/CI)
                                   ▼
┌──────────────┐    merge/publish   ┌──────────────────────────────┐
│ data/scraped │ ─────────────────► │ src/data/properties.ts       │
│ galerias-*.  │                    │ (~2.2k líneas, 51 ítems)     │
└──────────────┘                    └──────────────┬───────────────┘
                                                   │
downloads/tokko-*  ── publish-images ──►           │
                    public/propiedades/            │
                    public/assets/                 │
                    logo-lm.jpg                    ▼
                                    ┌──────────────────────────────┐
                                    │ Astro build (SSG)              │
                                    │ 56 rutas HTML + assets estáticos│
                                    └──────────────┬───────────────┘
                                                   ▼
                                    ┌──────────────────────────────┐
                                    │ dist/ → CDN (Cloudflare Pages) │
                                    └──────────────────────────────┘
```

### 3.2 Capas de la aplicación

| Capa | Ubicación | Rol |
|------|-----------|-----|
| Config de marca | `src/config/site.ts` | Teléfono, redes, logo, misión/visión |
| Datos | `src/data/properties.ts` | Único store; tipos exportados en el mismo archivo |
| Dominio | `src/lib/properties.ts`, `whatsapp.ts` | Formato precio, galería, labels, deep links WA |
| UI | `src/components/*`, `src/pages/*` | Composición Astro + islands mínimos (scripts inline) |
| Estilos | `src/styles/global.css` + Tailwind 4 | Design tokens en `@theme` |
| Layout | `src/layouts/BaseLayout.astro` | SEO base, header/footer globales |

**Patrón:** *static site + fat data file*. Correcto para escala actual (51 ítems); **no escala** a cientos de propiedades sin particionar datos o CMS.

### 3.3 Rutas generadas

- Marketing: `/`, `/nosotros`, `/contacto`, `/faq`
- Catálogo: `/propiedades`, `/propiedades/[slug]` (51 paths vía `getStaticPaths`)
- Integración: `@astrojs/sitemap` con `site` en `astro.config.mjs`

---

## 4. Fortalezas (mantener)

1. **Desacople runtime de Tokko:** `remotePatterns: []`, imágenes bajo `/propiedades/`, fuentes vía Fontsource.
2. **Pipeline de imágenes documentado en scripts:** fetch listado paginado (`fetch-full-listing-html.mjs`), extracción `data-big`, merge, `publish-images-to-public.mjs`.
3. **Separación de scrape:** `data/scraped/galerias-scrapeadas.json` fuera de `scripts/fixtures` — buena decisión reciente.
4. **Filtros con estado en URL** (`history.replaceState`) en listado — compartible y testeable en E2E.
5. **TypeScript strict** (`astro/tsconfigs/strict`).
6. **CTA comercial clara:** WhatsApp con mensaje contextual por propiedad (`refCode`, título).
7. **Accesibilidad mínima:** skip link, `aria-live` en contadores de filtros y formulario.

---

## 5. Hallazgos críticos (P0) — bloquean confianza en producción

### P0.1 Formulario de contacto no entrega leads

**Archivo:** `src/pages/contacto.astro`

El submit persiste en `localStorage` (`lmneg.leads`) y muestra *"Consulta registrada"* sin backend, email ni integración CRM.

**Impacto:** el usuario cree que la inmobiliaria recibió el mensaje; **pérdida directa de consultas**.

**Remediación recomendada (orden de preferencia):**

1. Formspree / Netlify Forms / Cloudflare Workers + Resend.
2. Eliminar el formulario y dejar solo WhatsApp hasta tener backend.
3. Si se mantiene temporalmente: copy honesto (*"Por ahora contactanos por WhatsApp"*) y deshabilitar submit.

### P0.2 Filtro "Alquiler" sin datos

**Archivos:** `src/pages/propiedades/index.astro`, `src/data/properties.ts`

El tipo `Operation` incluye `'alquiler'`, el `<select>` ofrece la opción, pero **las 51 propiedades tienen `"operation": "venta"`** (una sola coincidencia de texto `alquiler` en descripciones, no en el campo).

**Impacto:** UX rota; percepción de sitio incompleto vs. Tokko (venta + alquiler + temp).

**Remediación:** ocultar opción hasta importar alquileres, o ampliar `build-properties` / fuente de datos.

### P0.3 Riesgo de pisar galerías locales al regenerar catálogo

**Archivo:** `scripts/build-properties.mjs`

Sigue generando `heroImage` / `galleryImages` con URLs `https://static.tokkobroker.com/...`. Si alguien ejecuta `node scripts/build-properties.mjs` sin pipeline posterior, **revierte la independización de imágenes**.

**Remediación:**

- Marcar script como `@deprecated` o hacer que emita solo metadatos (JSON) sin URLs.
- Orden obligatorio documentado: `build-properties` → `fetch-galleries` → `merge-galerias` → `publish-images`.
- Mejor: **un solo comando** `npm run sync-catalog` que encadene pasos y falle si detecta URLs remotas en output.

---

## 6. Alta prioridad (P1)

### P1.1 Monolito `properties.ts` (~2.227 líneas)

**Problemas:**

- Diffs enormes en PRs.
- Merge conflictos con `merge-galerias-json-into-properties.mjs` (regex sobre texto TS).
- Carga mental para editar una sola propiedad.

**Remediación:**

```text
src/data/
  properties.json          # o properties/*.json por id
  schema.ts                # Zod + tipos
  index.ts                 # import + validación en build
```

Validar en `astro build` con Zod; generar tipos desde schema.

### P1.2 Peso del repositorio y del deploy (~113 MB solo JPG)

- `public/propiedades/`: 812 archivos, **~113 MB**.
- `downloads/` está en `.gitignore`; **`public/propiedades/` no**.

**Impacto:** clones lentos, builds/Pages upload pesados, coste de ancho de banda.

**Opciones:**

| Estrategia | Trade-off |
|----------|-----------|
| Git LFS | Complejidad, coste LFS |
| Ignorar `public/propiedades/` + generar en CI (`publish-images`) | Requiere pipeline en deploy |
| Optimizar JPG (sharp, quality 80, max width 1920) | Una vez; puede bajar 40–60 % |
| R2/CDN separado | Más ops, mejor para escala |

### P1.3 Sin redirects desde URLs Tokko

El sitio legacy usa rutas `/p/{tokkoId}-Titulo-...`. El nuevo usa `/propiedades/{slug}`.

**Impacto SEO y enlaces guardados:** 404 al cortar Tokko.

**Remediación:** mapa `tokkoId → slug` (ya existe en datos) + `_redirects` (Cloudflare/Netlify) o `public/_redirects` con reglas por ID si el host lo permite; idealmente tabla generada por script.

### P1.4 Logo e imágenes: accesibilidad y SEO visual

**Archivo:** `src/components/Header.astro`

```html
<img src={SITE.logoSrc} alt="" ... />
```

**Remediación:** `alt={brandFull}` o texto visible-only para lectores de pantalla; considerar `fetchpriority="high"` en home.

**Favicon:** sigue siendo `favicon.svg` genérico, no `logo-lm.jpg` — inconsistencia de marca en pestaña.

### P1.5 Descripciones y features pobres vs. Tokko

Muchas fichas tienen `description` de una línea y `features: ["Venta", "Paraná", "Ref. …"]` sin servicios/ambientes reales del HTML Tokko.

**Impacto:** SEO de cola larga débil, menor conversión vs. sitio actual.

**Remediación:** scrape de bloques descriptivos (no solo imágenes) o edición CMS.

---

## 7. Prioridad media (P2)

### P2.1 Ordenamiento de precios multi-moneda

Filtros ordenan por `data-price` numérico sin normalizar **USD vs ARS**. Orden global puede ser incorrecto si en el futuro hay mezcla.

**Remediación:** ordenar dentro de moneda seleccionada o convertir con tipo de cambio configurable.

### P2.2 Página de detalle: métricas irrelevantes

`[slug].astro` muestra siempre Ambientes/Baños/Cubiertos aunque `showRooms` se calcula y **no se usa**; terrenos/cocheras muestran "0" en varios campos.

**Remediación:** plantilla condicional por `property.type` (ya hay lógica parcial en tipos).

### P2.3 Sin JSON-LD `RealEstateListing`

Google Rich Results para inmuebles benefician de schema.org con precio, moneda, dirección, imagen.

**Remediación:** componente `PropertyJsonLd.astro` en detalle.

### P2.4 Galería sin lightbox / sin `srcset`

27 fotos en una propiedad = mucho DOM y scroll; sin zoom ni navegación por teclado.

**Remediación:** componente ligero (p. ej. solo CSS + `<dialog>`) o `srcset`/`sizes` generados en build.

### P2.5 `referrerpolicy="no-referrer"` en imágenes locales

En `ListingImage.astro` es residual del era Tokko; innecesario para `/propiedades/...`.

### P2.6 Email `contacto@lmneginmobiliarios.com.ar`

Configurado en `site.ts` pero sin verificación de buzón real ni enlace `mailto:` prominente.

---

## 8. Prioridad baja (P3)

- **Tests:** cero unitarios/E2E; al menos smoke: build + 404 + filtro + link WA.
- **CI:** no hay GitHub Actions / pipeline de `npm run build`.
- **README:** ausente en raíz del proyecto (onboarding difícil).
- **Scripts fixtures HTML** en repo (`listado-completo.html`, `listado-merged.html`) — útiles para repro, ruido en git; mover a `data/scraped/` o documentar como artefactos opcionales.
- **`merge-galerias` por regex:** frágil ante cambios de formato en `properties.ts`; preferir AST (ts-morph) o merge sobre JSON intermedio.
- **Variable `showRooms`:** código muerto en `[slug].astro`.
- **Disclaimer legal** (medidas orientativas, fotos no contractuales): presente en Tokko, ausente en footer — recomendable para martilleros.

---

## 9. Seguridad y privacidad

| Tema | Estado |
|------|--------|
| Superficie de ataque servidor | Mínima (SSG) |
| XSS en contenido usuario | Bajo (datos estáticos curados) |
| Secretos en repo | `.env` ignorado; OK |
| Formulario | Honeypot `website` — bien; sin rate limit ni CAPTCHA |
| Dependencias | `npm audit` periódico recomendado |
| Scraping Tokko | Legal/ToS: uso interno de migración; no re-scrapear agresivamente en producción |
| localStorage leads | Datos personales en dispositivo del visitante sin consentimiento RGPD/Ley 25.326 — eliminar o reemplazar |

---

## 10. Rendimiento

### Build

- 56 páginas HTML: build ~7–8 s en entorno local (aceptable).
- Cuello de botella futuro: tamaño de `dist/` por copia de 113 MB de imágenes.

### Runtime (cliente)

- Listado: **51 cards** en DOM inicial; filtros solo togglean `hidden` — OK hasta ~100 ítems.
- Scripts inline en `propiedades/index.astro` y `contacto.astro` — sin bundling; aceptable para tamaño actual.
- Fuentes: subset variable DM Sans + Playfair 600/700 — razonable; revisar peso total de WOFF2 en Lighthouse.

### Recomendaciones Lighthouse

1. Comprimir JPG en `public/propiedades/`.
2. `loading="lazy"` ya en cards; hero detail `eager` — correcto.
3. Preload opcional de `logo-lm.jpg` y hero home.

---

## 11. SEO y descubrimiento

**Implementado:**

- `lang="es"`, `<title>`, meta description, canonical, Open Graph, Twitter card.
- Sitemap automático (`@astrojs/sitemap`).
- URLs legibles: `/propiedades/8042741-depto-rosario-del-tala-san-juan`.

**Faltante:**

- `robots.txt` explícito (opcional si host lo genera).
- Redirects 301 desde Tokko.
- JSON-LD inmobiliario.
- Contenido único por ficha (descripciones).
- `og:image` absoluto OK; verificar que imágenes locales resuelvan bien en WhatsApp/Facebook debugger.

---

## 12. Pipeline operativo (scripts)

| Script | Función | Riesgo |
|--------|---------|--------|
| `fetch-full-listing-html.mjs` | Paginación Tokko → HTML merged | Depende de HTML estable |
| `fetch-galleries-from-listing-html.mjs` | Detalle → `data-big` | Rate limit / cambio DOM |
| `merge-galerias-json-into-properties.mjs` | JSON → TS | Regex frágil |
| `download-tokko-images.mjs` | Descarga a `downloads/` | Solo si URLs remotas |
| `publish-images-to-public.mjs` | Copia + rutas `/propiedades/` | Idempotente |
| `build-properties.mjs` | Regenera catálogo base | **Puede romper URLs locales** |
| `extract-tokko-gallery.mjs` | Utilidad manual HTML | OK |

**Comando npm unificado sugerido:**

```json
"sync-catalog": "node scripts/fetch-full-listing-html.mjs && node scripts/fetch-galleries-from-listing-html.mjs scripts/fixtures/listado-merged.html --save-json=data/scraped/galerias-scrapeadas.json && node scripts/merge-galerias-json-into-properties.mjs && npm run publish-images"
```

(Ajustar rutas de `listado-merged` según flujo.)

---

## 13. Despliegue (Cloudflare Pages u otro)

**Configuración esperada:**

- Build: `npm run build`
- Output: `dist`
- Node: `>=22.12.0` (definido en `package.json`)

**Checklist pre-go-live:**

- [ ] Resolver P0 formulario
- [ ] Decidir estrategia Git para `public/propiedades/` (LFS vs CI)
- [ ] DNS + dominio `lmneginmobiliarios.com.ar`
- [ ] Redirects Tokko → slugs nuevos
- [ ] Probar OG en fichas con imagen local
- [ ] `PUBLIC_WHATSAPP_NUMBER` en env de producción si difiere
- [ ] Política de privacidad si se guardan datos (futuro formulario real)

---

## 14. Matriz de riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Lead perdido por formulario falso | Alta | Alto | Backend o quitar form |
| Regenerar properties con Tokko URLs | Media | Alto | Guardrails en scripts |
| Repo/deploy >100 MB | Alta | Medio | Optimizar imágenes / CI |
| 404 SEO al migrar dominio | Alta | Alto | Redirects por tokkoId |
| Catálogo desactualizado vs. Tokko | Media | Medio | Sync periódico documentado |
| Filtro alquiler vacío | Alta | Bajo-Medio | Ocultar o importar datos |

---

## 15. Roadmap recomendado (12 semanas, orientativo)

### Fase 0 — Go-live mínimo (1 semana)

1. Arreglar contacto (WhatsApp-only o servicio real).
2. Ocultar filtro alquiler o importar operaciones.
3. Redirects críticos (top 20 propiedades por tráfico).
4. `alt` en logo + favicon desde logo.
5. Disclaimer legal en footer.

### Fase 1 — Datos y repo (2–3 semanas)

1. Migrar `properties.ts` → JSON + schema Zod.
2. Optimización masiva de JPG.
3. Política git: `public/propiedades` en CI o LFS.
4. `npm run sync-catalog` documentado en README.

### Fase 2 — Producto y SEO (2–4 semanas)

1. Enriquecer descripciones (scrape texto o CMS).
2. JSON-LD en fichas.
3. Lightbox galería.
4. Plantillas por tipo de inmueble.

### Fase 3 — Operación continua

1. Cron mensual sync (opcional, si siguen en Tokko back-office).
2. CI: build + link checker.
3. Analytics (Plausible/GA4) y eventos en clic WA.

---

## 16. Conclusión

El proyecto cumple el objetivo técnico principal: **sitio estático independiente, con catálogo completo e imágenes propias**, listo para hosting estático. La calidad de ingeniería del **front Astro es sólida para el tamaño del equipo**; la deuda está en **capa de datos, integración comercial (leads) y operaciones de deploy**.

Priorizar **P0 (formulario y alquiler)** antes de anunciar el reemplazo del sitio Tokko. En paralelo, **P1 (peso de imágenes + redirects + estructura de datos)** define si el proyecto será mantenible a 12 meses sin dolor.

---

*Documento generado como auditoría estática del repositorio; no incluye pentest ni revisión legal de uso de fotos Tokko.*
