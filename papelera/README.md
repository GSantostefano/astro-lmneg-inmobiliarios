# Papelera — migración Tokko (histórico)

Herramientas y datos usados **una vez** para importar el catálogo desde [lmneginmobiliarios.com.ar](https://www.lmneginmobiliarios.com.ar) (Tokko Broker). No forman parte del flujo de build ni del deploy del sitio.

El sitio en producción usa:

- `src/data/properties.ts` — catálogo
- `public/propiedades/{tokkoId}/` — imágenes locales
- `scripts/publish-images-to-public.mjs` — copiar nuevas fotos desde `downloads/tokko-images/` si hace falta

## Contenido

| Ruta | Descripción |
|------|-------------|
| `scripts/` | Scrapers, merge, descarga Tokko, `build-properties` (genera URLs remotas; no ejecutar sin saber) |
| `fixtures/` | HTML de listados guardados |
| `data/galerias-scrapeadas.json` | Mapa id → URLs `data-big` del scrape |

## Ejecutar desde la raíz del repo (solo si hace falta revivir migración)

```bash
node papelera/scripts/merge-galerias-json-into-properties.mjs
node papelera/scripts/fetch-galleries-from-listing-html.mjs papelera/fixtures/listado-merged.html --save-json=papelera/data/galerias-scrapeadas.json
```
