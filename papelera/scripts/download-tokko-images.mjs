#!/usr/bin/env node
/**
 * Descarga imágenes Tokko desde src/data/properties.ts (heroImage + galleryImages).
 *
 * Uso:
 *   node scripts/download-tokko-images.mjs
 *   node scripts/download-tokko-images.mjs --id=8042741
 *   node scripts/download-tokko-images.mjs --out=D:\fotos\tokko
 *   node scripts/download-tokko-images.mjs --dry-run
 *
 * Salida: carpetas {out}/{tokkoId}/01.jpg, 02.jpg, ... (orden de la galería).
 */
import { createWriteStream, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const PROPERTIES_FILE = join(ROOT, 'src', 'data', 'properties.ts');

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const REFERER = 'https://www.lmneginmobiliarios.com.ar/';

function parseArgs() {
  const args = process.argv.slice(2);
  let idFilter = null;
  let outDir = join(ROOT, 'downloads', 'tokko-images');
  let dryRun = false;
  let concurrency = 4;

  for (const a of args) {
    if (a === '--dry-run') dryRun = true;
    else if (a.startsWith('--id=')) idFilter = a.slice(5);
    else if (a.startsWith('--out=')) outDir = a.slice(6).replace(/^["']|["']$/g, '');
    else if (a.startsWith('--concurrency='))
      concurrency = Math.max(1, parseInt(a.slice(14), 10) || 4);
    else if (a === '--help' || a === '-h') {
      console.log(`Uso: node scripts/download-tokko-images.mjs [opciones]

  --id=8042741     Solo esa propiedad (tokkoId numérico)
  --out=ruta       Carpeta base (default: downloads/tokko-images)
  --dry-run        Lista URLs sin descargar
  --concurrency=4  Descargas en paralelo
`);
      process.exit(0);
    }
  }
  return { idFilter, outDir, dryRun, concurrency };
}

function extractProperties(text) {
  const list = [];
  let pos = 0;
  while (true) {
    const idMatch = text.indexOf('"id": "prop-', pos);
    if (idMatch === -1) break;
    const nextId = text.indexOf('"id": "prop-', idMatch + 14);
    const blockEnd = nextId === -1 ? text.length : nextId;
    const block = text.slice(idMatch, blockEnd);

    const idLine = block.match(/"id":\s*"prop-(\d+)"/);
    if (!idLine) {
      pos = idMatch + 14;
      continue;
    }
    const tokkoId = idLine[1];

    const heroM = block.match(/"heroImage":\s*"([^"]+)"/);
    const galM = block.match(/"galleryImages":\s*\[([\s\S]*?)\]\s*,\s*\r?\n\s*"refCode"/);
    const galleryInner = galM ? galM[1] : '';
    const galleryUrls = [];
    const urlRe = /"(https:\/\/static\.tokkobroker\.com\/pictures\/[^"]+)"/g;
    let m;
    while ((m = urlRe.exec(galleryInner)) !== null) galleryUrls.push(m[1]);

    const heroUrl = heroM ? heroM[1] : null;
    const urls = dedupeOrder(
      galleryUrls.length > 0 ? galleryUrls : heroUrl ? [heroUrl] : [],
    );

    list.push({ tokkoId, urls });
    pos = blockEnd;
  }
  return list;
}

function dedupeOrder(urls) {
  const seen = new Set();
  const out = [];
  for (const u of urls) {
    if (!u || seen.has(u)) continue;
    seen.add(u);
    out.push(u);
  }
  return out;
}

function extFromUrl(url) {
  try {
    const path = new URL(url).pathname;
    const base = path.split('/').pop() || '';
    const i = base.lastIndexOf('.');
    if (i > 0 && i < base.length - 1) return base.slice(i + 1).toLowerCase();
  } catch {
    /* ignore */
  }
  return 'jpg';
}

async function downloadOne(url, destPath) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Referer: REFERER, Accept: 'image/*' },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const body = Readable.fromWeb(res.body);
  await pipeline(body, createWriteStream(destPath));
}

async function pool(items, concurrency, fn) {
  const results = [];
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

async function main() {
  const { idFilter, outDir, dryRun, concurrency } = parseArgs();

  if (!existsSync(PROPERTIES_FILE)) {
    console.error(`No existe ${PROPERTIES_FILE}`);
    process.exit(1);
  }

  const text = readFileSync(PROPERTIES_FILE, 'utf8');
  let props = extractProperties(text);

  if (idFilter) props = props.filter((p) => p.tokkoId === idFilter);
  if (props.length === 0) {
    console.error('No hay propiedades que coincidan.');
    process.exit(1);
  }

  const tasks = [];
  for (const { tokkoId, urls } of props) {
    if (urls.length === 0) continue;
    urls.forEach((url, j) => {
      const n = j + 1;
      const ext = extFromUrl(url);
      const name = `${String(n).padStart(2, '0')}.${ext}`;
      const dir = join(outDir, tokkoId);
      const dest = join(dir, name);
      tasks.push({ tokkoId, url, dest, dir, name });
    });
  }

  console.error(
    `${props.length} propiedades → ${tasks.length} archivos → ${dryRun ? '(dry-run)' : outDir}`,
  );

  if (dryRun) {
    for (const t of tasks) console.log(`${t.dest} ← ${t.url}`);
    return;
  }

  mkdirSync(outDir, { recursive: true });
  let ok = 0;
  let fail = 0;

  await pool(tasks, concurrency, async (t) => {
    mkdirSync(t.dir, { recursive: true });
    try {
      await downloadOne(t.url, t.dest);
      ok++;
      process.stderr.write(`\rOK ${ok}/${tasks.length}`);
    } catch (e) {
      fail++;
      console.error(`\n✗ ${t.tokkoId} ${t.name}: ${e.message}`);
    }
  });

  console.error(`\nListo: ${ok} ok, ${fail} fallidos.`);
  if (fail > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
