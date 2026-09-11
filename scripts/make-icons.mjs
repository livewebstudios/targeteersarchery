/**
 * Favicons and app icons, generated from the client's target mark at
 * public/images/cropped-target.png.
 *
 *   node scripts/make-icons.mjs
 *
 * The source is a 512px target face on transparency. Standard icons keep that
 * transparency; the maskable icon gets a cream plate and a 20% safe-zone inset
 * so Android's circle crop never clips the outer ring.
 */
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const PUB = path.resolve(process.cwd(), 'public');
const SRC = path.join(PUB, 'images', 'cropped-target.png');
const src = await readFile(SRC);

const at = (size) =>
  sharp(src).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 });

await at(180).toFile(path.join(PUB, 'apple-touch-icon.png'));
await at(192).toFile(path.join(PUB, 'icon-192.png'));
await at(512).toFile(path.join(PUB, 'icon-512.png'));
await at(32).toFile(path.join(PUB, 'favicon-32.png'));

/* A small copy for the page itself: the mark that sits at the head of every
   eyebrow. 64px covers a 1em mark at 3x without shipping the 70KB original. */
await at(64).toFile(path.join(PUB, 'images', 'target-mark.png'));

/* Maskable: the mark inset inside its own safe zone, on the cream ground. */
const MASK = 512;
const inner = await sharp(src).resize(Math.round(MASK * 0.6), Math.round(MASK * 0.6)).toBuffer();
await sharp({
  create: { width: MASK, height: MASK, channels: 4, background: '#F8F5EE' },
})
  .composite([{ input: inner, gravity: 'centre' }])
  .png({ compressionLevel: 9 })
  .toFile(path.join(PUB, 'icon-maskable-512.png'));

/* A 32x32 PNG carried in an .ico container, for old browsers that ask for
   /favicon.ico by convention. Flattened onto cream, since .ico alpha is
   unreliable in the browsers that still want one. */
const png = await sharp(src).resize(32, 32).flatten({ background: '#F8F5EE' }).png().toBuffer();
const ico = Buffer.alloc(22 + png.length);
ico.writeUInt16LE(0, 0); ico.writeUInt16LE(1, 2); ico.writeUInt16LE(1, 4);
ico.writeUInt8(32, 6); ico.writeUInt8(32, 7); ico.writeUInt8(0, 8); ico.writeUInt8(0, 9);
ico.writeUInt16LE(1, 10); ico.writeUInt16LE(32, 12);
ico.writeUInt32LE(png.length, 14); ico.writeUInt32LE(22, 18);
png.copy(ico, 22);
await writeFile(path.join(PUB, 'favicon.ico'), ico);

await writeFile(
  path.join(PUB, 'site.webmanifest'),
  JSON.stringify(
    {
      name: 'Targeteers Archery Pro Shop',
      short_name: 'Targeteers',
      description:
        'Family-owned archery pro shop and indoor range in Saddle Brook, New Jersey. Since 1957.',
      start_url: '/',
      display: 'standalone',
      background_color: '#F8F5EE',
      theme_color: '#14261B',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    null,
    2,
  ) + '\n',
);
console.log('icons written from', path.relative(process.cwd(), SRC));
