#!/usr/bin/env node
/**
 * Desde el HTML de resultados (ul#propiedades), obtiene prop-id + href de cada
 * ficha, pide cada detalle en lmneginmobiliarios.com.ar y extrae data-big
 * (misma fuente que el slider Tokko). Opcional: descarga a disco.
 *
 * Uso:
 *   node scripts/fetch-galleries-from-listing-html.mjs listado.html
 *   node scripts/fetch-galleries-from-listing-html.mjs listado.html --download
 *   node scripts/fetch-galleries-from-listing-html.mjs listado.html --dry-run
 *   node scripts/fetch-galleries-from-listing-html.mjs listado.html --save-json=data/scraped/galerias-scrapeadas.json
 *
 * El HTML puede ser "Ver código fuente" o guardar página; deben aparecer
 * <li prop-id="..."> y <a href="/p/...">.
 */
import {
  createWriteStream,
  mkdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');

const DEFAULT_ORIGIN = 'https://www.lmneginmobiliarios.com.ar';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const ACCEPT = 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8';

/** Parejas (tokkoId, path) en orden de aparición; sin duplicar prop-id */
function parseListingHtml(html) {
  const pairs = [];
  const seen = new Set();
  const liRe = /<li\s+prop-id="(\d+)"[^>]*>\s*<a\s+href="([^"]+)"/gi;
  let m;
  while ((m = liRe.exec(html)) !== null) {
    const id = m[1];
    if (seen.has(id)) continue;
    seen.add(id);
    let path = m[2];
    if (!path.startsWith('/')) path = `/${path}`;
    pairs.push({ tokkoId: id, path });
  }
  return pairs;
}

function extractDataBigUrls(html) {
  const re = /data-big="(https:\/\/static\.tokkobroker\.com\/pictures\/[^"]+)"/g;
  const urls = [];
  let x;
  while ((x = re.exec(html)) !== null) {
    if (!urls.includes(x[1])) urls.push(x[1]);
  }
  return urls;
}

async function fetchDetailHtml(origin, path) {
  const url = `${origin.replace(/\/$/, '')}${path}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: ACCEPT },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`${url} → ${res.status} ${res.statusText}`);
  return res.text();
}

function extFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    const base = pathname.split('/').pop() || '';
    const i = base.lastIndexOf('.');
    if (i > 0 && i < base.length - 1) return base.slice(i + 1).toLowerCase();
  } catch {
    /* ignore */
  }
  return 'jpg';
}

async function downloadOne(url, destPath) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': UA,
      Referer: DEFAULT_ORIGIN + '/',
      Accept: 'image/*',
    },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const body = Readable.fromWeb(res.body);
  await pipeline(body, createWriteStream(destPath));
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseArgs(argv) {
  const files = [];
  let download = false;
  let dryRun = false;
  let saveJson = null;
  let origin = DEFAULT_ORIGIN;
  let delayMs = 600;
  let outDir = join(ROOT, 'downloads', 'tokko-images');
  let concurrency = 2;

  for (const a of argv) {
    if (a === '--download') download = true;
    else if (a === '--dry-run') dryRun = true;
    else if (a.startsWith('--origin=')) origin = a.slice(9);
    else if (a.startsWith('--save-json=')) saveJson = a.slice(12);
    else if (a.startsWith('--delay=')) delayMs = Math.max(0, parseInt(a.slice(8), 10) || 600);
    else if (a.startsWith('--out=')) outDir = a.slice(6);
    else if (a.startsWith('--concurrency='))
      concurrency = Math.max(1, parseInt(a.slice(14), 10) || 2);
    else if (a === '--help' || a === '-h') {
      console.log(`Lee HTML del listado, abre cada /p/... y extrae data-big.

Uso:
  node scripts/fetch-galleries-from-listing-html.mjs <archivo.html> [opciones]

Opciones:
  --download       Descargar imágenes a --out (por tokkoId/01.jpg…)
  --dry-run        Solo resumen (ids y cantidad de fotos), sin red a detalle
  --save-json=f    Guardar mapa { "8042741": ["url", ...], ... }
  --origin=URL     Default ${DEFAULT_ORIGIN}
  --delay=600      Pausa entre lotes de peticiones (ms)
  --concurrency=2  Detalles a la vez
  --out=ruta       Carpeta base de descargas
`);
      process.exit(0);
    } else if (!a.startsWith('--')) files.push(a);
  }

  return { files, download, dryRun, saveJson, origin, delayMs, outDir, concurrency };
}

async function main() {
  const { files, download, dryRun, saveJson, origin, delayMs, outDir, concurrency } =
    parseArgs(process.argv.slice(2));

  if (files.length !== 1) {
    console.error('Indicá un archivo HTML: node scripts/fetch-galleries-from-listing-html.mjs listado.html');
    process.exit(1);
  }
  const filePath = files[0];
  if (!existsSync(filePath)) {
    console.error(`No existe: ${filePath}`);
    process.exit(1);
  }

  const html = readFileSync(filePath, 'utf8');
  const pairs = parseListingHtml(html);
  if (pairs.length === 0) {
    console.error(
      'No se encontraron <li prop-id="..."> con <a href="/p/...">. Guardá el HTML completo del listado.',
    );
    process.exit(1);
  }

  console.error(`${pairs.length} propiedades en el listado.`);

  if (dryRun) {
    for (const p of pairs) console.log(`${p.tokkoId} → ${p.path}`);
    return;
  }

  /** @type {Record<string, string[]>} */
  const byId = {};
  let errors = 0;

  for (let i = 0; i < pairs.length; i += concurrency) {
    const batch = pairs.slice(i, i + concurrency);
    await Promise.all(
      batch.map(async ({ tokkoId, path }) => {
        try {
          const detail = await fetchDetailHtml(origin, path);
          const urls = extractDataBigUrls(detail);
          byId[tokkoId] = urls;
          console.error(`✓ ${tokkoId}: ${urls.length} fotos`);
        } catch (e) {
          errors++;
          console.error(`✗ ${tokkoId}: ${e.message}`);
          byId[tokkoId] = [];
        }
      }),
    );
    if (i + concurrency < pairs.length && delayMs > 0) await sleep(delayMs);
  }

  if (saveJson) {
    writeFileSync(saveJson, JSON.stringify(byId, null, 2), 'utf8');
    console.error(`JSON guardado: ${saveJson}`);
  }

  if (!download) {
    console.log(JSON.stringify(byId, null, 2));
    if (errors) process.exitCode = 1;
    return;
  }

  mkdirSync(outDir, { recursive: true });
  let ok = 0;
  let fail = 0;
  for (const [tokkoId, urls] of Object.entries(byId)) {
    if (urls.length === 0) continue;
    const dir = join(outDir, tokkoId);
    mkdirSync(dir, { recursive: true });
    let n = 0;
    for (const url of urls) {
      n++;
      const dest = join(dir, `${String(n).padStart(2, '0')}.${extFromUrl(url)}`);
      try {
        await downloadOne(url, dest);
        ok++;
      } catch (e) {
        fail++;
        console.error(`✗ descarga ${tokkoId} ${n}: ${e.message}`);
      }
    }
  }
  console.error(`Descargas: ${ok} ok, ${fail} fallidas → ${outDir}`);
  if (fail || errors) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
