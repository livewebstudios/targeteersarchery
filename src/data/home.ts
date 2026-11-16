/**
 * One content source for the three home page demos under /demos/.
 *
 * All three read the same six tasks, so the copy is identical and only the
 * design differs. Facts come from the existing pages and FAQ entries. The
 * [CONFIRM] flags are carried over from the existing build, not new.
 *
 * Hours, phone, address, directions, brands, Formspree and GA4 still come
 * from business.ts. Nothing here duplicates them.
 */
import type { ImageMetadata } from 'astro';
import { business } from './business';

import rangeImg from '~/assets/range/lanes-05.jpg';
import benchImg from '~/assets/story/rob-at-the-bench.jpg';
import lessonImg from '~/assets/range/full-draw.jpg';
import wallImg from '~/assets/shop/wall-of-bows.jpg';
import campImg from '~/assets/kids/camp-wide.jpg';
import huntImg from '~/assets/hunting/rob-bc.jpg';

export type Fact = { label: string; value: string };
export type Action = { label: string; href: string };

export type TaskId = 'shoot' | 'service' | 'lessons' | 'gear' | 'kids' | 'hunt';

export interface Task {
  id: TaskId;
  /** ALL CAPS, short. */
  tab: string;
  /** One-line fact for the feature strip. */
  strip: string;
  title: string;
  body: string;
  facts: Fact[];
  primary: Action;
  secondary?: Action;
  /** Path under src/assets. Resolved to an optimisable import by `imageFor`. */
  image: string;
  imageAlt: string;
}

export const tasks: Task[] = [
  {
    id: 'shoot',
    tab: 'SHOOT TODAY',
    strip: '11 lanes. Walk in, call ahead.',
    title: 'Eleven lanes. Walk in.',
    body: 'Indoor, air conditioned, open to the public. Lessons and leagues take lanes, so call first and save the drive.',
    facts: [
      { label: 'Lanes', value: '11, indoor' },
      { label: 'Distance', value: 'Out to 27 yards' }, // [CONFIRM] 27 vs 28
      { label: 'Age', value: '7 and up' },
      { label: 'Bring', value: 'Your bow, closed-toe shoes' },
      { label: 'Loaner gear', value: 'With a lesson only' },
      { label: 'Range cards', value: 'Ask at the front desk' },
    ],
    primary: { label: 'CALL AHEAD', href: business.phoneHref },
    secondary: { label: 'RANGE RULES', href: '/range/#rules' },
    image: 'range/lanes-05.jpg',
    imageAlt: 'Archers on the line at the indoor range',
  },
  {
    id: 'service',
    tab: 'BOW SERVICE',
    strip: 'Drop it off. No appointment.',
    title: 'Drop it off. No appointment.',
    body: 'Tuning, custom strings, custom arrows, repairs and crossbows. Every bow gets shot on our range and looked over twice before it leaves.',
    facts: [
      { label: 'Appointment', value: 'Not needed' },
      { label: 'Tune-up', value: 'Same or next day, most weeks' },
      { label: 'Before bow season', value: 'Plan on longer. Come early.' },
      { label: 'Strings and arrows', value: 'Built here, to your bow' },
      { label: 'Crossbows', value: 'Yes. Strings, cables, scopes' },
    ],
    primary: { label: 'CALL THE SHOP', href: business.phoneHref },
    secondary: { label: 'HOW WE TUNE A BOW', href: '/services/bow-tuning/' },
    image: 'story/rob-at-the-bench.jpg',
    imageAlt: 'Working on a bow at the service bench',
  },
  {
    id: 'lessons',
    tab: 'LESSONS',
    strip: 'From $35. Gear included.',
    title: 'Never held a bow? Good.',
    body: 'One on one, certified instruction. Half an hour is enough to find out if you like it.',
    facts: [
      // [CONFIRM] 2026 pricing
      { label: 'Half hour, our gear', value: '$35' },
      { label: 'Full hour, our gear', value: '$55' },
      { label: 'Half hour, your gear', value: '$25' },
      { label: 'Full hour, your gear', value: '$45' },
      { label: 'Age', value: '7 and up' },
      { label: 'Booking', value: 'In advance, deposit required' },
    ],
    primary: { label: 'BOOK A LESSON', href: '/lessons/#book' },
    image: 'range/full-draw.jpg',
    imageAlt: 'An archer at full draw',
  },
  {
    id: 'gear',
    tab: 'PRO SHOP',
    strip: 'Hundreds of bows. Zero pressure.',
    title: 'Hundreds of bows on the wall.',
    body: 'Nobody here works on commission. Tell us what you want to do with it and we will put two or three in your hands.',
    facts: [
      { label: 'Bows', value: 'Mathews, Hoyt, Bowtech' },
      { label: 'Crossbows', value: 'TenPoint, Ravin' },
      { label: 'Arrows and gear', value: 'Easton, Carbon Express, SITKA' },
      { label: 'Online sales', value: 'None. A bow is a fit.' },
      { label: 'With a bow purchase', value: 'Discount range card, one year' },
    ],
    primary: { label: 'SEE THE PRO SHOP', href: '/pro-shop/' },
    image: 'shop/wall-of-bows.jpg',
    imageAlt: 'The wall of bows in the pro shop',
  },
  {
    id: 'kids',
    tab: 'KIDS & GROUPS',
    strip: 'Camp, parties, scouts. Age 7 up.',
    title: '130 kids a summer.',
    body: 'Camp, youth league, birthday parties and scout nights. Equipment and certified instruction included.',
    facts: [
      { label: 'Age', value: '7 and up' },
      { label: 'Summer camp', value: 'Small groups. Fills early.' },
      { label: 'Youth league', value: 'Fridays, 5 or 6 pm line, 8 weeks' },
      { label: 'Birthday parties', value: 'Gear, range, coach, targets' },
      { label: 'Troops and teams', value: 'Tell us the date and headcount' },
    ],
    primary: { label: 'RESERVE A SPOT', href: '/kids/#reserve' },
    secondary: { label: 'PLAN A GROUP', href: '/groups/#enquire' },
    image: 'kids/camp-wide.jpg',
    imageAlt: 'Kids on the line at summer camp',
  },
  {
    id: 'hunt',
    tab: 'HUNTING SEASON',
    strip: 'Tuned and ready before opening day.',
    title: 'Ready before opening day.',
    body: 'Get the bow in early. The four weeks before season are the busiest stretch of our year.',
    facts: [
      { label: 'Pre-season tune', value: 'Full tune, shot on the range' },
      { label: 'Broadheads', value: 'Tuned, not guessed' },
      { label: 'Layering', value: 'SITKA Gear, fitted' },
      { label: 'Planning a trip', value: 'Come talk it through' },
      { label: 'Trophy room', value: '200+ mounts. Free to walk through.' },
    ],
    primary: { label: 'CALL THE SHOP', href: business.phoneHref },
    secondary: { label: 'HUNTING SETUPS', href: '/hunting/' },
    image: 'hunting/rob-bc.jpg',
    imageAlt: 'Rob glassing a valley on a hunt in British Columbia',
  },
];

