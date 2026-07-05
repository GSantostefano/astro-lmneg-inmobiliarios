#!/usr/bin/env node
/**
 * Extrae URLs de galería Tokko desde HTML pegado (atributo data-big en .slider-thumb).
 * Uso: node scripts/extract-tokko-gallery.mjs < pegado.html
 *   o:  node scripts/extract-tokko-gallery.mjs ruta/al/archivo.html
 */
import { readFileSync } from 'node:fs';

const input = process.argv[2]
  ? readFileSync(process.argv[2], 'utf8')
  : readFileSync(0, 'utf8');

const re = /data-big="(https:\/\/static\.tokkobroker\.com\/pictures\/[^"]+)"/g;
const urls = [];
let m;
while ((m = re.exec(input)) !== null) {
  if (!urls.includes(m[1])) urls.push(m[1]);
}

if (urls.length === 0) {
  console.error('No se encontraron data-big. Pegá el bloque del slider de Tokko.');
  process.exit(1);
}

console.log(JSON.stringify(urls, null, 2));
console.error(`\n${urls.length} URLs → copiá el array en galleryImages de esa propiedad en src/data/properties.ts`);
