#!/usr/bin/env node
/**
 * Copia downloads/tokko-images/{tokkoId}/* → public/propiedades/{tokkoId}/
 * y actualiza heroImage + galleryImages en src/data/properties.ts a rutas /propiedades/...
 *
 * Uso: node scripts/publish-images-to-public.mjs
 *      node scripts/publish-images-to-public.mjs --dry-run
 */
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const DOWNLOADS = join(ROOT, 'downloads', 'tokko-images');
const PUBLIC_PROP = join(ROOT, 'public', 'propiedades');
const PROPERTIES = join(ROOT, 'src', 'data', 'properties.ts');

function mergeOneBlock(full, tokkoId, urls) {
  if (!urls?.length) return full;
  const hero = urls[0];
  const propNeedle = `"id": "prop-${tokkoId}"`;
  const idx = full.indexOf(propNeedle);
  if (idx === -1) {
    console.warn(`Sin prop-${tokkoId} en properties.ts`);
    return full;
  }
  const nextIdx = full.indexOf('"id": "prop-', idx + propNeedle.length);
  const blockEnd = nextIdx === -1 ? full.length : nextIdx;
  let block = full.slice(idx, blockEnd);

  block = block.replace(/"heroImage":\s*"[^"]*"/, `"heroImage": "${hero}"`);

  const inner = urls.map((u) => `      "${u}"`).join(',\n');
  const galleryRepl = `"galleryImages": [\n${inner}\n    ],`;
  block = block.replace(/"galleryImages":\s*\[[\s\S]*?\]\s*,/, galleryRepl);

  return full.slice(0, idx) + block + full.slice(blockEnd);
}

function listImageFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function extractTokkoIdsFromProperties(text) {
  const ids = [];
  let pos = 0;
  while (true) {
    const idMatch = text.indexOf('"id": "prop-', pos);
    if (idMatch === -1) break;
    const nextId = text.indexOf('"id": "prop-', idMatch + 14);
    const blockEnd = nextId === -1 ? text.length : nextId;
    const block = text.slice(idMatch, blockEnd);
    const m = block.match(/"tokkoId":\s*"(\d+)"/);
    if (m) ids.push(m[1]);
    pos = blockEnd;
  }
  return ids;
}

function parseArgs() {
  const dryRun = process.argv.includes('--dry-run');
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`Copia imágenes a public/propiedades y actualiza properties.ts

  node scripts/publish-images-to-public.mjs [--dry-run]
`);
    process.exit(0);
  }
  return { dryRun };
}

function main() {
  const { dryRun } = parseArgs();

  if (!existsSync(PROPERTIES)) {
    console.error(`No existe ${PROPERTIES}`);
    process.exit(1);
  }

  let full = readFileSync(PROPERTIES, 'utf8');
  const tokkoIds = extractTokkoIdsFromProperties(full);

  if (tokkoIds.length === 0) {
    console.error('No se encontraron tokkoId en properties.ts');
    process.exit(1);
  }

  let copied = 0;
  const pending = [];

  for (const tokkoId of tokkoIds) {
    const srcDir = join(DOWNLOADS, tokkoId);
    const destDir = join(PUBLIC_PROP, tokkoId);

    if (!existsSync(srcDir)) {
      console.warn(`Sin carpeta de descarga: ${srcDir} (tokkoId ${tokkoId})`);
      continue;
    }

    const files = listImageFiles(srcDir);
    if (files.length === 0) {
      console.warn(`Carpeta vacía: ${srcDir}`);
      continue;
    }

    if (!dryRun) {
      rmSync(destDir, { recursive: true, force: true });
      mkdirSync(destDir, { recursive: true });
      for (const f of files) {
        copyFileSync(join(srcDir, f), join(destDir, f));
        copied++;
      }
    }

    const urls = files.map((f) => `/propiedades/${tokkoId}/${f}`);
    pending.push({ tokkoId, urls });
  }

  if (!dryRun) {
    const sorted = [...pending].sort((a, b) => b.tokkoId.length - a.tokkoId.length);
    for (const { tokkoId, urls } of sorted) {
      full = mergeOneBlock(full, tokkoId, urls);
    }
    writeFileSync(PROPERTIES, full, 'utf8');
  }

  console.error(
    dryRun
      ? `[dry-run] ${pending.length} propiedades con archivos en ${DOWNLOADS}`
      : `OK: ${copied} archivos → ${PUBLIC_PROP}; actualizado ${PROPERTIES}`,
  );
}

main();
