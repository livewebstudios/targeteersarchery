/**
 * One content source for the three v2 home page demos under /v2/.
 *
 * Same words in every demo. Display case (ALL CAPS or sentence case) is set in
 * CSS with text-transform, never by retyping. Photos differ per demo where the
 * slot table says so. Words never do.
 *
 * Facts come from assets/extracted-content/26_09_10_targeteers_site_content.md.
 * Phone, address, hours, socials, directions, brands, Formspree and GA4 come
 * from business.ts. Nothing here duplicates them.
 */
import type { ImageMetadata } from 'astro';
import { business } from './business';

/* Rob's own photos, in their upgraded versions (see ../assets/v2-photos/README.md). */
import showroom02 from '~/assets/v2/showroom-02.jpg';
import wallOfBowsHero from '~/assets/v2/wall-of-bows-hero.jpg';
import counterThreeMen from '~/assets/v2/counter-three-men.jpg';
import bows03 from '~/assets/v2/bows-03.jpg';
import bows01 from '~/assets/v2/bows-01.jpg';
import rangeWide from '~/assets/v2/range-wide.jpg';
import robAtTheBench from '~/assets/v2/rob-at-the-bench.jpg';
import coachingKid from '~/assets/v2/coaching-kid.jpg';
import adultWide from '~/assets/v2/adult-wide.jpg';
import campWide from '~/assets/v2/camp-wide.jpg';
import yukon from '~/assets/v2/yukon.jpg';
import britishColumbia from '~/assets/v2/british-columbia.jpg';
import archiveOutdoorRange from '~/assets/v2/archive-outdoor-range.jpg';
import archiveGroupTarget from '~/assets/v2/archive-group-target.jpg';
import counterAtTheRegister from '~/assets/v2/counter-at-the-register.jpg';
import robHoyt from '~/assets/v2/rob-hoyt.jpg';
/* Not upgraded. Both sit under a dark wash in Demo 1 only. */
import forestWide from '~/assets/hunting/forest-wide.jpg';
import bigWoods from '~/assets/hunting/big-woods.jpg';
import target from '~/assets/brand/target.png';
import badgeDealer2007 from '~/assets/awards/dealer-of-the-year-2007.jpg';
import badgeHoytTop50 from '~/assets/awards/hoyt-top-50.jpg';
import badgeFamilyOwned from '~/assets/awards/family-owned-badge.jpg';

export type Fact = { label: string; value: string };
export type Action = { label: string; href: string };

/** Rob's own six menu items, in his order. All scroll within the page. */
export const v2Nav: Action[] = [
  { label: 'HOME', href: '#top' },
  { label: 'LEAGUES', href: '#leagues' },
  { label: 'EVENTS CALENDAR', href: '#events' },
  { label: 'ABOUT', href: '#about' },
  { label: 'PRO SERVICES', href: '#services' },
  { label: 'CONTACT', href: '#visit' },
];

export const call: Action = { label: `CALL ${business.phone}`, href: business.phoneHref };
export const callShort: Action = { label: 'CALL THE SHOP', href: business.phoneHref };
export const directions: Action = { label: 'GET DIRECTIONS', href: business.directionsUrl };

export const hero = {
  eyebrow: 'Welcome to Targeteers Archery',
  h1: "North Jersey's Premier Archery Pro Shop",
  lead: 'Family owned and operated since 1957. Hundreds of bows in the showroom, an 11 lane indoor range, and a repair shop where every bow gets looked over twice.',
};

/** The awards Rob led with on the old home page. */
export const proof = [
  { big: '1957', label: 'Family owned and operated', note: 'Three generations' },
  { big: 'Top 50', label: 'Hoyt Dealer', note: 'Named multiple years' },
  { big: 'Top 100', label: 'Mathews Dealer', note: 'Named multiple years' },
  // [CONFIRM] The old About page says "East Coast Dealer of the Year". The badge says 2007.
  { big: '2007', label: 'Dealer of the Year', note: 'Archery Business Magazine' },
];

export const welcome = {
  body: 'We take great pride in our work and in our store. The showroom is clean, neat and stocked with hundreds of bows and a full selection of accessories. Since 1957 Targeteers has grown into one of the most respected archery pro shops in the Northeast.',
};

export const team = {
  title: 'Our Team',
  body: 'Every member of our team knows archery and hunting inside and out. They love the sport and they love helping people get better at it. Our technicians are held to the highest level of customer service. Always have been.',
};

export const mission = {
  title: 'Our Mission',
  body: 'The best technical service you can get, and the same respect for every customer who walks in.',
  /** Rob's sentence, word for word. Give it room. */
  pledge: 'No bow in this shop will ever leave without being looked over twice, properly tuned, and at top shooting condition.',
};

export const dealers = {
  title: 'Authorized Dealer',
  line: 'Hoyt, Mathews, Bowtech, TenPoint, Ravin, SITKA Gear, Easton and Carbon Express. Come put one in your hands.',
};

