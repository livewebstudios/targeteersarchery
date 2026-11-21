/**
 * Lighthouse, mobile, on the v2 home page demos, against `astro preview`.
 *
 *   npm run build && npx astro preview --port 4390 &
 *   node scripts/qa-lighthouse-v2.mjs
 *
 * The pre-launch gate hides every page. So a throwaway Chrome profile is made
 * first and the gate cookie is saved into it, then Lighthouse launches its own
 * Chrome on that profile with storage reset turned off. Lighthouse comes from
 * npx and is not a project dependency. Reports go to
 * qa/v2/lighthouse-<page>.json.
 *
 * SEO reads low on purpose: every v2 route is noindex.
 */
import puppeteer from 'puppeteer-core';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const BASE = process.env.QA_BASE ?? 'http://localhost:4390';
const CHROME =
  process.env.CHROME_PATH ??
  (process.platform === 'win32'
    ? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
    : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
const OUT = path.resolve('qa/v2');
const PAGES = [
  ['demo-1-route-46', '/v2/1-route-46/'],
  ['demo-2-blackout', '/v2/2-blackout/'],
  ['demo-3-since-1957', '/v2/3-since-1957/'],
  ['chooser', '/v2/'],
];

mkdirSync(OUT, { recursive: true });
const profile = mkdtempSync(path.join(os.tmpdir(), 'tgt-lh-'));
{
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', userDataDir: profile });
  // An expiry makes the cookie persistent, so it is written to the profile.
  await browser.setCookie({ name: 'tgt_gate', value: 'open', domain: new URL(BASE).hostname, path: '/', expires: Math.floor(Date.now() / 1000) + 86400 });
  const page = await browser.newPage();
  await page.goto(BASE + '/v2/', { waitUntil: 'networkidle0' });
  await browser.close();
}

for (const [name, route] of PAGES) {
  const file = path.join(OUT, `lighthouse-${name}.json`);
  execFileSync('npx', [
    '-y', 'lighthouse', BASE + route,
    `--chrome-flags=--headless=new --user-data-dir=${profile} --hide-scrollbars`,
    '--disable-storage-reset', '--form-factor=mobile',
    '--only-categories=performance,accessibility,best-practices,seo',
    '--output=json', `--output-path=${file}`, '--quiet',
  ], { stdio: ['ignore', 'ignore', 'inherit'] });
  const lhr = JSON.parse(readFileSync(file, 'utf8'));
  const score = (id) => Math.round(lhr.categories[id].score * 100);
  const a = lhr.audits;
  console.log(
    `${name.padEnd(20)} perf ${score('performance')}  a11y ${score('accessibility')}  bp ${score('best-practices')}  seo ${score('seo')}` +
    `   LCP ${a['largest-contentful-paint'].displayValue}  CLS ${a['cumulative-layout-shift'].displayValue}  TBT ${a['total-blocking-time'].displayValue}`,
  );
  for (const cat of ['accessibility', 'best-practices']) {
    for (const ref of lhr.categories[cat].auditRefs) {
      const audit = a[ref.id];
      if (audit.score !== null && audit.score < 1 && ref.weight > 0) console.log(`    ${cat}: ${ref.id}  ${audit.title}`);
    }
  }
  const final = lhr.finalDisplayedUrl ?? lhr.finalUrl;
  if (!final.endsWith(route)) console.log(`    note: ended on ${final}`);
}
rmSync(profile, { recursive: true, force: true });
