/**
 * The landscape behind each part of the site. One scene per destination, so
 * the five sections each have their own country. The files are the graded
 * renders in src/assets/demo-scenes/; replacing one with a new render of the
 * same name needs no code change.
 */
import type { ImageMetadata } from 'astro';
import canopy from '~/assets/demo-scenes/canopy.jpg';
import dusk from '~/assets/demo-scenes/dusk.jpg';
import hardwoods from '~/assets/demo-scenes/hardwoods.jpg';
import meadow from '~/assets/demo-scenes/meadow.jpg';
import ridge from '~/assets/demo-scenes/ridge.jpg';
import tarn from '~/assets/demo-scenes/tarn.jpg';
import timber from '~/assets/demo-scenes/timber.jpg';
import valley from '~/assets/demo-scenes/valley.jpg';

export const SCENES = { canopy, dusk, hardwoods, meadow, ridge, tarn, timber, valley } satisfies Record<string, ImageMetadata>;
export type Scene = keyof typeof SCENES;

/** Longest prefix wins. Anything unlisted gets the valley. */
const BY_PATH: [string, Scene][] = [
  ['/pro-shop/', 'timber'],
  ['/services/', 'hardwoods'],
  ['/hunting/', 'canopy'],
  ['/range/', 'ridge'],
  ['/leagues/', 'ridge'],
  ['/waiver/', 'ridge'],
  ['/calendar/', 'ridge'],
  ['/lessons/', 'meadow'],
  ['/kids/', 'meadow'],
  ['/groups/', 'meadow'],
  ['/about/', 'dusk'],
  ['/trophy-room/', 'dusk'],
  ['/careers/', 'dusk'],
  ['/insights/', 'tarn'],
  ['/faq/', 'tarn'],
  ['/contact/', 'valley'],
];

export function sceneFor(pathname: string): Scene {
  let best: [string, Scene] | undefined;
  for (const entry of BY_PATH) {
    if (pathname.startsWith(entry[0]) && (!best || entry[0].length > best[0].length)) best = entry;
  }
  return best?.[1] ?? 'valley';
}
