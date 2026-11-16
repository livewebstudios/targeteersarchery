/**
 * QA screenshots. Drives the local system Chrome through puppeteer-core, so
 * nothing large gets installed into the project.
 *
 *   npm run build && npx astro preview --port 4322 &
 *   node scripts/qa-screens.mjs
 *
 * Writes qa/<page>-<width>.png. Reduced motion is forced so the pinned
 * sections render as their static fallbacks rather than mid-animation.
 *
 * The pre-launch gate covers every page, so the gate cookie is set first.
 *
 *   node scripts/qa-screens.mjs --demos   # only /demos/ and the three demos,
 *                                         # at 390 and 1440
 */
import puppeteer from 'puppeteer-core';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.QA_BASE ?? 'http://localhost:4322';
const OUT = path.resolve(process.cwd(), 'qa');
const CHROME =
  process.env.CHROME_PATH ??
  (process.platform === 'win32'
    ? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
    : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');

const DEMOS = process.argv.includes('--demos');

const DEMO_PAGES = [
  ['demos', '/demos/'],
  ['demo-1-base-camp', '/demos/1-base-camp/'],
  ['demo-2-trailhead', '/demos/2-trailhead/'],
  ['demo-3-long-shot', '/demos/3-long-shot/'],
];

const WIDTHS = DEMOS ? [390, 1440] : [375, 768, 1280, 1920];
const SITE_PAGES = [
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
const PAGES = DEMOS ? DEMO_PAGES : SITE_PAGES;

await mkdir(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--hide-scrollbars', '--force-color-profile=srgb', '--font-render-hinting=none'],
});

const page = await browser.newPage();
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
// Past the pre-launch gate, the same way a visitor with the password is.
await page.setCookie({ name: 'tgt_gate', value: 'open', url: BASE });

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
console.log(`${shots} screenshots written to qa/`);
