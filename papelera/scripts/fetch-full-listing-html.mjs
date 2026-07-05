#!/usr/bin/env node
/**
 * Arma un <ul> con todos los <li prop-id=...> de /Propiedades (scroll infinito vía ?p=2,3,…).
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');

const ORIGIN = 'https://www.lmneginmobiliarios.com.ar';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const PAGINATION_QUERY =
  'q=&currency=ANY&min-price=&max-price=&min-roofed=&max-roofed=&min-surface=&max-surface=&min-total_surface=&max-total_surface=&min-front_measure=&max-front_measure=&min-depth_measure=&max-depth_measure=&age=&min-age=&max-age=&suites=&rooms=&credit_eligible=&is_exclusive=&tags=&operation=&locations=&location_type=&ptypes=&o=2,2&watermark=';

const liRe = /<li\s+prop-id="\d+"[\s\S]*?<\/li>/gi;

function extractLis(html) {
  return html.match(liRe) ?? [];
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const outPath = join(__dirname, '../fixtures', 'listado-merged.html');
  mkdirSync(dirname(outPath), { recursive: true });

  const page1 = await fetch(`${ORIGIN}/Propiedades`, {
    headers: { 'User-Agent': UA, Accept: 'text/html' },
  }).then((r) => r.text());

  const seen = new Set();
  const chunks = [];
  for (const li of extractLis(page1)) {
    const m = li.match(/prop-id="(\d+)"/);
    if (m && !seen.has(m[1])) {
      seen.add(m[1]);
      chunks.push(li);
    }
  }

  let p = 2;
  while (true) {
    const url = `${ORIGIN}/Propiedades?${PAGINATION_QUERY}&p=${p}`;
    const frag = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'text/html' },
    }).then((r) => r.text());

    if (frag.includes('--NoMoreProperties--')) break;

    const lis = extractLis(frag);
    if (lis.length === 0) break;

    for (const li of lis) {
      const m = li.match(/prop-id="(\d+)"/);
      if (m && !seen.has(m[1])) {
        seen.add(m[1]);
        chunks.push(li);
      }
    }
    p++;
    await sleep(500);
  }

  const merged = `<ul id="propiedades" class="resultados-list">\n${chunks.join('\n')}\n</ul>`;
  writeFileSync(outPath, merged, 'utf8');
  console.error(`OK ${chunks.length} propiedades → ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
