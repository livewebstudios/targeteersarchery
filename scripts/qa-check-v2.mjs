/**
 * Acceptance checks for the v2 home page demos (handoff section 9).
 * System Chrome through puppeteer-core, against `astro preview`.
 *
 *   npm run build && npx astro preview --port 4390 &
 *   node scripts/qa-check-v2.mjs
 *
 * Prints PASS or FAIL per check and writes qa/v2/qa-check.json.
 * QA_BASE overrides the server address. CHROME_PATH overrides the browser.
 */
import puppeteer from 'puppeteer-core';
import sharp from 'sharp';
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const AXE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const BASE = process.env.QA_BASE ?? 'http://localhost:4390';
const CHROME =
  process.env.CHROME_PATH ??
  (process.platform === 'win32'
    ? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
    : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');

const DEMOS = [
  ['demo-1', '/v2/1-route-46/'],
  ['demo-2', '/v2/2-blackout/'],
  ['demo-3', '/v2/3-since-1957/'],
];
const ALL = [['root', '/'], ['chooser', '/v2/'], ...DEMOS];
const WIDTHS = [360, 390, 768, 1024, 1440, 1920];

/** Largest display width per photo, in CSS px (handoff section 4.9). */
const CAPS = [
  ['showroom-02', Infinity], ['wall-of-bows-hero', Infinity], ['yukon', Infinity],
  ['british-columbia', Infinity], ['archive-', 340], ['range-wide', Infinity],
  ['bows-03', 1200], ['bows-01', 1200], ['camp-wide', 900], ['adult-wide', 760],
  ['counter-three-men', 560], ['rob-hoyt', 520], ['rob-at-the-bench', 480],
  ['counter-at-the-register', 400], ['coaching-kid', 420],
  ['dealer-of-the-year-2007', 110], ['hoyt-top-50', 110], ['family-owned-badge', 110],
  ['forest-wide', 1920], ['big-woods', 1920], ['logoRGB', 396],
];

const report = {};
let failed = 0;
const check = (name, ok, detail = '') => {
  report[name] = { ok, detail };
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  ${detail}` : ''}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--hide-scrollbars', '--force-color-profile=srgb'],
});

async function open(route, { width = 1440, height = 900, dpr = 1, gate = true, reduced = true, now = null } = {}) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: reduced ? 'reduce' : 'no-preference' }]);
  if (gate) await context.setCookie({ name: 'tgt_gate', value: 'open', domain: new URL(BASE).hostname, path: '/' });
  if (now !== null) {
    // Fake the clock before any page script runs.
    await page.evaluateOnNewDocument((ts) => {
      const Real = Date;
      // eslint-disable-next-line no-global-assign
      Date = class extends Real {
        constructor(...args) { super(...(args.length ? args : [ts])); }
        static now() { return ts; }
      };
    }, now);
  }
  await page.setViewport({ width, height, deviceScaleFactor: dpr });
  page.requests = [];
  page.on('request', (r) => page.requests.push({ url: r.url(), type: r.resourceType(), method: r.method() }));
  await page.goto(BASE + route, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  page.done = () => context.close();
  return page;
}

/** Scroll the whole page so every lazy image loads. */
async function loadAll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let y = 0;
      const step = () => {
        y += window.innerHeight * 0.8;
        window.scrollTo(0, y);
        if (y < document.body.scrollHeight) setTimeout(step, 50);
        else { window.scrollTo(0, 0); setTimeout(resolve, 300); }
      };
      step();
    });
    // Hidden images (a logo in a closed menu) never load lazily. Do not wait on them.
    const pending = [...document.images]
      .filter((img) => !img.complete && img.offsetParent !== null)
      .map((img) => new Promise((r) => { img.onload = img.onerror = r; }));
    await Promise.race([Promise.all(pending), new Promise((r) => setTimeout(r, 4000))]);
  });
}

/* ------------------------------------------------------------------- gate */
{
  const bad = [];
  for (const [name, route] of ALL) {
    const page = await open(route, { gate: false });
    const visible = await page.evaluate(() =>
      [...document.body.children].filter((el) => getComputedStyle(el).display !== 'none').map((el) => el.id || el.tagName));
    if (visible.join() !== 'site-gate') bad.push(`${name}: ${visible.join(',')}`);
    await page.done();
  }
  check('gate: a private window shows only the gate on all 5 routes', bad.length === 0, bad.join(' | '));
}
{
  // Hard rule 1: the gate renders exactly as it does today. /about/ is still on
  // the old layout, so it is the reference. Zero differing pixels allowed.
  const diffs = [];
  for (const [width, height] of [[1440, 900], [390, 844]]) {
    const shot = async (route) => {
      const page = await open(route, { width, height, gate: false });
      await sleep(400);
      const { data } = await sharp(await page.screenshot()).removeAlpha().raw().toBuffer({ resolveWithObject: true });
      await page.done();
      return data;
    };
    const ref = await shot('/about/');
    for (const [name, route] of ALL) {
      const got = await shot(route);
      let n = 0;
      for (let i = 0; i < ref.length; i += 3) if (Math.abs(ref[i] - got[i]) > 2 || Math.abs(ref[i + 1] - got[i + 1]) > 2 || Math.abs(ref[i + 2] - got[i + 2]) > 2) n++;
      if (n) diffs.push(`${name}@${width}: ${n} pixels differ`);
    }
  }
  check('gate: pixel for pixel the same as on the old layout, all 5 routes, 1440 and 390', diffs.length === 0, diffs.join(' | '));
}

/* ----------------------------------------- hrefs, anchors, h1, inline style */
{
  const dist = path.resolve('dist');
  const files = { root: 'index.html', chooser: 'v2/index.html', 'demo-1': 'v2/1-route-46/index.html', 'demo-2': 'v2/2-blackout/index.html', 'demo-3': 'v2/3-since-1957/index.html' };
  const DIRECTIONS = 'https://www.google.com/maps/dir/?api=1&destination=101+Route+46+West%2C+Saddle+Brook%2C+NJ+07663';
  const SOCIAL = ['https://www.facebook.com/Targeteers-Archery-192563160775417/', 'https://www.instagram.com/targeteersarchery/', 'https://twitter.com/TargeteerArcher'];
  const V2 = ['/v2/', '/v2/1-route-46/', '/v2/2-blackout/', '/v2/3-since-1957/'];
  const badHref = [], badAnchor = [], badH1 = [], inline = [], noindex = [];
  for (const [name, file] of Object.entries(files)) {
    const html = readFileSync(path.join(dist, file), 'utf8');
    // The gate is temporary chrome with its own markup. Check the page itself.
    const body = html.slice(html.indexOf('<body')).replace(/<div id="site-gate"[\s\S]*?<\/button>\s*<\/div>/, '');
    const hrefs = [...body.matchAll(/<a\b[^>]*\shref="([^"]*)"/g)].map((m) => m[1].replace(/&amp;/g, '&'));
    const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
    for (const h of hrefs) {
      const ok = h.startsWith('#') || h.startsWith('tel:') || h === DIRECTIONS || SOCIAL.includes(h) || V2.includes(h) || h === 'https://livewebstudios.com';
      if (!ok) badHref.push(`${name}: ${h}`);
      if (h.startsWith('#') && !ids.has(h.slice(1))) badAnchor.push(`${name}: ${h}`);
    }
    const main = body.slice(body.indexOf('<main'), body.indexOf('</main>'));
    const h1 = (main.match(/<h1\b/g) || []).length;
    if (h1 !== 1) badH1.push(`${name}: ${h1}`);
    const styles = (body.match(/\sstyle="/g) || []).length;
    if (styles) inline.push(`${name}: ${styles}`);
    if (!/<meta name="robots" content="noindex, nofollow"/.test(html)) noindex.push(name);
  }
  check('links: every href is #, tel:, directions, a social, a /v2/ route or the LWS credit', badHref.length === 0, badHref.join(' | '));
  check('links: every # link has a target on the page', badAnchor.length === 0, badAnchor.join(' | '));
  check('one h1 inside <main> on each page', badH1.length === 0, badH1.join(' | '));
  check('no inline style attributes in the built HTML', inline.length === 0, inline.join(' | '));
  check('noindex, nofollow on all 5 routes', noindex.length === 0, noindex.join(','));
  const sitemap = readdirSync(dist).filter((f) => f.startsWith('sitemap')).map((f) => readFileSync(path.join(dist, f), 'utf8')).join('');
  check('sitemap has no /v2/ route', !sitemap.includes('/v2/'));
  check('robots.txt disallows /v2/', readFileSync(path.join(dist, 'robots.txt'), 'utf8').includes('Disallow: /v2/'));
}

/* --------------------------------------------------------------- open now */
{
  // 2026-11-23 is a Monday, 2026-11-21 a Saturday. Times are Eastern (UTC-5).
  const cases = [
    ['Monday 3:00 pm', Date.UTC(2026, 10, 23, 20, 0), 'CLOSED · OPENS TUE 12 PM'],
    ['Saturday 2:30 pm', Date.UTC(2026, 10, 21, 19, 30), 'OPEN NOW · UNTIL 5 PM'],
    ['Saturday 9:00 am', Date.UTC(2026, 10, 21, 14, 0), 'CLOSED · OPENS TODAY 11 AM'],
    ['Sunday 6:00 pm', Date.UTC(2026, 10, 22, 23, 0), 'CLOSED · OPENS TUE 12 PM'],
    ['Friday 6:59 pm', Date.UTC(2026, 10, 20, 23, 59), 'OPEN NOW · UNTIL 7 PM'],
  ];
  const bad = [];
  for (const [label, ts, want] of cases) {
    for (const [name, route] of DEMOS) {
      const page = await open(route, { now: ts });
      const got = await page.$eval('[data-v2-open-text]', (el) => el.textContent.trim());
      const today = await page.$$eval('[data-v2-hours] tr[data-today] th', (els) => els.map((el) => el.firstChild.textContent.trim()));
      if (got !== want) bad.push(`${name} ${label}: "${got}"`);
      if (new Set(today).size !== 1 || !label.startsWith(today[0])) bad.push(`${name} ${label}: today row is ${today.join('/')}`);
      await page.done();
    }
  }
  check('open now: right for Eastern time on a faked clock (5 cases x 3 demos)', bad.length === 0, bad.join(' | '));
}

/* ------------------------------------------------- menu, form, switcher */
{
  const bad = [];
  for (const [name, route] of DEMOS) {
    const page = await open(route, { width: 390, height: 844 });
    const btn = '[data-v2-menu-button]';
    await page.click(btn);
    const opened = await page.evaluate(() => !document.querySelector('[data-v2-menu]').hidden && document.querySelector('[data-v2-menu-button]').getAttribute('aria-expanded') === 'true');
    if (!opened) bad.push(`${name}: menu did not open`);
    const count = await page.$$eval('[data-v2-menu] a, [data-v2-menu] button', (els) => els.length);
    if (count !== 9) bad.push(`${name}: menu has ${count} items, want 9`);
    // Tab well past the last item, then Shift+Tab: focus must stay in the panel.
    let trapped = true;
    for (let i = 0; i < count + 3; i++) {
      await page.keyboard.press('Tab');
      trapped &&= await page.evaluate(() => document.querySelector('[data-v2-menu]').contains(document.activeElement));
    }
    await page.keyboard.down('Shift');
    for (let i = 0; i < count + 3; i++) {
      await page.keyboard.press('Tab');
      trapped &&= await page.evaluate(() => document.querySelector('[data-v2-menu]').contains(document.activeElement));
    }
    await page.keyboard.up('Shift');
    if (!trapped) bad.push(`${name}: focus left the open menu`);
    await page.keyboard.press('Escape');
    const closed = await page.evaluate(() => document.querySelector('[data-v2-menu]').hidden && document.activeElement === document.querySelector('[data-v2-menu-button]'));
    if (!closed) bad.push(`${name}: Esc did not close the menu and return focus`);
    await page.click(btn);
    await page.click('[data-v2-menu] nav a[href="#visit"]');
    await sleep(300);
    const afterTap = await page.evaluate(() => ({ hidden: document.querySelector('[data-v2-menu]').hidden, hash: location.hash }));
    if (!afterTap.hidden || afterTap.hash !== '#visit') bad.push(`${name}: link tap gave ${JSON.stringify(afterTap)}`);
    await page.done();
  }
  check('mobile menu: opens, traps focus, closes on Esc and on link tap', bad.length === 0, bad.join(' | '));
}
{
  const bad = [];
  for (const [name, route] of DEMOS) {
    const page = await open(route);
    await page.$eval('[data-v2-form]', (f) => f.scrollIntoView({ block: 'center' }));
    await page.type('[data-v2-form] input[name="name"]', 'Test Person');
    await page.type('[data-v2-form] input[name="phone"]', '201 555 0100');
    await page.type('[data-v2-form] textarea', 'Do you restring crossbows?');
    const before = page.requests.length;
    await page.click('[data-v2-form] button[type="submit"]');
    await sleep(600);
    const note = await page.$eval('[data-v2-form-note]', (el) => (el.hidden ? '' : el.textContent.trim()));
    const sent = page.requests.slice(before).filter((r) => r.url.includes('formspree') || r.method === 'POST');
    if (note !== 'Demo form. Not connected yet.') bad.push(`${name}: note is "${note}"`);
    if (sent.length) bad.push(`${name}: sent ${sent.map((r) => r.url).join(',')}`);
    if (!page.url().endsWith(route)) bad.push(`${name}: navigated to ${page.url()}`);
    await page.done();
  }
  check('form: shows the demo note and sends nothing', bad.length === 0, bad.join(' | '));
}
{
  const bad = [];
  const want = ['/v2/', '/v2/1-route-46/', '/v2/2-blackout/', '/v2/3-since-1957/'];
  for (const [name, route] of ALL) {
    const page = await open(route);
    const links = await page.$$eval('.v2-switcher a', (els) => els.map((a) => new URL(a.href).pathname));
    const current = await page.$$eval('.v2-switcher a[aria-current="page"]', (els) => els.map((a) => new URL(a.href).pathname));
    if (links.join() !== want.join()) bad.push(`${name}: ${links.join(',')}`);
    if (current.length !== 1 || (route !== '/' && current[0] !== route)) bad.push(`${name}: current is ${current.join(',')}`);
    for (const target of want) {
      const res = await page.evaluate(async (u) => (await fetch(u)).status, target);
      if (res !== 200) bad.push(`${name}: ${target} gave ${res}`);
    }
    await page.done();
  }
  check('switcher: reaches all four pages from all four pages', bad.length === 0, bad.join(' | '));
}

/* --------------------------------------- horizontal scroll and photo caps */
{
  const scroll = [], caps = [], wide = [];
  for (const [name, route] of ALL.slice(1)) {
    for (const width of WIDTHS) {
      const page = await open(route, { width });
      await loadAll(page);
      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (over > 0) scroll.push(`${name}@${width}: +${over}px`);
      const imgs = await page.$$eval('main img, header img, footer img', (els) =>
        els.filter((el) => el.offsetParent !== null).map((el) => ({ src: el.currentSrc || el.src, w: el.getBoundingClientRect().width, natural: el.naturalWidth })));
      for (const img of imgs) {
        const file = decodeURIComponent(img.src.split('/').pop());
        const cap = CAPS.find(([key]) => file.includes(key));
        if (cap && img.w > cap[1] + 0.5) caps.push(`${name}@${width}: ${cap[0]} shown at ${Math.round(img.w)}px, cap ${cap[1]}`);
      }
      await page.done();
    }
  }
  check('no horizontal scroll at 360, 390, 768, 1024, 1440, 1920', scroll.length === 0, scroll.join(' | '));
  check('no photo displayed past its cap at any of the six widths', caps.length === 0, caps.join(' | '));

  // At 2x, the offering and archive photos must be served at 2x of their display size.
  const soft = [];
  const KEYS = ['bows-01', 'range-wide', 'rob-at-the-bench', 'coaching-kid', 'adult-wide', 'camp-wide', 'archive-', 'counter-at-the-register', 'counter-three-men'];
  for (const [name, route] of DEMOS) {
    for (const width of [390, 1440]) {
      const page = await open(route, { width, dpr: 2 });
      await loadAll(page);
      // naturalWidth is density-corrected for srcset images, so decode the file
      // the browser actually chose and read its real pixel width.
      const imgs = await page.evaluate(async (keys) => {
        const out = [];
        for (const el of document.querySelectorAll('main img')) {
          const src = el.currentSrc || el.src;
          if (el.offsetParent === null || !keys.some((k) => src.includes(k))) continue;
          const bitmap = await createImageBitmap(await (await fetch(src)).blob());
          out.push({ src, w: el.getBoundingClientRect().width, natural: bitmap.width });
        }
        return out;
      }, KEYS);
      for (const img of imgs) {
        const file = decodeURIComponent(img.src.split('/').pop());
        if (!KEYS.some((k) => file.includes(k))) continue;
        if (img.natural < img.w * 2 * 0.97) soft.push(`${name}@${width}: ${file.split('.')[0]} is ${img.natural}px for ${Math.round(img.w)}px at 2x`);
        if (img.w > img.natural) wide.push(`${name}@${width}: ${file.split('.')[0]} upscaled`);
      }
      await page.done();
    }
  }
  check('offering and archive photos are sharp at 2x', soft.length === 0 && wide.length === 0, [...soft, ...wide].join(' | '));
}

/* -------------------------------------------------------------------- axe */
{
  const hits = [];
  for (const [name, route] of ALL.slice(1)) {
    for (const width of [390, 1440]) {
      const page = await open(route, { width });
      await loadAll(page);
      await page.evaluate(AXE);
      const results = await page.evaluate(async () =>
        await globalThis['axe'].run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } }));
      for (const v of results.violations) {
        for (const n of v.nodes) hits.push(`${name}@${width} [${v.id}] ${n.target.join(' ')}`);
      }
      report[`axe ${name}@${width}`] = { ok: results.violations.length === 0, detail: `${results.violations.length} violations, ${results.passes.length} rules passed` };
      await page.done();
    }
  }
  check('axe: zero violations on the chooser and each demo, 390 and 1440', hits.length === 0, hits.slice(0, 12).join(' | '));
}

/* ------------------------------------------------------ text over photos */
{
  const lum = ([r, g, b]) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const BANDS = [
    ['demo-1', '/v2/1-route-46/', '.r46-hunt', '.r46-hunt h2, .r46-hunt p'],
    ['demo-2', '/v2/2-blackout/', '.bk-hero', '.bk-hero h1, .bk-hero p, .bk-nav a, .bk-btn--secondary, .bk-header__call, .bk-menu-btn'],
    ['demo-2', '/v2/2-blackout/', '.bk-hunt', '.bk-hunt h2, .bk-hunt p'],
    ['demo-3', '/v2/3-since-1957/', '.s57-hunt', '.s57-hunt h2, .s57-hunt p'],
  ];
  const fails = [], lines = [];
  for (const [name, route, band, textSel] of BANDS) {
    for (const width of [390, 768, 1024, 1440]) {
      const page = await open(route, { width, height: width === 390 ? 844 : 900 });
      await loadAll(page);
      await page.$eval(band, (el) => el.scrollIntoView({ block: 'start' }));
      await page.evaluate(() => window.scrollBy(0, -140));
      await sleep(500);
      const items = await page.$$eval(textSel, (els) =>
        els.filter((el) => el.offsetParent !== null && el.getBoundingClientRect().width > 0).map((el) => {
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          const size = parseFloat(cs.fontSize);
          const bold = Number(cs.fontWeight) >= 700;
          return {
            text: el.textContent.trim().slice(0, 28),
            x: r.left, y: r.top, w: r.width, h: r.height,
            color: cs.color.match(/[\d.]+/g).slice(0, 3).map(Number),
            large: size >= 24 || (size >= 18.66 && bold),
          };
        }).filter((i) => i.y >= 0 && i.y + i.h <= window.innerHeight));
      // Hide the glyphs, keep the layout, and photograph what sits behind them.
      // The review switcher and the action bar float over the page. They are not its ground.
      await page.addStyleTag({ content: `${textSel.split(',').map((s) => s.trim()).join(',')}{color:transparent!important;-webkit-text-stroke:0!important}.v2-switcher,.v2-actionbar{display:none!important}` });
      await sleep(250);
      const { data, info } = await sharp(await page.screenshot()).removeAlpha().raw().toBuffer({ resolveWithObject: true });
      for (const it of items) {
        let brightest = 0, px = [0, 0, 0];
        // Inset 2px so an outlined button's own border is not read as its ground.
        const x0 = Math.max(0, Math.floor(it.x) + 2), x1 = Math.min(info.width, Math.ceil(it.x + it.w) - 2);
        const y0 = Math.max(0, Math.floor(it.y) + 2), y1 = Math.min(info.height, Math.ceil(it.y + it.h) - 2);
        for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
          const i = (y * info.width + x) * 3;
          const l = lum([data[i], data[i + 1], data[i + 2]]);
          if (l > brightest) { brightest = l; px = [data[i], data[i + 1], data[i + 2]]; }
        }
        const fg = lum(it.color);
        const ratio = (Math.max(fg, brightest) + 0.05) / (Math.min(fg, brightest) + 0.05);
        const need = it.large ? 3 : 4.5;
        lines.push(`${name}@${width} ${band} "${it.text}" ${ratio.toFixed(2)} (needs ${need}) over rgb(${px.join(',')})`);
        if (ratio < need) fails.push(`${name}@${width} "${it.text}" ${ratio.toFixed(2)} < ${need}`);
      }
      await page.done();
    }
  }
  report['text over photos, every sample'] = { ok: fails.length === 0, detail: lines };
  const worst = lines.map((l) => Number(l.match(/" ([\d.]+) \(/)[1])).sort((a, b) => a - b)[0];
  check('text over photos: brightest pixel under every text block holds its ratio', fails.length === 0, fails.length ? fails.join(' | ') : `${lines.length} blocks sampled, lowest ${worst}:1`);
}

/* ------------------------------------------------------------------ fonts */
{
  const want = {
    'demo-1': ['libre-baskerville', 'nunito-sans'],
    'demo-2': ['barlow-condensed', 'instrument-sans'],
    'demo-3': ['zilla-slab', 'instrument-sans'],
  };
  const bad = [], seen = [];
  for (const [name, route] of DEMOS) {
    const page = await open(route);
    await loadAll(page);
    const fonts = [...new Set(page.requests.filter((r) => r.type === 'font').map((r) => r.url.split('/').pop().replace(/-(latin|latin-ext|cyrillic|vietnamese|greek)[\w-]*\.[\w.]+$/, '').replace(/\.[\w]+$/, '')))];
    const families = [...new Set(fonts.map((f) => want[name].find((w) => f.includes(w)) ?? f))];
    seen.push(`${name}: ${families.join(', ')}`);
    for (const f of families) if (!want[name].includes(f)) bad.push(`${name} fetched ${f}`);
    await page.done();
  }
  check('each demo downloads only its own fonts', bad.length === 0, bad.length ? bad.join(' | ') : seen.join(' | '));
}

/* --------------------------------------------- reduced motion, static state */
{
  const bad = [];
  let page = await open('/v2/1-route-46/');
  await loadAll(page);
  const arrows = await page.$$eval('.r46-shot__arrow', (els) => els.map((el) => { const cs = getComputedStyle(el); return cs.opacity === '1' && (cs.transform === 'none' || cs.transform === 'matrix(1, 0, 0, 1, 0, 0)'); }));
  if (arrows.length !== 6 || arrows.includes(false)) bad.push(`demo-1: arrows at rest ${arrows.filter(Boolean).length}/6`);
  await page.done();
  page = await open('/v2/2-blackout/');
  await loadAll(page);
  const heads = await page.$$eval('.bk-seam', (els) => els.map((el) => getComputedStyle(el.querySelector('.bk-seam__head')).display !== 'none' && getComputedStyle(el.querySelector('.bk-seam__arrow')).display === 'none'));
  if (heads.length !== 5 || heads.includes(false)) bad.push(`demo-2: static arrowheads ${heads.filter(Boolean).length}/5`);
  await page.done();
  page = await open('/v2/3-since-1957/');
  await loadAll(page);
  const stops = await page.$$eval('.s57-stop', (els) => els.map((el) => el.classList.contains('is-passed') && getComputedStyle(el.firstElementChild).opacity === '1'));
  if (stops.length !== 3 || stops.includes(false)) bad.push(`demo-3: stops at full ${stops.filter(Boolean).length}/3`);
  await page.done();
  const hidden = [];
  for (const [name, route] of DEMOS) {
    page = await open(route);
    const n = await page.$$eval('[data-reveal]', (els) => els.filter((el) => getComputedStyle(el).opacity !== '1').length);
    if (n) hidden.push(`${name}: ${n} reveal blocks hidden`);
    await page.done();
  }
  check('reduced motion: every signature move rests in its static state, nothing hidden', bad.length === 0 && hidden.length === 0, [...bad, ...hidden].join(' | '));
}

/* --------------------------------------------- motion on: each move runs */
{
  const bad = [];
  let page = await open('/v2/1-route-46/', { reduced: false });
  await page.$eval('[data-r46-offer]', (el) => el.scrollIntoView({ block: 'start' }));
  await sleep(2600);
  const hit = await page.$$eval('.r46-card.is-hit', (els) => els.length);
  if (hit !== 6) bad.push(`demo-1: ${hit}/6 cards hit`);
  await page.done();
  page = await open('/v2/2-blackout/', { reduced: false });
  // Instant jumps: with motion on the page smooth-scrolls, and a scripted loop would outrun it.
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 300) { window.scrollTo({ top: y, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 120)); } });
  await sleep(500);
  const shot = await page.$$eval('.bk-seam.is-shot', (els) => els.length);
  if (shot !== 5) bad.push(`demo-2: ${shot}/5 seams shot`);
  await page.done();
  page = await open('/v2/3-since-1957/', { reduced: false });
  const positions = [];
  for (const offset of [0.85, 0.6, 0.3]) {
    await page.evaluate((o) => { const el = document.querySelector('[data-s57-line]'); window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - window.innerHeight * o, behavior: 'instant' }); }, offset);
    await sleep(400);
    positions.push(await page.evaluate(() => ({ x: Math.round(document.querySelector('[data-s57-arrow]').getBoundingClientRect().right), passed: document.querySelectorAll('.s57-stop.is-passed').length })));
  }
  if (!(positions[0].x < positions[1].x && positions[1].x < positions[2].x)) bad.push(`demo-3: arrow did not advance ${JSON.stringify(positions)}`);
  if (positions[0].passed !== 1 || positions[2].passed !== 3) bad.push(`demo-3: stops passed ${positions.map((p) => p.passed).join(',')}`);
  const inline = await page.evaluate(() => document.querySelectorAll('main [style]').length);
  if (inline) bad.push(`demo-3: ${inline} inline styles written at runtime`);
  await page.done();
  check('motion on: arrows land (1), seams fire (2), the timeline arrow tracks scroll (3)', bad.length === 0, bad.length ? bad.join(' | ') : `demo-3 arrow x ${positions.map((p) => p.x).join(' > ')}`);
}

await browser.close();
mkdirSync(path.resolve('qa/v2'), { recursive: true });
writeFileSync(path.resolve('qa/v2/qa-check.json'), JSON.stringify(report, null, 2));
console.log(`\n${failed === 0 ? 'All checks passed.' : `${failed} check(s) failed.`} Details in qa/v2/qa-check.json`);
process.exit(failed === 0 ? 0 : 1);
