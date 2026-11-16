/**
 * Jon's kill list, run over the rendered text of every built page (and the
 * RSS feed): no em dashes, none of the banned phrases. Reads dist/, so run
 * `npm run build` first.
 *
 *   node scripts/kill-list.mjs
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const BANNED = [
  /—/, /&mdash;/i, /learn more/i, /click here/i, /\bsubmit\b/i, /circle back/i,
  /don.t hesitate to reach out/i, /schedule a free consultation/i,
];
const files = [];
const walk = (d) => readdirSync(d).forEach((f) => {
  const p = path.join(d, f);
  if (statSync(p).isDirectory()) { if (!['_astro', 'chunks', 'admin'].includes(f)) walk(p); }
  else if (/\.(html|xml)$/.test(f)) files.push(p);
});
walk('dist');

let hits = 0;
for (const f of files) {
  const text = readFileSync(f, 'utf8')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    // Attribute values a visitor reads (alt, aria-label, title, placeholder, content) stay in.
    .replace(/<[^>]*?((?:alt|aria-label|title|placeholder|content)="[^"]*")[^>]*>/gi, ' $1 ')
    .replace(/<[^>]+>/g, ' ');
  for (const re of BANNED) {
    const m = text.match(new RegExp(`.{0,40}${re.source}.{0,40}`, re.flags.replace('g', '')));
    if (m) { hits++; console.log(`${f}: ${re}  …${m[0].trim()}…`); }
  }
}
console.log(hits ? `\n${hits} kill-list hits.` : `kill list: clean across ${files.length} files.`);
if (hits) process.exitCode = 1;