export type OfferingId = 'showroom' | 'range' | 'services' | 'lessons' | 'leagues' | 'kids';

export interface Offering {
  id: OfferingId; // also the section anchor
  title: string;
  line: string;
  facts: Fact[];
  imageAlt: string;
}

export const offerings: Offering[] = [
  {
    id: 'showroom',
    title: 'The Showroom',
    line: 'Hundreds of bows on the wall. Tell us what you want to do and we will put two or three in your hands.',
    facts: [
      { label: 'Bows', value: 'Mathews, Hoyt, Bowtech' },
      { label: 'Crossbows', value: 'TenPoint, Ravin' },
      { label: 'Arrows and gear', value: 'Easton, Carbon Express, SITKA' },
      { label: 'Online sales', value: 'None. A bow gets fitted in person.' },
      { label: 'With a bow purchase', value: 'Discount range card, one year' },
    ],
    imageAlt: 'Compound bows hanging on the showroom wall',
  },
  {
    id: 'range',
    title: 'Indoor Range',
    line: 'Eleven lanes, indoor and air conditioned. Call ahead and save the drive.',
    facts: [
      { label: 'Lanes', value: '11, indoor' },
      { label: 'Distance', value: 'Out to 27 yards' }, // [CONFIRM] 27 vs 28
      { label: 'Age', value: '7 and up' },
      { label: 'Bring', value: 'Your bow, closed-toe shoes' },
      { label: 'Our equipment', value: 'With a lesson only' },
      { label: 'Parking', value: 'Plenty' },
    ],
    imageAlt: 'The indoor range, lanes and targets',
  },
  {
    id: 'services',
    title: 'Pro Services',
    line: 'Tuning, repairs, custom strings and custom arrows. Crossbows too.',
    facts: [
      { label: 'Tuning and adjustments', value: 'Fit to you and how you shoot' },
      { label: 'Custom strings', value: 'Our specialty' },
      { label: 'Custom arrows', value: 'Built here' },
      { label: 'Repairs', value: 'Any repair. Full setups too.' },
      { label: 'Every bow', value: 'Looked over twice before it leaves' },
    ],
    imageAlt: 'Rob working on a bow at the service bench',
  },
  {
    id: 'lessons',
    title: 'Lessons',
    line: 'Never held a bow? No problem. We have the equipment.',
    facts: [
      // [CONFIRM] 2026 pricing
      { label: 'Half hour, our equipment', value: '$35' },
      { label: 'One hour, our equipment', value: '$55' },
      { label: 'Half hour, your equipment', value: '$25' },
      { label: 'One hour, your equipment', value: '$45' },
      { label: 'Includes', value: 'Range time, instruction, target' },
      { label: 'Booking', value: 'In advance, deposit required' },
    ],
    imageAlt: 'Rob coaching a young archer on the range',
  },
  {
    id: 'leagues',
    title: 'Leagues',
    line: 'Adult and youth leagues on our own range.',
    facts: [
      // [CONFIRM] current league schedule
      { label: 'Youth league', value: 'Friday Night Lights' },
      { label: 'Lines', value: '5 pm or 6 pm' },
      { label: 'Length', value: '8 weeks' },
      { label: 'Age', value: '7 and up' },
      { label: 'Adult leagues', value: 'Call for the current season' },
    ],
    imageAlt: 'Adult league archers on the shooting line',
  },
  {
    id: 'kids',
    title: 'Kids and Groups',
    line: 'Summer camp, birthday parties, scout troops and team outings.',
    facts: [
      { label: 'Summer camp', value: '130 kids a summer. Fills early.' },
      { label: 'Groups include', value: 'Equipment, range time, instruction, targets' },
      { label: 'Booking', value: 'By phone, deposit required' },
      { label: 'Gift certificates', value: 'Ask at the desk' },
    ],
    imageAlt: 'Summer camp kids at the range',
  },
];

/** Rob's old slider line, his words. */
export const hunt = {
  title: 'Planning a Hunting Trip?',
  body: 'Over 65 years of hunting experience from around the globe, specializing in North American big game. Come see us for equipment tune-ups and the gear you need to get the results you want.',
};

export const about = {
  eyebrow: 'About Us',
  title: 'Three generations on Route 46.',
  body: [
    'Targeteers has been a family owned, three generation business since 1957. Rob bought the shop from his father in the 1990s and has spent more than 50 years in the archery business.',
    'Rob is a USA Archery Level 3 NTS certified instructor. He has helped thousands of people follow their archery dreams, on the range and in the woods.',
  ],
  /** Three stops. Demo 3 turns these into its signature move. */
  timeline: [
    { year: '1957', line: 'The shop opens. Family owned from day one.' },
    { year: '1990s', line: 'Rob buys the business from his father.' },
    { year: 'Today', line: 'Third generation. The same values, the same standards.' },
  ],
  /** Rob's own heading for the old photo wall. */
  archiveTitle: 'Back in the Days',
};

