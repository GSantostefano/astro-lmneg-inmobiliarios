#!/usr/bin/env node
/**
 * Aplica data/scraped/galerias-scrapeadas.json (o ruta argv[2]) sobre src/data/properties.ts:
 * heroImage = primera URL; galleryImages = array completo.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const PROPERTIES = join(ROOT, 'src', 'data', 'properties.ts');
const DEFAULT_JSON = join(__dirname, '../data', 'galerias-scrapeadas.json');

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

function main() {
  const jsonPath = process.argv[2] || DEFAULT_JSON;
  if (!existsSync(jsonPath)) {
    console.error(`No existe ${jsonPath}`);
    process.exit(1);
  }
  if (!existsSync(PROPERTIES)) {
    console.error(`No existe ${PROPERTIES}`);
    process.exit(1);
  }

  /** @type {Record<string, string[]>} */
  const data = JSON.parse(readFileSync(jsonPath, 'utf8'));
  let full = readFileSync(PROPERTIES, 'utf8');

  const ids = Object.keys(data).sort((a, b) => b.length - a.length);
  for (const tokkoId of ids) {
    full = mergeOneBlock(full, tokkoId, data[tokkoId]);
  }

  writeFileSync(PROPERTIES, full, 'utf8');
  console.error(`Actualizado ${PROPERTIES} (${ids.length} ids en JSON).`);
}

main();
