/**
 * Layout rules, checked on every route at six widths:
 *   - no horizontal scroll
 *   - no blurred surface inside another blurred surface (no glass in glass)
 *   - at most one orange button on screen at any scroll position
 * With --transparency it also emulates prefers-reduced-transparency and
 * confirms every glass surface has dropped its blur for a solid fill.
 *
 *   npm run build && npx astro preview --port 4322 &
 *   node scripts/layout-check.mjs
 */
import puppeteer from 'puppeteer-core';

const BASE = process.env.QA_BASE ?? 'http://localhost:4322';
const CHROME =
  process.env.CHROME_PATH ??
  (process.platform === 'win32'
    ? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
    : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');

const ROUTES = [
  '/', '/about/', '/trophy-room/', '/pro-shop/', '/pro-shop/mathews/', '/pro-shop/hoyt/',
  '/pro-shop/sitka/', '/services/', '/services/bow-tuning/', '/lessons/', '/leagues/',
  '/kids/', '/groups/', '/range/', '/waiver/', '/calendar/', '/hunting/', '/insights/',
  '/insights/how-to-know-when-your-bow-needs-tuning/', '/insights/category/hunting/',
  '/faq/', '/contact/', '/careers/', '/thank-you/', '/404/',
];
const WIDTHS = [360, 390, 768, 1024, 1440, 1920];
const TRANSPARENCY = process.argv.includes('--transparency');

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--hide-scrollbars'] });
const page = await browser.newPage();
// Straight to the DevTools protocol: puppeteer's own helper rejects
// prefers-reduced-transparency as an unknown feature.
const media = [{ name: 'prefers-reduced-motion', value: 'reduce' }];
if (TRANSPARENCY) media.push({ name: 'prefers-reduced-transparency', value: 'reduce' });
const cdp = await page.createCDPSession();
await cdp.send('Emulation.setEmulatedMedia', { features: media });
await page.setCookie({ name: 'tgt_gate', value: 'open', url: BASE });

const problems = [];
for (const route of ROUTES) {
  for (const width of WIDTHS) {
    await page.setViewport({ width, height: width < 768 ? 800 : 900 });
    await page.goto(BASE + route, { waitUntil: 'networkidle0' });

    const result = await page.evaluate(async (transparency) => {
      const out = { overflow: 0, nested: [], maxOrange: 0, at: 0, blurred: 0 };
      const doc = document.documentElement;
      out.overflow = doc.scrollWidth - doc.clientWidth;

      const blurOf = (el) => {
        const cs = getComputedStyle(el);
        return (cs.backdropFilter && cs.backdropFilter !== 'none') || (cs.webkitBackdropFilter && cs.webkitBackdropFilter !== 'none');
      };
      const all = [...document.querySelectorAll('body *')].filter((el) => !el.closest('#site-gate'));
      const glass = all.filter(blurOf);
      out.blurred = glass.length;
      for (const g of glass) {
        let p = g.parentElement;
        while (p && p !== document.body) {
          if (blurOf(p)) { out.nested.push(`${g.className} in ${p.className}`); break; }
          p = p.parentElement;
        }
      }

      const isOrange = (el) => getComputedStyle(el).backgroundColor === 'rgb(228, 96, 36)';
      const candidates = all.filter((el) => el.matches('a, button') && isOrange(el));
      const step = innerHeight / 2;
      for (let y = 0; y <= doc.scrollHeight; y += step) {
        scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
        const n = candidates.filter((el) => {
          if (!isOrange(el)) return false;
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && cs.visibility !== 'hidden' && cs.display !== 'none';
        }).length;
        if (n > out.maxOrange) { out.maxOrange = n; out.at = y; }
      }
      return out;
    }, TRANSPARENCY);

    if (result.overflow > 0) problems.push(`${route} @${width}: horizontal scroll ${result.overflow}px`);
    if (result.nested.length) problems.push(`${route} @${width}: glass in glass: ${result.nested.slice(0, 3).join('; ')}`);
    if (result.maxOrange > 1) problems.push(`${route} @${width}: ${result.maxOrange} orange buttons on screen at y=${result.at}`);
    if (TRANSPARENCY && result.blurred > 0) problems.push(`${route} @${width}: ${result.blurred} surfaces still blurred under reduced transparency`);
  }
  process.stdout.write('.');
}
await browser.close();
console.log('');
if (!problems.length) {
  console.log(`layout: clean across ${ROUTES.length} routes x ${WIDTHS.length} widths${TRANSPARENCY ? ' (reduced transparency)' : ''}.`);
} else {
  problems.forEach((p) => console.log(p));
  process.exitCode = 1;
}
