/**
 * Open Graph cards, one per major page.
 *
 * Composited with sharp from an SVG template: cream ground, a huge ring
 * watermark bleeding off the right edge, the page title in Fraunces, and the
 * real logo bottom-left. 1200x630, written to public/og/.
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const OUT = path.resolve(process.cwd(), 'public', 'og');
const LOGO = path.resolve(process.cwd(), 'public', 'images', 'logoRGB.png');

await mkdir(OUT, { recursive: true });

/* librsvg renders through fontconfig, which cannot read the .woff2 files that
   @fontsource ships. These cards are generated on the Mac and committed as
   static JPGs, so the closest installed faces are used instead: Charter for the
   display (a sturdy transitional, near Fraunces in feel) and Helvetica Neue for
   the labels. Nothing here is needed at deploy time. */
const DISPLAY = 'Charter, Georgia, Palatino, serif';
const LABEL = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Naive greedy wrap; the display size is fixed so a char estimate is fine. */
function wrap(text, max) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > max && line) { lines.push(line.trim()); line = w; }
    else line += ' ' + w;
  }
  if (line.trim()) lines.push(line.trim());
  return lines.slice(0, 3);
}

function template({ eyebrow, title, tone }) {
  const dark = tone === 'pine';
  const bg = dark ? '#14261B' : '#F8F5EE';
  const fg = dark ? '#F8F5EE' : '#3B2E23';
  const ring = dark ? '#9DB59A' : '#D9CBAE';
  const accent = '#C8862B';
  const size = title.length > 42 ? 64 : title.length > 26 ? 76 : 90;
  const lines = wrap(title, title.length > 42 ? 26 : 20);
  // Vertically centre the title block in the space between eyebrow and logo.
  // Title sits between the eyebrow (y 130) and the logo (top 452).
  const block = lines.length * size * 1.14;
  const startY = 168 + (268 - block) / 2 + size * 0.76;

  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${bg}"/>
  <g fill="none" stroke="${ring}" stroke-width="2" opacity="${dark ? 0.28 : 0.75}">
    <circle cx="1090" cy="315" r="330"/>
    <circle cx="1090" cy="315" r="252"/>
    <circle cx="1090" cy="315" r="174"/>
    <circle cx="1090" cy="315" r="96"/>
  </g>
  <circle cx="1090" cy="315" r="30" fill="#B7412E" opacity="${dark ? 0.85 : 0.9}"/>
  <rect x="0" y="0" width="14" height="630" fill="${accent}"/>
  <text x="86" y="130" font-family="${LABEL}" font-size="21" font-weight="700"
        letter-spacing="3.4" fill="${accent}">${esc(eyebrow.toUpperCase())}</text>
  ${lines
    .map(
      (l, i) =>
        `<text x="82" y="${startY + i * size * 1.14}" font-family="${DISPLAY}" font-size="${size}" font-weight="400" fill="${fg}">${esc(l)}</text>`,
    )
    .join('\n  ')}
  <text x="86" y="604" font-family="${LABEL}" font-size="18" font-weight="500"
        letter-spacing="0.8" fill="${dark ? 'rgba(248,245,238,.6)' : '#8E877A'}">101 Route 46 West · Saddle Brook, New Jersey · Since 1957</text>
</svg>`);
}

const PAGES = [
  { file: 'default', eyebrow: 'Targeteers Archery', title: 'Archery, the way it has been done here for three generations.', tone: 'pine' },
  { file: 'home', eyebrow: 'Since 1957', title: 'Archery, the way it has been done here for three generations.', tone: 'pine' },
  { file: 'about', eyebrow: 'The family story', title: 'Three generations. One counter.', tone: 'cream' },
  { file: 'pro-shop', eyebrow: 'The pro shop', title: '100s of bows on the wall. Zero pressure.', tone: 'cream' },
  { file: 'mathews', eyebrow: 'Mathews Archery', title: 'Mathews dealer in North Jersey', tone: 'cream' },
  { file: 'hoyt', eyebrow: 'Hoyt', title: 'Hoyt dealer in North Jersey', tone: 'cream' },
  { file: 'sitka', eyebrow: 'SITKA Gear', title: 'SITKA layering for the northeast', tone: 'pine' },
  { file: 'services', eyebrow: 'Services', title: 'The bench is the reason this shop is still here.', tone: 'cream' },
  { file: 'bow-tuning', eyebrow: 'Bow tuning', title: 'What actually happens when we tune your bow.', tone: 'cream' },
  { file: 'lessons', eyebrow: 'Lessons', title: 'Never held a bow? That is the whole point.', tone: 'cream' },
  { file: 'leagues', eyebrow: 'Leagues', title: 'Eight weeks, one night, the same lane.', tone: 'pine' },
  { file: 'kids', eyebrow: 'Kids archery camp', title: 'Every kid hits something on the first day.', tone: 'cream' },
  { file: 'groups', eyebrow: 'Groups & events', title: 'Put a room full of people on the line.', tone: 'pine' },
  { file: 'range', eyebrow: 'The range', title: 'Eleven lanes. Air conditioned. 27 yards.', tone: 'pine' },
  { file: 'waiver', eyebrow: 'Before you shoot', title: 'The range waiver.', tone: 'cream' },
  { file: 'calendar', eyebrow: 'Calendar', title: 'What is happening, and what is open.', tone: 'cream' },
  { file: 'hunting', eyebrow: 'Hunting', title: 'Planning a hunting trip?', tone: 'pine' },
  { file: 'trophy-room', eyebrow: 'The Trophy Room', title: 'Two hundred mounts. One polar bear.', tone: 'pine' },
  { file: 'insights', eyebrow: 'Insights', title: 'Notes from behind the counter.', tone: 'cream' },
  { file: 'faq', eyebrow: 'Questions', title: 'The things people actually ask.', tone: 'cream' },
  { file: 'contact', eyebrow: 'Contact', title: '101 Route 46 West, Saddle Brook.', tone: 'cream' },
  { file: 'careers', eyebrow: 'Careers', title: 'Work behind the counter.', tone: 'cream' },
];

const logo = existsSync(LOGO)
  ? await sharp(LOGO).resize(300, null, { kernel: 'lanczos3' }).png().toBuffer()
  : null;
const logoDark = logo
  ? await sharp({
      create: { width: 336, height: 148, channels: 4, background: { r: 248, g: 245, b: 238, alpha: 1 } },
    })
      .composite([{ input: logo, gravity: 'centre' }])
      .png()
      .toBuffer()
  : null;

for (const page of PAGES) {
  // density 72 keeps the rendered bitmap at exactly the SVG's 1200x630,
  // so the composite coordinates below are in the same frame as the layout.
  const base = sharp(template(page), { density: 72 });
  const layers = [];
  if (page.tone === 'pine' && logoDark) layers.push({ input: logoDark, top: 440, left: 68 });
  else if (logo) layers.push({ input: logo, top: 452, left: 82 });
  await base.composite(layers).jpeg({ quality: 88, mozjpeg: true }).toFile(path.join(OUT, `${page.file}.jpg`));
}
console.log(`${PAGES.length} OG cards written to public/og/`);
