/**
 * QA screenshots. Drives the local system Chrome through puppeteer-core, so
 * nothing large gets installed into the project.
 *
 *   npm run build && npx astro preview --port 4322 &
 *   node scripts/qa-screens.mjs
 *
 * Writes build/qa/<page>-<width>.png. Reduced motion is forced so the pinned
 * sections render as their static fallbacks rather than mid-animation.
 */
import puppeteer from 'puppeteer-core';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.QA_BASE ?? 'http://localhost:4322';
const OUT = path.resolve(process.cwd(), 'qa');
const CHROME =
  process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const WIDTHS = [375, 768, 1280, 1920];
const PAGES = [
  ['home', '/'],
  ['about', '/about/'],
  ['pro-shop', '/pro-shop/'],
  ['mathews', '/pro-shop/mathews/'],
  ['services', '/services/'],
  ['bow-tuning', '/services/bow-tuning/'],
  ['lessons', '/lessons/'],
  ['leagues', '/leagues/'],
  ['kids', '/kids/'],
  ['groups', '/groups/'],
  ['range', '/range/'],
  ['waiver', '/waiver/'],
  ['trophy-room', '/trophy-room/'],
  ['hunting', '/hunting/'],
  ['calendar', '/calendar/'],
  ['insights', '/insights/'],
  ['post', '/insights/how-to-know-when-your-bow-needs-tuning/'],
  ['faq', '/faq/'],
  ['contact', '/contact/'],
  ['careers', '/careers/'],
  ['404', '/404/'],
];

await mkdir(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--hide-scrollbars', '--force-color-profile=srgb', '--font-render-hinting=none'],
});

const page = await browser.newPage();
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);

let shots = 0;
for (const [name, route] of PAGES) {
  for (const width of WIDTHS) {
    await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
    await page.goto(BASE + route, { waitUntil: 'networkidle0', timeout: 60000 });
    // Nudge every lazy image into view, then settle.
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let y = 0;
        const step = () => {
          y += window.innerHeight;
          window.scrollTo(0, y);
          if (y < document.body.scrollHeight) setTimeout(step, 60);
          else { window.scrollTo(0, 0); setTimeout(resolve, 400); }
        };
        step();
      });
    });
    await new Promise((r) => setTimeout(r, 300));
    await page.screenshot({
      path: path.join(OUT, `${name}-${width}.png`),
      fullPage: true,
      captureBeyondViewport: true,
    });
    shots++;
  }
  console.log(`  ${name}`);
}

await browser.close();
console.log(`${shots} screenshots written to build/qa/`);
