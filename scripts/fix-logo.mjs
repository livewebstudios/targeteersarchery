/**
 * The supplied assets/logo/logo.png is a screenshot: the "transparent"
 * checkerboard is baked into the pixels as neutral greys (#FFFFFF / ~#C2C2C2).
 * This recovers a real alpha channel so the lockup can sit on cream, on pine,
 * and on photographs without a grey box around it.
 *
 * Note: no monochrome variant is produced. A full-colour lockup cannot be
 * flattened to one colour and stay legible, so dark sections place this same
 * file on a cream plate instead.
 *
 * Method: flag every neutral pixel that matches one of the two checker greys,
 * then flood-fill connected regions of those. A region is cleared when it
 * touches the image border, or when it contains at least one mid-grey pixel
 * (letter counters and the ring centre). Solid white type inside the logo only
 * ever matches the white grey, never the mid grey, so it survives intact.
 */
import sharp from 'sharp';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';

const SRC = path.resolve(process.cwd(), '..', 'assets', 'logo', 'logo.png');
const NEUTRAL = 5;

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;

const isGrey = (p) => {
  const i = p * C, r = data[i], g = data[i + 1], b = data[i + 2];
  if (Math.abs(r - g) > NEUTRAL || Math.abs(g - b) > NEUTRAL || Math.abs(r - b) > NEUTRAL) return 0;
  return r >= 186 && r <= 255 ? r : 0;
};

const grey = new Uint8Array(W * H);
for (let p = 0; p < W * H; p++) grey[p] = isGrey(p) ? 1 : 0;

const alpha = Buffer.alloc(W * H, 255);
const seen = new Uint8Array(W * H);
const stack = new Int32Array(W * H);
let cleared = 0;

function flood(p0) {
  let sp = 0, mid = 0, touchesEdge = false;
  const region = [];
  stack[sp++] = p0; seen[p0] = 1;
  while (sp) {
    const p = stack[--sp];
    region.push(p);
    if (isGrey(p) <= 210) mid++;
    const x = p % W, y = (p / W) | 0;
    if (x === 0 || y === 0 || x === W - 1 || y === H - 1) touchesEdge = true;
    if (x > 0     && grey[p - 1] && !seen[p - 1]) { seen[p - 1] = 1; stack[sp++] = p - 1; }
    if (x < W - 1 && grey[p + 1] && !seen[p + 1]) { seen[p + 1] = 1; stack[sp++] = p + 1; }
    if (y > 0     && grey[p - W] && !seen[p - W]) { seen[p - W] = 1; stack[sp++] = p - W; }
    if (y < H - 1 && grey[p + W] && !seen[p + W]) { seen[p + W] = 1; stack[sp++] = p + W; }
  }
  return { region, mid, touchesEdge };
}

for (let p0 = 0; p0 < W * H; p0++) {
  if (!grey[p0] || seen[p0]) continue;
  const { region, mid, touchesEdge } = flood(p0);
  // The outer checkerboard is one connected region reaching the border.
  // Enclosed regions (letter counters, the ring centre) only qualify when they
  // are big enough to span cells and are genuinely bimodal — roughly half mid
  // grey. Solid white type is ~100% light grey, so the lettering survives.
  if (touchesEdge || (region.length > 300 && mid / region.length > 0.15)) {
    for (const p of region) alpha[p] = 0;
    cleared += region.length;
  }
}
console.log(`knocked out ${((cleared / (W * H)) * 100).toFixed(1)}% of ${W}x${H}`);

/* Despeckle: drop tiny opaque islands left behind by compression noise in the
   screenshot, so the knockout does not sparkle on a dark background. */
seen.fill(0);
let specks = 0;
for (let p0 = 0; p0 < W * H; p0++) {
  if (!alpha[p0] || seen[p0]) continue;
  let sp = 0;
  const region = [];
  stack[sp++] = p0; seen[p0] = 1;
  while (sp && region.length <= 64) {
    const p = stack[--sp];
    region.push(p);
    const x = p % W, y = (p / W) | 0;
    if (x > 0     && alpha[p - 1] && !seen[p - 1]) { seen[p - 1] = 1; stack[sp++] = p - 1; }
    if (x < W - 1 && alpha[p + 1] && !seen[p + 1]) { seen[p + 1] = 1; stack[sp++] = p + 1; }
    if (y > 0     && alpha[p - W] && !seen[p - W]) { seen[p - W] = 1; stack[sp++] = p - W; }
    if (y < H - 1 && alpha[p + W] && !seen[p + W]) { seen[p + W] = 1; stack[sp++] = p + W; }
  }
  if (region.length <= 64 && sp === 0) { for (const p of region) alpha[p] = 0; specks++; }
}
console.log(`despeckled ${specks} islands`);

const eroded = alpha;

const rgba = Buffer.alloc(W * H * 4);
for (let p = 0; p < W * H; p++) {
  const i = p * C;
  rgba[p * 4] = data[i]; rgba[p * 4 + 1] = data[i + 1]; rgba[p * 4 + 2] = data[i + 2];
  rgba[p * 4 + 3] = eroded[p];
}

const OUT = path.resolve(process.cwd(), 'src', 'assets', 'brand');
const PUB = path.resolve(process.cwd(), 'public', 'images');
await mkdir(OUT, { recursive: true });
await mkdir(PUB, { recursive: true });

const trimmed = await sharp(rgba, { raw: { width: W, height: H, channels: 4 } })
  .png().trim({ threshold: 2 }).toBuffer();
const tm = await sharp(trimmed).metadata();
console.log(`trimmed to ${tm.width}x${tm.height}`);

for (const dest of [path.join(OUT, 'logoRGB.png'), path.join(PUB, 'logoRGB.png')]) {
  await sharp(trimmed).resize(880, null, { kernel: 'lanczos3' })
    .png({ compressionLevel: 9 }).toFile(dest);
}

console.log('wrote logoRGB.png (src/assets/brand + public/images)');
