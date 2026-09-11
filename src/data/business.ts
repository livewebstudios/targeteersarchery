/**
 * Single source of truth for name/address/phone, hours, socials and the
 * third-party IDs. Footer, JSON-LD, the "open now" pill and every form read
 * from here — change it once, it changes everywhere.
 */

export type Hour = {
  /** ISO day, Monday = 1. */
  day: number;
  label: string;
  /** Schema.org day name. */
  schema: string;
  open?: string;
  close?: string;
  closed?: boolean;
};

export const business = {
  name: 'Targeteers Archery Pro Shop',
  shortName: 'Targeteers Archery',
  tagline: 'Archery For Life',
  founded: '1957',
  legalNote: 'Longest family owned bow shop in NJ',

  phone: '(201) 843-7788',
  phoneHref: 'tel:+12018437788',
  /* [CONFIRM] This was the "send resumes here" address on the old site.
     Rob/Lisa may prefer info@targeteersarchery.com before launch. */
  email: 'targeteersarchery@gmail.com',

  address: {
    street: '101 Route 46 West',
    city: 'Saddle Brook',
    region: 'NJ',
    regionName: 'New Jersey',
    postal: '07663',
    country: 'US',
  },
  /* Approximate rooftop coordinates for 101 Route 46 W, Saddle Brook NJ.
     [CONFIRM] against the Google Business Profile pin before launch. */
  geo: { lat: 40.9008, lng: -74.0952 },

  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Targeteers+Archery+Pro+Shop%2C+101+Route+46+West%2C+Saddle+Brook%2C+NJ+07663',
  directionsUrl:
    'https://www.google.com/maps/dir/?api=1&destination=101+Route+46+West%2C+Saddle+Brook%2C+NJ+07663',

  socials: {
    facebook: 'https://www.facebook.com/Targeteers-Archery-192563160775417/',
    instagram: 'https://www.instagram.com/targeteersarchery/',
    twitter: 'https://twitter.com/TargeteerArcher',
  },

  calendar: {
    id: 'targeteersarchery@gmail.com',
    embed:
      'https://calendar.google.com/calendar/embed?src=targeteersarchery%40gmail.com&ctz=America%2FNew_York&mode=MONTH&showTitle=0&showPrint=0&showTabs=1&showCalendars=0&bgcolor=%23F8F5EE',
    public:
      'https://calendar.google.com/calendar/u/0?cid=dGFyZ2V0ZWVyc2FyY2hlcnlAZ21haWwuY29t',
    ics: 'https://calendar.google.com/calendar/ical/targeteersarchery%40gmail.com/public/basic.ics',
  },

  /* Placeholders. Jon swaps these in before launch — one endpoint per form. */
  formspree: {
    contact: 'https://formspree.io/f/FORM_ID_CONTACT',
    lesson: 'https://formspree.io/f/FORM_ID_LESSON',
    league: 'https://formspree.io/f/FORM_ID_LEAGUE',
    kids: 'https://formspree.io/f/FORM_ID_KIDS',
    groups: 'https://formspree.io/f/FORM_ID_GROUPS',
    waiver: 'https://formspree.io/f/FORM_ID_WAIVER',
  },

  analytics: { ga4: 'G-XXXXXXXXXX' },
  /* [CONFIRM] Current Mailchimp embed action URL from Lisa. */
  mailchimpAction: 'MAILCHIMP_ACTION_URL',

  areaServed: [
    'Saddle Brook',
    'Bergen County',
    'Passaic County',
    'Essex County',
    'North Jersey',
  ],
} as const;

/* [CONFIRM] Thursday: the database said 7 pm, the 2025 live footer said 5 pm. */
export const hours: Hour[] = [
  { day: 1, label: 'Monday', schema: 'Monday', closed: true },
  { day: 2, label: 'Tuesday', schema: 'Tuesday', open: '12:00', close: '19:00' },
  { day: 3, label: 'Wednesday', schema: 'Wednesday', open: '12:00', close: '19:00' },
  { day: 4, label: 'Thursday', schema: 'Thursday', open: '12:00', close: '19:00' },
  { day: 5, label: 'Friday', schema: 'Friday', open: '12:00', close: '19:00' },
  { day: 6, label: 'Saturday', schema: 'Saturday', open: '11:00', close: '17:00' },
  { day: 7, label: 'Sunday', schema: 'Sunday', open: '11:00', close: '16:00' },
];

export function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const suffix = h >= 12 ? 'pm' : 'am';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m ? `${hour}:${String(m).padStart(2, '0')} ${suffix}` : `${hour} ${suffix}`;
}

export function hoursLabel(h: Hour): string {
  return h.closed ? 'Closed' : `${formatTime(h.open!)} – ${formatTime(h.close!)}`;
}

export const addressLine = `${business.address.street}, ${business.address.city}, ${business.address.region} ${business.address.postal}`;

/**
 * Authorized dealer brands.
 *
 * `slug` is also the logo filename the dealer carousel looks for. Drop an
 * official logo at `src/assets/brands/<slug>.{svg,png,webp}` and that tile
 * switches from the wordmark to the real mark on the next build — no code
 * change. Until then it renders as a cream wordmark, which is what the brief
 * calls for when logo files are not on hand. Do not hotlink logos from the
 * manufacturers' own sites.
 */
export const brands = [
  /* The shop's own mark leads the row: Targeteers is the authorized dealer the
     heading is talking about. An internal `url` is what marks a tile as ours,
     so it opens in this tab and keeps its own colours on the dark bands. */
  { name: 'Targeteers Archery', slug: 'targeteers', url: '/' },
  { name: 'Hoyt', slug: 'hoyt', url: 'https://hoyt.com' },
  { name: 'Mathews Archery', slug: 'mathews', url: 'https://mathewsinc.com' },
  { name: 'Bowtech', slug: 'bowtech', url: 'https://bowtecharchery.com' },
  { name: 'TenPoint', slug: 'tenpoint', url: 'https://tenpointcrossbows.com' },
  { name: 'Ravin', slug: 'ravin', url: 'https://ravincrossbows.com' },
  { name: 'SITKA Gear', slug: 'sitka', url: 'https://sitkagear.com' },
  { name: 'Easton', slug: 'easton', url: 'https://eastonarchery.com' },
  { name: 'Carbon Express', slug: 'carbon-express', url: 'https://feradyne.com/carbon-express-arrows/' },
] as const;
