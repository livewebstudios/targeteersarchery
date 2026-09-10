/**
 * Targeteers Archery — asset preparation.
 *
 * Reads from the LOCAL-ONLY working folder `../assets/` (never committed) and
 * writes optimised, colour-corrected images into `src/assets/`, which is what
 * the site actually imports through astro:assets.
 *
 * Run once after a fresh clone that has the working folder alongside it:
 *   node scripts/prepare-assets.mjs
 *
 * Treatments
 *   plain     — resize + light sharpen only
 *   neutral   — grey-world white balance, for the store and range shots that
 *               were lit by whatever fluorescent tubes were overhead
 *   desat     — the same balance, pushed harder, plus a saturation pull-back
 *               (the bow wall is painted green and lit green)
 *   archival  — 2x lanczos upscale, warm tone, fine grain: vintage prints
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd(), '..');
const MEDIA = path.join(ROOT, 'assets', 'extracted-media');
const OUT = path.resolve(process.cwd(), 'src', 'assets');

let made = 0, skipped = 0;

/** Fine monochrome grain tile, composited in `overlay` so it reads as film. */
async function grainTile(size = 256, strength = 14) {
  const px = Buffer.alloc(size * size * 3);
  for (let i = 0; i < size * size; i++) {
    const v = 128 + Math.round((Math.random() - 0.5) * strength * 2);
    px[i * 3] = px[i * 3 + 1] = px[i * 3 + 2] = v;
  }
  return sharp(px, { raw: { width: size, height: size, channels: 3 } }).png().toBuffer();
}
let GRAIN;

/**
 * Grey-world white balance. Scales each channel toward the overall mean, damped
 * so the result stays warm rather than clinical. Handles the green fluorescent
 * cast in the range shots and the yellow tungsten cast in the showroom shots
 * with one rule, instead of a per-photo guess.
 */
async function whiteBalance(buffer, strength) {
  const { channels } = await sharp(buffer).stats();
  const means = channels.slice(0, 3).map((c) => c.mean);
  const avg = means.reduce((a, b) => a + b, 0) / 3;
  const k = means.map((m) => (m > 1 ? 1 + strength * (avg / m - 1) : 1));
  // Keep every multiplier inside a sane band; a blown-out source should not
  // send one channel to the moon.
  const clamped = k.map((v) => Math.min(1.35, Math.max(0.75, v)));
  return sharp(buffer).linear(clamped, [0, 0, 0]);
}

async function prepImage(src, dest, opts = {}) {
  const { width, height, treatment = 'plain', fit = 'cover', position = 'centre', quality = 82, format = 'jpg' } = opts;
  const from = path.isAbsolute(src) ? src : path.join(MEDIA, src);
  if (!existsSync(from)) { console.warn('  ! missing source:', src); skipped++; return; }
  const to = path.join(OUT, dest);
  await mkdir(path.dirname(to), { recursive: true });

  let img = sharp(from, { failOn: 'none' }).rotate();
  const meta = await img.metadata();

  if (treatment === 'archival') {
    const w = width ?? Math.min((meta.width ?? 800) * 2, 2400);
    const h = height ?? Math.round(w * ((meta.height ?? 600) / (meta.width ?? 800)));
    img = img.resize(w, h, { kernel: 'lanczos3', fit, position });
    // Warm archival tone: pull saturation back, then lift red / drop blue per
    // channel. (sharp's tint() discards chroma entirely, which reads as B&W.)
    img = img.modulate({ saturation: 0.42, brightness: 1.04 });
    img = img.linear([1.10, 1.02, 0.88], [-4, -4, 2]).sharpen({ sigma: 0.7 });
    GRAIN ??= await grainTile(256, 14);
    img = sharp(await img.toBuffer()).composite([{ input: GRAIN, tile: true, blend: 'overlay' }]);
  } else {
    if (width || height) img = img.resize(width, height, { fit, position, withoutEnlargement: false, kernel: 'lanczos3' });
    if (treatment === 'neutral') {
      img = await whiteBalance(await img.toBuffer(), 0.72);
      img = img.modulate({ saturation: 0.94 }).linear(1.05, -7);
    } else if (treatment === 'desat') {
      img = await whiteBalance(await img.toBuffer(), 0.9);
      img = img.modulate({ saturation: 0.34, brightness: 1.04 }).linear(1.08, -10);
    }
    img = img.sharpen({ sigma: 0.6 });
  }

  if (format === 'png') await img.png({ quality, compressionLevel: 9 }).toFile(to);
  else await img.jpeg({ quality, mozjpeg: true, chromaSubsampling: '4:4:4' }).toFile(to);
  made++;
}

