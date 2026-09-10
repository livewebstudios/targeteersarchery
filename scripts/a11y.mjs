/**
 * Runs axe-core over every page at two widths, against `astro preview`.
 *
 *   npm run build && npx astro preview --port 4322 &
 *   node scripts/a11y.mjs
 */
import puppeteer from 'puppeteer-core';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const AXE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

const BASE = process.env.QA_BASE ?? 'http://localhost:4322';
const CHROME =
  process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const ROUTES = [
  '/', '/about/', '/trophy-room/', '/pro-shop/', '/pro-shop/mathews/', '/pro-shop/hoyt/',
  '/pro-shop/sitka/', '/services/', '/services/bow-tuning/', '/lessons/', '/leagues/',
  '/kids/', '/groups/', '/range/', '/waiver/', '/calendar/', '/hunting/', '/insights/',
  '/insights/how-to-know-when-your-bow-needs-tuning/', '/insights/category/hunting/',
  '/faq/', '/contact/', '/careers/', '/thank-you/', '/404/',
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--hide-scrollbars'],
});
const page = await browser.newPage();
// Reveal wrappers start at opacity 0 until scrolled into view; reduced motion
// renders them visible immediately, so axe measures the real colours.
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);

const seen = new Map();
let total = 0;

for (const route of ROUTES) {
  for (const width of [375, 1440]) {
    await page.setViewport({ width, height: 900 });
    await page.goto(BASE + route, { waitUntil: 'networkidle0' });
    await page.evaluate(AXE);
    const results = await page.evaluate(async () =>
      // @ts-ignore — axe is injected above.
      await axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] },
      }),
    );
    for (const v of results.violations) {
      total += v.nodes.length;
      const key = `${v.id}`;
      const entry = seen.get(key) ?? { impact: v.impact, help: v.help, hits: [] };
      for (const n of v.nodes) {
        entry.hits.push(`${route} @${width}  ${n.target.join(' ')}  ${(n.failureSummary || '').split('\n').slice(1, 3).join(' ').trim()}`);
      }
      seen.set(key, entry);
    }
  }
}

await browser.close();

if (!seen.size) {
  console.log(`axe: no violations across ${ROUTES.length} routes x 2 widths.`);
} else {
  for (const [id, e] of seen) {
    console.log(`\n[${e.impact}] ${id} — ${e.help}  (${e.hits.length})`);
    for (const h of e.hits.slice(0, 6)) console.log('   ' + h);
    if (e.hits.length > 6) console.log(`   … and ${e.hits.length - 6} more`);
  }
  console.log(`\n${total} node violations total.`);
  process.exitCode = 1;
}
