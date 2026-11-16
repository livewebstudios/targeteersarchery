/**
 * Text contrast over the glass, measured from pixels.
 *
 * axe cannot see through backdrop-filter to the landscape, so it skips most
 * text on this site. This measures the real thing: for each backdrop scene,
 * it hides the page, lays one empty glass panel over the whole viewport (same
 * fill, same blur as the site), screenshots it, and takes the brightest 1% of
 * the ground. Every ink the site sets on glass is then composited over that
 * ground and checked against 4.5:1. Because the backdrop is fixed, a panel can
 * scroll over any part of it, so the whole viewport is the worst case.
 *
 *   npm run build && npx astro preview --port 4322 &
 *   node scripts/contrast.mjs
 */
import puppeteer from 'puppeteer-core';
import sharp from 'sharp';

const BASE = process.env.QA_BASE ?? 'http://localhost:4322';
const CHROME =
  process.env.CHROME_PATH ??
  (process.platform === 'win32'
    ? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
    : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');

// One route per scene, plus the home page's film poster.
const ROUTES = [
  ['film (home)', '/'],
  ['timber', '/pro-shop/'],
  ['hardwoods', '/services/'],
  ['canopy', '/hunting/'],
  ['ridge', '/range/'],
  ['meadow', '/lessons/'],
  ['dusk', '/about/'],
  ['tarn', '/faq/'],
  ['valley', '/contact/'],
];
const VIEWPORTS = [[1440, 900], [390, 844]];
// Text sits on the glass itself, or on a pane (a tinted card) inside it.
const SURFACES = ['glass', 'pane'];

// [name, r, g, b, alpha]
const INKS = [
  ['ink', 248, 248, 244, 1],
  ['muted', 248, 248, 244, 0.9],
  ['faint', 248, 248, 244, 0.8],
  ['tan', 252, 186, 102, 1],
];
// On a pane, tan labels use the pale tan (#ffd29a) instead.
const PANE_TAN = ['tan', 255, 210, 154, 1];

const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--force-color-profile=srgb'] });
const page = await browser.newPage();
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
await page.setCookie({ name: 'tgt_gate', value: 'open', url: BASE });

let worst = Infinity;
for (const [scene, route] of ROUTES) {
  for (const [width, height] of VIEWPORTS) for (const surface of SURFACES) {
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    await page.goto(BASE + route, { waitUntil: 'networkidle0' });
    await page.evaluate((surface) => {
      for (const el of document.body.children) {
        if (!el.classList.contains('d-backdrop')) el.style.visibility = 'hidden';
      }
      const g = document.createElement('div');
      g.className = 'glass';
      g.style.cssText = 'position:fixed;inset:-40px;border-radius:0;visibility:visible;z-index:5';
      if (surface === 'pane') {
        const p = document.createElement('div');
        p.className = 'pane';
        p.style.cssText = 'position:absolute;inset:0;border-radius:0';
        g.append(p);
      }
      document.body.append(g);
    }, surface);
    await new Promise((r) => setTimeout(r, 400));
    const png = await page.screenshot({ type: 'png' });
    const { data, info } = await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const px = [];
    for (let i = 0; i < data.length; i += info.channels * 4) {
      px.push([data[i], data[i + 1], data[i + 2], lum(data[i], data[i + 1], data[i + 2])]);
    }
    px.sort((a, b) => b[3] - a[3]);
    const [r, g, b] = px[Math.floor(px.length * 0.01)];
    const ground = lum(r, g, b);
    const results = INKS.map((ink) => (surface === 'pane' && ink[0] === 'tan' ? PANE_TAN : ink)).map(([name, ir, ig, ib, a]) => {
      const c = [ir * a + r * (1 - a), ig * a + g * (1 - a), ib * a + b * (1 - a)];
      const v = ratio(lum(...c), ground);
      worst = Math.min(worst, v);
      return `${name} ${v.toFixed(2)}`;
    });
    console.log(`${scene.padEnd(12)} @${String(width).padEnd(5)} ${surface.padEnd(6)} ground rgb(${r},${g},${b})  ${results.join('  ')}`);
  }
}
await browser.close();
console.log(`\nLowest: ${worst.toFixed(2)}:1 ${worst >= 4.5 ? '(passes 4.5:1)' : '(FAILS 4.5:1)'}`);
if (worst < 4.5) process.exitCode = 1;