const IMAGES: Record<string, ImageMetadata> = {
  'range/lanes-05.jpg': rangeImg,
  'story/rob-at-the-bench.jpg': benchImg,
  'range/full-draw.jpg': lessonImg,
  'shop/wall-of-bows.jpg': wallImg,
  'kids/camp-wide.jpg': campImg,
  'hunting/rob-bc.jpg': huntImg,
};

/** The task photo as an astro:assets import, so it is resized and re-encoded. */
export function imageFor(task: Task): ImageMetadata {
  const img = IMAGES[task.image];
  if (!img) throw new Error(`home.ts: no import registered for ${task.image}`);
  return img;
}

export function task(id: TaskId): Task {
  const t = tasks.find((x) => x.id === id);
  if (!t) throw new Error(`home.ts: unknown task ${id}`);
  return t;
}

/** The five destinations the simplified nav uses. Labels ALL CAPS. */
export const demoNav: Action[] = [
  { label: 'PRO SHOP', href: '/pro-shop/' },
  { label: 'BOW SERVICE', href: '/services/' },
  { label: 'RANGE & LEAGUES', href: '/range/' },
  { label: 'LESSONS & KIDS', href: '/lessons/' },
  { label: 'ABOUT', href: '/about/' },
];

/** The three demos, for the switcher bar and the /demos/ index. */
export const demos = [
  { id: 1, slug: '1-base-camp', name: 'BASE CAMP', href: '/demos/1-base-camp/', line: 'Dark navy glass over one long hike, daybreak to dusk. A classic long scroll, done properly.' },
  { id: 2, slug: '2-trailhead', name: 'TRAILHEAD', href: '/demos/2-trailhead/', line: 'Bright and app-like. Pick what you came for and the facts appear in place.' },
  { id: 3, slug: '3-long-shot', name: 'LONG SHOT', href: '/demos/3-long-shot/', line: 'One arrow is loosed at the top and lands in the target at the bottom.' },
] as const;