/* ---------------------------------------------------------------- brand -- */
async function brand() {
  // The logo is handled by scripts/fix-logo.mjs (it needs alpha reconstruction).
  const poster = process.env.HERO_POSTER;
  if (poster && existsSync(poster)) {
    await mkdir(path.join(OUT, 'hero'), { recursive: true });
    await sharp(poster).resize(1920, null, { kernel: 'lanczos3' })
      .jpeg({ quality: 78, mozjpeg: true }).toFile(path.join(OUT, 'hero', 'hero-poster.jpg'));
    made++;
  }
  const bg = path.join(ROOT, 'assets', 'images', 'background.jpg');
  if (existsSync(bg)) await prepImage(bg, 'hero/mountains.jpg', { width: 1920, height: 800, quality: 80 });
}

/* ------------------------------------------------------------- manifest -- */
const JOBS = [
  // --- the family story (archival prints) ---
  ['uploads/2020/11/men-300x242-1.jpg',    'story/counter-three-men.jpg',  { treatment: 'archival', width: 900 }],
  ['uploads/2020/11/nonna-265x300-1.jpg',  'story/counter-at-the-register.jpg', { treatment: 'archival', width: 760 }],
  ['uploads/2020/11/aboutus2.jpg',         'story/archive-outdoor-range.jpg',   { treatment: 'archival', width: 640 }],
  ['uploads/2020/11/aboutus3.jpg',         'story/archive-group-target.jpg',    { treatment: 'archival', width: 640 }],
  ['uploads/2020/11/rob-hoyt.jpg',         'story/rob-hoyt.jpg',                { treatment: 'neutral', width: 1086 }],
  ['uploads/2020/11/robservices.jpg',      'story/rob-at-the-bench.jpg',        { treatment: 'archival', width: 800 }],
  ['uploads/2020/11/familyowned.jpg',      'story/family-owned-mark.jpg',       { width: 630 }],

  // --- awards ---
  ['uploads/2020/11/2007-award.jpg',          'awards/dealer-of-the-year-2007.jpg', { width: 424 }],
  ['uploads/2020/11/hoyt-top-50dealer.jpg',   'awards/hoyt-top-50.jpg',             { width: 450 }],
  ['uploads/2020/11/dealer2007-square.jpg',   'awards/dealer-2007-badge.jpg',       { width: 450 }],
  ['uploads/2020/11/family-owned-square.jpg', 'awards/family-owned-badge.jpg',      { width: 450 }],

  // --- pro shop ---
  ['uploads/2020/11/slider-wall-bows06.jpg', 'shop/wall-of-bows.jpg',   { treatment: 'desat',  width: 1920, height: 800 }],
  ['galleries/store-7/store-pic09.jpeg',     'shop/showroom-01.jpg',    { treatment: 'neutral', width: 1620, height: 1080 }],
  ['galleries/store-7/store-pic06.jpg',      'shop/showroom-02.jpg',    { treatment: 'neutral', width: 1620, height: 1080 }],
  ['galleries/store-7/store-pic04.jpeg',     'shop/showroom-03.jpg',    { treatment: 'neutral', width: 1620, height: 1080 }],
  ['galleries/store-7/store-pic013.jpeg',    'shop/showroom-04.jpg',    { treatment: 'neutral', width: 1620, height: 1080 }],
  ['galleries/store-7/store-pic010.jpeg',    'shop/showroom-05.jpg',    { treatment: 'neutral', width: 1620, height: 1080 }],
  ['galleries/store-7/store-pic07.jpeg',     'shop/showroom-06.jpg',    { treatment: 'neutral', width: 1620, height: 1080 }],
  ['galleries/store-7/store-pic08.jpeg',     'shop/showroom-07.jpg',    { treatment: 'neutral', width: 1620, height: 1080 }],
  ['galleries/store-7/store-pic017.jpg',     'shop/showroom-wide.jpg',  { treatment: 'neutral', width: 1800, height: 750 }],
  ['galleries/store-7/store-pic02.jpg',      'shop/showroom-wide-2.jpg',{ treatment: 'neutral', width: 1800, height: 750 }],
  ['galleries/bows/bows-01.jpeg',            'shop/bows-01.jpg',        { treatment: 'neutral', width: 1200, height: 900 }],
  ['galleries/bows/bows-03.jpeg',            'shop/bows-02.jpg',        { treatment: 'neutral', width: 1200, height: 900 }],
  ['galleries/bows/bows-05.jpeg',            'shop/bows-03.jpg',        { treatment: 'neutral', width: 1200, height: 900 }],
  ['galleries/bows/bows-06.jpeg',            'shop/bows-04.jpg',        { treatment: 'neutral', width: 1200, height: 900 }],
  ['galleries/bows/bows-07.jpeg',            'shop/bows-05.jpg',        { treatment: 'neutral', width: 1200, height: 900 }],
  ['galleries/bows/bows-02.jpeg',            'shop/bows-tall-01.jpg',   { treatment: 'neutral', width: 900, height: 1200 }],
  ['galleries/arrows/arrows-01.jpg',         'shop/arrows-01.jpg',      { treatment: 'neutral', width: 1000, height: 1000 }],
  ['galleries/arrows/arrows-02.jpg',         'shop/arrows-02.jpg',      { treatment: 'neutral', width: 1000, height: 1000 }],
  ['galleries/arrows/arrows-03.jpg',         'shop/arrows-03.jpg',      { treatment: 'neutral', width: 1000, height: 1000 }],
  ['galleries/arrows/arrows-05.jpg',         'shop/arrows-04.jpg',      { treatment: 'neutral', width: 900, height: 1200 }],
  ['galleries/arrows/arrows-06.jpg',         'shop/arrows-05.jpg',      { treatment: 'neutral', width: 1000, height: 1000 }],
  ['uploads/2020/11/slider-arrows.jpg',      'shop/arrows-wide.jpg',    { treatment: 'neutral', width: 1920, height: 800 }],
  // Real custom arrows and the service bench, for the services page cards.
  ['galleries/arrows/arrows-06.jpg',         'shop/custom-arrows.jpg',  { treatment: 'neutral', width: 1280, height: 1280 }],
  ['galleries/arrows/arrows-02.jpg',         'shop/custom-arrows-2.jpg',{ treatment: 'neutral', width: 1280, height: 1280 }],
  ['uploads/2020/11/store-pic015.jpg',       'shop/arrow-rack.jpg',     { treatment: 'neutral', width: 1044, height: 1004 }],
  ['uploads/2020/11/store-pic016.jpg',       'shop/workbench.jpg',      { treatment: 'neutral', width: 1270, height: 1224 }],
  ['galleries/bows/066_66.JPG',              'shop/bow-rack-tall.jpg',  { treatment: 'neutral', width: 900, height: 1200 }],
  ['uploads/2020/11/notched-arrow.jpg',      'shop/notched-arrow.jpg',  { treatment: 'neutral', width: 1080, height: 550 }],
  ['uploads/2020/11/target-arrow01.jpg',     'shop/arrow-in-target.jpg',{ treatment: 'neutral', width: 1080, height: 550 }],
  ['uploads/2021/03/services.jpg',           'shop/services-wide.jpg',  { treatment: 'neutral', width: 1920, height: 800 }],

  // --- the range ---
  ['uploads/2021/03/slider-range.jpg',        'range/range-wide.jpg',   { treatment: 'neutral', width: 1920, height: 800 }],
  ['uploads/2020/11/range-slider-2.jpg',      'range/range-wide-2.jpg', { treatment: 'neutral', width: 1920, height: 800 }],
  ['galleries/range/range-pic010-crop.jpg',   'range/lanes-wide.jpg',   { treatment: 'neutral', width: 1800, height: 750 }],
  ['galleries/range/range-pic015.jpg',        'range/lanes-01.jpg',     { treatment: 'neutral', width: 1000, height: 1000 }],
  ['galleries/range/range-pic08.jpg',         'range/lanes-02.jpg',     { treatment: 'neutral', width: 1080, height: 1080 }],
  ['galleries/range/range-pic013.jpg',        'range/lanes-03.jpg',     { treatment: 'neutral', width: 960, height: 720 }],
  ['galleries/range/range-pic02.jpg',         'range/lanes-04.jpg',     { treatment: 'neutral', width: 960, height: 540 }],
  ['galleries/range/20150206_155407.jpg',     'range/lanes-05.jpg',     { treatment: 'neutral', width: 1778, height: 1000 }],
  ['galleries/range/range-pic07.jpg',         'range/lanes-06.jpg',     { treatment: 'neutral', width: 900, height: 900 }],
  ['galleries/range/range-pic016.jpg',        'range/lanes-tall.jpg',   { treatment: 'neutral', width: 800, height: 1200 }],
  ['uploads/2020/11/slider-woman0502.jpg',    'range/on-the-line.jpg',  { treatment: 'neutral', width: 1920, height: 800 }],
  ['uploads/2021/04/manshoot1.jpg',           'range/full-draw.jpg',    { treatment: 'neutral', width: 1024, height: 683 }],

  // --- lessons ---
  ['uploads/2020/11/aboutus1.jpg',          'lessons/coaching-kid.jpg', { treatment: 'neutral', width: 630, height: 603 }],
  ['uploads/2020/11/slider-01.jpg',         'lessons/lesson-wide.jpg', { treatment: 'neutral', width: 1920, height: 800 }],

  // --- kids camp ---
  ['galleries/summer-camp/summercamp-09.jpg',  'kids/camp-wide.jpg',  { treatment: 'neutral', width: 1796, height: 1100 }],
  ['galleries/summer-camp/summercamp-011.jpg', 'kids/camp-wide-2.jpg',{ treatment: 'neutral', width: 1750, height: 1100 }],
  ['galleries/summer-camp/summercamp-08.jpg',  'kids/camp-01.jpg',    { treatment: 'neutral', width: 1600, height: 900 }],
  ['galleries/summer-camp/summercamp-010.jpg', 'kids/camp-02.jpg',    { treatment: 'neutral', width: 1600, height: 900 }],
  ['galleries/summer-camp/summercamp-012.jpg', 'kids/camp-03.jpg',    { treatment: 'neutral', width: 1600, height: 920 }],
  ['galleries/summer-camp/summercamp-05.jpg',  'kids/camp-04.jpg',    { treatment: 'neutral', width: 1000, height: 1000 }],
  ['galleries/summer-camp/summercamp-020.jpg', 'kids/camp-05.jpg',    { treatment: 'neutral', width: 900, height: 900 }],
  ['galleries/summer-camp/summercamp-016.jpg', 'kids/camp-tall.jpg',  { treatment: 'neutral', width: 720, height: 1080 }],

  // --- leagues ---
  ['uploads/2020/11/Youth-League.jpg',            'leagues/youth-league.jpg', { treatment: 'neutral', width: 900, height: 900 }],
  ['galleries/youth-league/yl-09.jpg',            'leagues/youth-01.jpg',  { treatment: 'neutral', width: 1000, height: 1000 }],
  ['galleries/youth-league/yl-05.jpg',            'leagues/youth-02.jpg',  { treatment: 'neutral', width: 900, height: 900 }],
  ['galleries/youth-league/yl-04.jpg',            'leagues/youth-tall.jpg',{ treatment: 'neutral', width: 700, height: 1000 }],
  ['galleries/adult-league/al-011.jpg',           'leagues/adult-wide.jpg',{ treatment: 'neutral', width: 1440, height: 810 }],
  ['galleries/adult-league/20150120_200128.jpg',  'leagues/adult-01.jpg',  { treatment: 'neutral', width: 1440, height: 810 }],
  ['galleries/adult-league/al-03.jpg',            'leagues/adult-02.jpg',  { treatment: 'neutral', width: 1440, height: 810 }],
  ['galleries/adult-league/al-07.jpg',            'leagues/adult-tall.jpg',{ treatment: 'neutral', width: 720, height: 1080 }],
  ['uploads/2020/11/league1-1.jpg',               'leagues/league-01.jpg', { treatment: 'neutral', width: 1200, height: 1144 }],
  ['uploads/2020/11/league3-1.jpg',               'leagues/league-02.jpg', { treatment: 'neutral', width: 1200, height: 1144 }],

  // --- groups, parties, speaker nights ---
  ['galleries/seminar/seminar-01.jpg', 'groups/seminar-01.jpg', { treatment: 'neutral', width: 1352, height: 900 }],
  ['galleries/seminar/seminar-03.jpg', 'groups/seminar-02.jpg', { treatment: 'neutral', width: 1352, height: 900 }],
  ['galleries/seminar/seminar-05.jpg', 'groups/seminar-03.jpg', { treatment: 'neutral', width: 1352, height: 900 }],
  ['galleries/seminar/seminar-07.jpg', 'groups/seminar-04.jpg', { treatment: 'neutral', width: 1352, height: 900 }],
  ['galleries/pigman/pigman-01.jpg',   'groups/speaker-night-01.jpg', { treatment: 'neutral', width: 1200, height: 900 }],
  ['galleries/pigman/pigman-03.jpg',   'groups/speaker-night-02.jpg', { treatment: 'neutral', width: 1200, height: 900 }],
  ['galleries/pigman/pigman-05.jpg',   'groups/speaker-night-03.jpg', { treatment: 'neutral', width: 1200, height: 900 }],
  ['galleries/pig-man/IMG_6360_0042.jpg', 'groups/speaker-night-wide.jpg', { treatment: 'neutral', width: 1600, height: 900 }],

  // --- hunting ---
  ['uploads/2021/03/Rob-in-British-Columbia-.jpeg', 'hunting/british-columbia.jpg', { width: 1646, height: 800 }],
  ['uploads/2021/03/YUKON.jpg',                     'hunting/yukon.jpg',            { width: 1920, height: 800 }],
  ['uploads/2020/11/bigwoods.jpg',                  'hunting/big-woods.jpg',        { width: 1920, height: 1275 }],
  ['uploads/2020/11/hunter-sunset.jpg',             'hunting/hunter-sunset.jpg',    { width: 1600, height: 1100 }],
  ['uploads/2020/11/slider-deer02.jpg',             'hunting/deer-wide.jpg',        { width: 1920, height: 800 }],
  ['uploads/2020/11/slider-turkey.jpg',             'hunting/turkey-wide.jpg',      { width: 1920, height: 800 }],
  ['uploads/2021/04/British-Columbia-.jpeg',        'hunting/bc-camp.jpg',          { width: 1008, height: 756 }],
  ['uploads/2021/03/Rob-hunting-in-British-Columbia-.jpg', 'hunting/rob-bc.jpg',    { width: 1067, height: 800 }],
  ['uploads/2020/11/forest-bg.jpg',                 'hunting/forest-wide.jpg',      { width: 1920, height: 800 }],
  ['uploads/2020/11/forest-bg03.jpg',               'hunting/forest-wide-2.jpg',    { width: 1920, height: 800 }],

  // --- trophy room ---
  ['galleries/store-7/store-pic-sasquatch017.jpg',  'trophy/sasquatch.jpg',  { treatment: 'neutral', width: 912, height: 1620 }],
  ['galleries/huntingtrip/79638.jpeg',              'trophy/mount-01.jpg',   { width: 900, height: 1200 }],
  ['galleries/huntingtrip/add-to-hunbting-tab-Canada-.jpeg', 'trophy/mount-02.jpg', { width: 900, height: 1200 }],
  ['galleries/huntingtrip/add-to-hunting-tab-.jpg', 'trophy/mount-03.jpg',   { width: 776, height: 1600 }],
  ['galleries/huntingtrip/add-to-hunting-tab-.jpeg','trophy/mount-04.jpg',   { width: 1646, height: 800 }],
  ['galleries/celebrities/celebs-04.jpg',           'trophy/visitors-01.jpg',{ treatment: 'neutral', width: 1600, height: 900 }],
  ['galleries/celebrities/celebs-06.jpg',           'trophy/visitors-02.jpg',{ treatment: 'neutral', width: 1600, height: 900 }],
  ['galleries/celebrities/celebs-07.jpg',           'trophy/visitors-03.jpg',{ treatment: 'neutral', width: 1244, height: 1100 }],
  ['galleries/celebrities/celebs-015.jpg',          'trophy/visitors-04.jpg',{ treatment: 'neutral', width: 1080, height: 720 }],
  ['galleries/celebrities/celebs-01.jpg',           'trophy/visitors-05.jpg',{ treatment: 'neutral', width: 1398, height: 1100 }],
];

console.log('Preparing Targeteers images…');
if (!existsSync(MEDIA)) {
  console.error(`\n  Source media not found at ${MEDIA}\n  This script only runs inside the LWS working folder.\n`);
  process.exit(0);
}
await brand();
for (const [src, dest, opts] of JOBS) await prepImage(src, dest, opts);
console.log(`Done. ${made} written, ${skipped} skipped.`);
