/** Favicons and app icons, generated from the TargetIcon mark. */
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const PUB = path.resolve(process.cwd(), 'public');
const svg = await readFile(path.join(PUB, 'favicon.svg'));

const rounded = (size) =>
  sharp(Buffer.from(svg.toString()), { density: 400 }).resize(size, size).png({ compressionLevel: 9 });

await rounded(180).toFile(path.join(PUB, 'apple-touch-icon.png'));
await rounded(192).toFile(path.join(PUB, 'icon-192.png'));
await rounded(512).toFile(path.join(PUB, 'icon-512.png'));

/* A 32x32 PNG carried in an .ico container, for old browsers that ask for
   /favicon.ico by convention. */
const png = await rounded(32).toBuffer();
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
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    null,
    2,
  ) + '\n',
);
console.log('icons written');
