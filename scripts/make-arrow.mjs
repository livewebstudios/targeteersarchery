/**
 * The section arrow, written out as two static SVGs.
 *
 *   node scripts/make-arrow.mjs
 *
 * They are background-images rather than inline markup, because the arrow now
 * sits on every section heading on the site and inlining it 30 times a page
 * would be 30 copies of the same 1.5KB of paths. A background-image cannot
 * read CSS custom properties, so the two grounds get their own file: carbon
 * shaft on cream, pale anodised shaft on the dark bands.
 */
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const OUT = path.resolve(process.cwd(), 'public', 'images');

const LIGHT = {
  shaftHi: '#6e5a46', shaft: '#322619', shaftLo: '#1b140e',
  gleam: '#f8f5ee', nock: '#3a2e23', vaneEdge: '#7d4a0c',
};
const DARK = {
  shaftHi: '#f1ebdf', shaft: '#cfc4ae', shaftLo: '#9d907a',
  gleam: '#ffffff', nock: '#d9cbae', vaneEdge: '#c8862b',
};
/* Shared across both grounds: the steel, the vanes and the crest wraps read
   the same on cream as they do on pine. */
const COMMON = {
  steelHi: '#efeae1', steel: '#a9a296', steelLo: '#5d564d',
  vane: '#b7412e', vaneLo: '#8e3122', wrap: '#c8862b', nockSlot: '#c8862b',
};

const arrow = (c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 34" fill="none">
  <defs>
    <linearGradient id="s" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${c.shaftHi}"/><stop offset=".42" stop-color="${c.shaft}"/><stop offset="1" stop-color="${c.shaftLo}"/>
    </linearGradient>
    <linearGradient id="p" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${c.steelHi}"/><stop offset=".38" stop-color="${c.steel}"/><stop offset="1" stop-color="${c.steelLo}"/>
    </linearGradient>
    <linearGradient id="v" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${c.vaneLo}"/><stop offset="1" stop-color="${c.vane}"/>
    </linearGradient>
  </defs>
  <path d="M12 13.4h13v7.2H12a2.2 2.2 0 0 1-2.2-2.2v-2.8A2.2 2.2 0 0 1 12 13.4Z" fill="${c.nock}"/>
  <rect x="9.4" y="16.1" width="7.6" height="1.8" rx=".9" fill="${c.nockSlot}"/>
  <rect x="23" y="14.1" width="248" height="5.8" rx="2.9" fill="url(#s)"/>
  <rect x="26" y="14.9" width="242" height="1.3" rx=".65" fill="${c.gleam}" opacity=".5"/>
  <path d="M28.6 14.3c0-6.4 2.8-10.2 7.6-11.2 9.6-2 19.2 3.4 27.2 11.2Z" fill="url(#v)"/>
  <path d="M29.4 14.3c1.6-3 5-4.9 9.6-5.4 8-.9 16.4 2.2 23.2 5.4Z" fill="${c.vaneEdge}" opacity=".28"/>
  <path d="M28.6 19.7c0 4.6 2.4 7.3 6.6 8.1 8.4 1.6 17.6-2.6 24.6-8.1Z" fill="url(#v)" opacity=".86"/>
  <path d="M31.4 15c9.2-1.4 22.4-.7 32 2v1.3c-9.6-2.7-22.8-3.3-32-2Z" fill="${c.vaneEdge}"/>
  <rect x="68" y="14.1" width="4.4" height="5.8" fill="${c.wrap}"/>
  <rect x="76" y="14.1" width="2" height="5.8" fill="${c.wrap}" opacity=".7"/>
  <rect x="266" y="13.5" width="5.6" height="7" rx="1.2" fill="${c.steelLo}"/>
  <path d="M271.6 13.3c9.4.6 19.6 2.1 27.4 3.7-7.8 1.6-18 3.1-27.4 3.7Z" fill="url(#p)"/>
  <path d="M271.6 15.4c8.4.5 17.4 1.2 24.6 1.6-7.2.4-16.2 1.1-24.6 1.6Z" fill="${c.gleam}" opacity=".35"/>
</svg>
`;

/* Rob's logo colours, for the home page demos under /demos/. Every key in
   COMMON can be overridden per file, so the vanes, wraps and nock slot follow
   the brand rather than the cream-and-ember set above. */
const BRAND = {
  shaftHi: '#2a4a7a', shaft: '#001840', shaftLo: '#000c22',
  gleam: '#f8f8f4', nock: '#0a2a5c',
  vane: '#e46024', vaneLo: '#b8440f', vaneEdge: '#9c3a0a',
  wrap: '#f8f8f4', nockSlot: '#e46024',
};
const BRAND_LIGHT = {
  shaftHi: '#ffffff', shaft: '#dfe6ee', shaftLo: '#9fb0c4',
  gleam: '#ffffff', nock: '#dfe6ee',
  vane: '#e46024', vaneLo: '#b8440f', vaneEdge: '#fcba66',
  wrap: '#e46024', nockSlot: '#e46024',
};

const FILES = [
  ['shot-arrow.svg', { ...COMMON, ...LIGHT }],
  ['shot-arrow-light.svg', { ...COMMON, ...DARK }],
  ['shot-arrow-brand.svg', { ...COMMON, ...BRAND }],
  ['shot-arrow-brand-light.svg', { ...COMMON, ...BRAND_LIGHT }],
];

await mkdir(OUT, { recursive: true });
for (const [name, colours] of FILES) {
  await writeFile(path.join(OUT, name), arrow(colours));
}
console.log(FILES.map(([name]) => name).join(' + ') + ' written');
