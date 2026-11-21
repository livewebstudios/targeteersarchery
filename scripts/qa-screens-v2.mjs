/**
 * QA screenshots for the v2 home page demos. Same approach as qa-screens.mjs:
 * the local system Chrome through puppeteer-core, the gate cookie set first,
 * reduced motion forced so every signature move renders in its static state.
 *
 *   npm run build && npx astro preview --port 4390 &
 *   node scripts/qa-screens-v2.mjs
 *
 * Writes qa/v2/<page>-<width>.png, full page, at 390 and 1440.
 *
 *   --motion          one extra pass at 1440 with motion ON. Scrolls each demo
 *                     to its signature move and shoots it mid-flight and after,
 *                     into qa/v2/motion/.
 *   --only=demo-1     narrow the run (chooser, demo-1, demo-2, demo-3)
 *   --widths=390      narrow the widths
 *
 * QA_BASE overrides the server address. CHROME_PATH overrides the browser.
 */
import puppeteer from 'puppeteer-core';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.QA_BASE ?? 'http://localhost:4390';
const OUT = path.resolve(process.cwd(), 'qa/v2');
const CHROME =
  process.env.CHROME_PATH ??
  (process.platform === 'win32'
    ? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
    : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');

const arg = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
const MOTION = process.argv.includes('--motion');
const WIDTHS = arg('widths') ? arg('widths').split(',').map(Number) : [390, 1440];
const only = arg('only')?.split(',');

const ALL = [
  ['chooser', '/v2/', null],
  ['demo-1-route-46', '/v2/1-route-46/', '[data-r46-offer]'],
  ['demo-2-blackout', '/v2/2-blackout/', '[data-bk-seam]'],
  ['demo-3-since-1957', '/v2/3-since-1957/', '[data-s57-line]'],
];
const PAGES = ALL.filter(([name]) => !only || only.some((o) => name.startsWith(o)));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--hide-scrollbars', '--force-color-profile=srgb', '--font-render-hinting=none'],
});

// Past the pre-launch gate, the same way a visitor with the password is.
await browser.setCookie({ name: 'tgt_gate', value: 'open', domain: new URL(BASE).hostname, path: '/' });

async function open(width, reduced) {
  const page = await browser.newPage();
  await page.emulateMediaFeatures([
    { name: 'prefers-reduced-motion', value: reduced ? 'reduce' : 'no-preference' },
  ]);
  await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
  return page;
}

let shots = 0;

if (!MOTION) {
  await mkdir(OUT, { recursive: true });
  for (const [name, route] of PAGES) {
    for (const width of WIDTHS) {
      const page = await open(width, true);
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
      await page.evaluate(() => document.fonts.ready);
      await sleep(300);
      await page.screenshot({
        path: path.join(OUT, `${name}-${width}.png`),
        fullPage: true,
        captureBeyondViewport: true,
      });
      await page.close();
      shots++;
    }
    console.log(`  ${name}`);
  }
} else {
  // Motion on, 1440 only: prove each signature move actually runs.
  const dir = path.join(OUT, 'motion');
  await mkdir(dir, { recursive: true });
  for (const [name, route, move] of PAGES) {
    if (!move) continue;
    const page = await open(1440, false);
    await page.goto(BASE + route, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.evaluate(() => document.fonts.ready);
    const found = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: Math.max(0, top - window.innerHeight * 0.45), behavior: 'instant' });
      return true;
    }, move);
    if (!found) { console.log(`  ${name}: ${move} not found`); await page.close(); continue; }
    for (const [label, wait] of [['a-start', 250], ['b-mid', 450], ['c-settled', 2200]]) {
      await sleep(wait);
      await page.screenshot({ path: path.join(dir, `${name}-${label}.png`) });
      shots++;
    }
    await page.close();
    console.log(`  ${name} (motion)`);
  }
}

await browser.close();
console.log(`${shots} screenshots written to ${path.relative(process.cwd(), MOTION ? path.join(OUT, 'motion') : OUT)}/`);