export const events = {
  title: 'Special Events',
  items: [
    { name: '3D Specialty Shoots', when: 'Dates to be announced' },
    { name: 'Hunting Clinics', when: 'Dates to be announced' },
  ],
  note: 'Lanes share time with lessons, leagues and events. Call ahead for the current schedule.',
};

export const visit = {
  title: 'Hours and Location',
  formTitle: 'Ask the Shop',
  formLine: 'Leave a number and a question. We call back during shop hours.',
  formButton: 'SEND MESSAGE',
};

export const footer = {
  tagline: 'Archery for Life',
  family: 'Family owned and operated since 1957',
  credit: 'Built by Live Web Studios',
};

/** The three demos, for the chooser. */
export const v2Demos = [
  { id: 1, name: 'ROUTE 46', href: '/v2/1-route-46/' },
  { id: 2, name: 'BLACKOUT', href: '/v2/2-blackout/' },
  { id: 3, name: 'SINCE 1957', href: '/v2/3-since-1957/' },
] as const;

/* ------------------------------------------------------------------ photos */

/**
 * A photo, its alt text and the widest it may ever be displayed, in CSS px.
 * The cap comes from the handoff's display table: the cleaned up files hold no
 * new detail, so they stay small. `cap: 0` means the file can run full width.
 */
export interface Photo {
  src: ImageMetadata;
  alt: string;
  cap: number;
}

/**
 * srcset widths for a photo shown at the given CSS widths: each width at 1x
 * and 2x, never past the source file.
 */
export function v2Widths(src: ImageMetadata, ...display: number[]): number[] {
  const wanted = display.flatMap((w) => [w, w * 2]).map((w) => Math.min(Math.round(w), src.width));
  return [...new Set(wanted)].sort((a, b) => a - b);
}

export const photos = {
  /** Demo 1 hero. The hero from his old site. */
  hero1: {
    src: showroom02,
    alt: 'The Targeteers showroom: racks of camouflage clothing, display cases and an Easton sign under track lighting',
    cap: 0,
  },
  /** Demo 2 hero, 16:9. */
  hero2: {
    src: wallOfBowsHero,
    alt: 'A long row of compound bows hanging on the showroom wall',
    cap: 0,
  },
  /** Demo 3 hero pair, and About in all three. */
  then: {
    src: counterThreeMen,
    alt: 'Three men behind the shop counter in an old sepia photograph',
    cap: 560,
  },
  now: {
    src: bows03,
    alt: 'Compound bows on a rack in the showroom today, a deer mount on the wall beside them',
    cap: 1200,
  },
  /** One per offering. The alt text is the offering's own imageAlt. */
  offering: {
    showroom: { src: bows01, cap: 1200 },
    range: { src: rangeWide, cap: 0 },
    services: { src: robAtTheBench, cap: 480 },
    lessons: { src: coachingKid, cap: 420 },
    leagues: { src: adultWide, cap: 760 },
    kids: { src: campWide, cap: 900 },
  } satisfies Record<OfferingId, { src: ImageMetadata; cap: number }>,
  /** Demo 1 hunt band. Decorative, under a dark wash. */
  hunt1: { src: forestWide, alt: '', cap: 0 },
  /** Demo 2 hunt band. */
  hunt2: {
    src: yukon,
    alt: 'A hunter in camouflage glassing a wide valley at sunset in the Yukon',
    cap: 0,
  },
  /** Demo 3 hunt band. */
  hunt3: {
    src: britishColumbia,
    alt: 'A hunter on horseback in the snow below a mountain in British Columbia',
    cap: 0,
  },
  /** Demo 1 offerings band backdrop. Decorative, under a dark wash. */
  forest: { src: bigWoods, alt: '', cap: 0 },
  /** "Back in the Days" strip. */
  archive: [
    {
      src: archiveOutdoorRange,
      alt: 'An archer at full draw outdoors in an old black and white photograph',
      cap: 340,
    },
    {
      src: archiveGroupTarget,
      alt: 'A group gathered around a target in an old photograph, one man pointing at the center',
      cap: 340,
    },
    {
      src: counterAtTheRegister,
      alt: 'A woman at the register behind the shop counter in an old photograph',
      cap: 400,
    },
  ] as Photo[],
  /** Demo 3 About. */
  dealerProof: {
    src: robHoyt,
    alt: 'Rob holding a Hoyt Archery Premier Dealer sign in front of the Targeteers logo',
    cap: 520,
  },
  /** Demo 1 cards and footer. Decorative. */
  target: { src: target, alt: '', cap: 256 },
  /** Demo 1 only, 104px wide. Not upgraded: 110px is the cap. */
  badges: [
    { src: badgeDealer2007, alt: 'Archery Business 2007 Dealer of the Year badge', cap: 110 },
    { src: badgeHoytTop50, alt: 'Top 50 Hoyt Dealer badge', cap: 110 },
    { src: badgeFamilyOwned, alt: 'Family owned and operated since 1957 badge', cap: 110 },
  ] as Photo[],
} as const;
