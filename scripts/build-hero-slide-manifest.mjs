#!/usr/bin/env node
/**
 * Escanea public/propiedades/{tokkoId}/* y guarda la imagen de mayor resolución
 * para usar en el hero slider (evita 01.jpg chico cuando hay alternativas en HD).
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const PUBLIC_PROP = join(ROOT, 'public', 'propiedades');
const OUT = join(ROOT, 'src', 'data', 'heroSlideImages.json');

function jpegSize(filePath) {
  const buf = readFileSync(filePath);
  for (let i = 0; i < buf.length - 9; i += 1) {
    if (buf[i] !== 0xff) continue;
    const marker = buf[i + 1];
    const isSof =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);
    if (!isSof) continue;
    const height = buf.readUInt16BE(i + 5);
    const width = buf.readUInt16BE(i + 7);
    return width * height;
  }
  return 0;
}

function imagePixels(filePath) {
  const ext = filePath.toLowerCase();
  if (ext.endsWith('.jpg') || ext.endsWith('.jpeg')) {
    try {
      return jpegSize(filePath);
    } catch {
      return 0;
    }
  }
  try {
    const size = statSync(filePath).size;
    return size;
  } catch {
    return 0;
  }
}

function bestImageInDir(dir) {
  const files = readdirSync(dir).filter((f) => /\.(jpe?g|webp|png)$/i.test(f));
  let best = null;
  let bestScore = 0;
  for (const file of files) {
    const full = join(dir, file);
    const score = imagePixels(full);
    if (score > bestScore) {
      bestScore = score;
      best = file;
    }
  }
  return best;
}

const manifest = {};
for (const tokkoId of readdirSync(PUBLIC_PROP)) {
  const dir = join(PUBLIC_PROP, tokkoId);
  try {
    if (!statSync(dir).isDirectory()) continue;
  } catch {
    continue;
  }
  const best = bestImageInDir(dir);
  if (best) manifest[tokkoId] = `/propiedades/${tokkoId}/${best}`;
}

writeFileSync(OUT, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`✅ ${Object.keys(manifest).length} entradas → ${OUT}`);
