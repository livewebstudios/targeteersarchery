export interface NavLink {
  label: string;
  href: string;
  blurb?: string;
}

export interface NavColumn {
  heading: string;
  links: NavLink[];
}

export interface NavFeature {
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  cta: string;
}

export interface NavGroup {
  /** Slug used for panel ids and sub-nav lookups. */
  id: string;
  /** Renders ALL CAPS in every nav surface. */
  label: string;
  /** The group's own landing page. */
  href: string;
  blurb: string;
  columns: NavColumn[];
  feature?: NavFeature;
  /**
   * Path prefixes that put a page inside this group. The group's own href is
   * always implied; `extra` catches pages that live outside it in the URL tree
   * (Waiver under Range & Leagues, Trophy Room under About).
   */
  extra?: string[];
}

/**
 * The whole site, grouped. Six top-level items instead of a flat ten, so the
 * bar fits from roughly 64rem up rather than 86rem, and every panel shows six
 * or seven destinations at once instead of one label.
 */
export const navGroups: NavGroup[] = [
  {
    id: 'pro-shop',
    label: 'Pro Shop',
    href: '/pro-shop/',
    blurb: '100s of bows on the wall',
    columns: [
      {
        heading: 'On the floor',
        links: [
          { label: 'The Pro Shop', href: '/pro-shop/', blurb: '100s of bows, zero pressure' },
          { label: 'What We Carry', href: '/pro-shop/#carry', blurb: 'Compounds, crossbows, recurve, arrows' },
          { label: 'The Showroom', href: '/pro-shop/#showroom', blurb: 'What it actually looks like' },
          { label: 'Why a Pro Shop', href: '/pro-shop/#why', blurb: 'What the box does not come with' },
        ],
      },
      {
        heading: 'Brands',
        links: [
          { label: 'Mathews', href: '/pro-shop/mathews/', blurb: 'Top 100 Dealer, multiple years' },
          { label: 'Hoyt', href: '/pro-shop/hoyt/', blurb: 'Top 50 Dealer, multiple years' },
          { label: 'SITKA Gear', href: '/pro-shop/sitka/', blurb: 'Layering for northeast seasons' },
        ],
      },
    ],
    feature: {
      eyebrow: 'No cart, no checkout',
      title: 'A bow is a fit.',
      body: 'And a fit happens in person, with somebody watching you draw it.',
      href: '/insights/why-we-dont-sell-online/',
      cta: 'Why we don’t sell online',
    },
  },
  {
    id: 'services',
    label: 'Services',
    href: '/services/',
    blurb: 'Tuning, strings, arrows, repairs',
    columns: [
      {
        heading: 'The bench',
        links: [
          { label: 'All Services', href: '/services/', blurb: 'Everything that happens out back' },
          { label: 'Bow Tuning', href: '/services/bow-tuning/', blurb: 'The full five-step process' },
          { label: 'Custom Strings', href: '/services/#strings', blurb: 'Built for your bow, not off a peg' },
          { label: 'Custom Arrows', href: '/services/#arrows', blurb: 'Cut, squared and spined to you' },
        ],
      },
      {
        heading: 'Good to know',
        links: [
          { label: 'Service Questions', href: '/services/#questions', blurb: 'What people ask at the counter' },
          { label: 'Hunting Setups', href: '/hunting/', blurb: 'Getting a rig ready for the season' },
          { label: 'Shop Notes', href: '/insights/', blurb: 'Rob, writing things down' },
        ],
      },
    ],
    feature: {
      eyebrow: 'Every bow, twice',
      title: 'Tuned, then shot.',
      body: 'Paper tuned, cams timed, center shot set. Then shot on our own range before it goes out the door.',
      href: '/services/bow-tuning/',
      cta: 'How we tune a bow',
    },
  },
  {
    id: 'lessons',
    label: 'Lessons & Kids',
    href: '/lessons/',
    blurb: 'Instruction, camp, parties',
    columns: [
      {
        heading: 'Learn to shoot',
        links: [
          { label: 'Lessons', href: '/lessons/', blurb: 'Private and group instruction' },
          { label: 'Book a Lesson', href: '/lessons/#book', blurb: 'Pick a time and a coach' },
          { label: 'Lesson Rates', href: '/lessons/#rates', blurb: 'With our gear or with yours' },
        ],
      },
      {
        heading: 'Kids',
        links: [
          { label: 'Kids & Camp', href: '/kids/', blurb: 'Four ways in, age seven and up' },
          { label: 'Reserve a Spot', href: '/kids/#reserve', blurb: 'Summer camp and youth programs' },
          { label: 'Parties & Scouts', href: '/groups/', blurb: 'Birthdays, troops, team nights' },
          { label: 'Book a Group', href: '/groups/#enquire', blurb: 'Tell us the date and headcount' },
        ],
      },
    ],
    feature: {
      eyebrow: 'Summer camp',
      title: 'Kids shoot here.',
      body: 'Coached, supervised, air conditioned, and closer to home than you think.',
      href: '/kids/#reserve',
      cta: 'Reserve a spot',
    },
    extra: ['/kids/', '/groups/'],
  },
  {
    id: 'range',
    label: 'Range & Leagues',
    href: '/range/',
    blurb: '11 lanes, air conditioned',
    columns: [
      {
        heading: 'Shoot today',
        links: [
          { label: 'The Range', href: '/range/', blurb: '11 indoor lanes, open year round' },
          { label: 'Range Rules', href: '/range/#rules', blurb: 'Read before your first visit' },
          { label: 'Range Waiver', href: '/waiver/', blurb: 'Sign before you shoot' },
        ],
      },
      {
        heading: 'Shoot weekly',
        links: [
          { label: 'Leagues', href: '/leagues/', blurb: 'Adult and youth, all season' },
          { label: 'League Seasons', href: '/leagues/#seasons', blurb: 'What runs and when' },
          { label: 'Join a League', href: '/leagues/#join', blurb: 'Get on a team' },
          { label: 'Calendar', href: '/calendar/', blurb: 'What is happening and when' },
        ],
      },
    ],
    feature: {
      eyebrow: 'Walk in',
      title: 'Lanes are open.',
      body: 'Eleven of them, indoors and air conditioned, whatever the weather is doing on Route 46.',
      href: '/waiver/',
      cta: 'Sign the waiver',
    },
    extra: ['/waiver/', '/calendar/', '/leagues/'],
  },
  {
    id: 'about',
    label: 'About',
    href: '/about/',
    blurb: 'Three generations on Route 46',
    columns: [
      {
        heading: 'The family',
        links: [
          { label: 'Our Story', href: '/about/', blurb: 'Longest family owned bow shop in NJ' },
          { label: 'Trophy Room', href: '/trophy-room/', blurb: '200+ mounts and one polar bear' },
          { label: 'Hunting', href: '/hunting/', blurb: 'Planning a trip' },
        ],
      },
      {
        heading: 'Read & ask',
        links: [
          { label: 'Insights', href: '/insights/', blurb: 'Notes from the shop' },
          { label: 'FAQ', href: '/faq/', blurb: 'The questions we get most' },
          { label: 'Careers', href: '/careers/', blurb: 'Work behind the counter' },
        ],
      },
    ],
    feature: {
      eyebrow: 'Since 1957',
      title: 'Still the same family.',
      body: 'Three generations, one building, and a Sasquatch who works the door.',
      href: '/about/#rob',
      cta: 'Meet the shop',
    },
    extra: ['/trophy-room/', '/hunting/', '/insights/', '/faq/', '/careers/'],
  },
];

/** Sits at the end of the bar as a plain link, no panel. */
export const contactLink: NavLink = {
  label: 'Contact',
  href: '/contact/',
  blurb: 'Hours, map, get in touch',
};

/** The bar's standing call to action. */
export const navCta: NavLink = { label: 'Book a Lesson', href: '/lessons/#book' };

/** Every path a group owns, longest first so /pro-shop/mathews/ beats /pro-shop/. */
function groupPaths(group: NavGroup): string[] {
  return [group.href, ...(group.extra ?? [])];
}

/** Which group a pathname belongs to, or undefined for home, contact and 404. */
export function groupFor(pathname: string): NavGroup | undefined {
  if (pathname === '/') return undefined;
  let best: { group: NavGroup; length: number } | undefined;
  for (const group of navGroups) {
    for (const path of groupPaths(group)) {
      if (pathname.startsWith(path) && (!best || path.length > best.length)) {
        best = { group, length: path.length };
      }
    }
  }
  return best?.group;
}

/** Flattened panel links, de-duplicated, for the sticky sub-nav. */
export function subNavLinks(group: NavGroup): NavLink[] {
  const seen = new Set<string>();
  const out: NavLink[] = [];
  for (const column of group.columns) {
    for (const link of column.links) {
      if (seen.has(link.href)) continue;
      seen.add(link.href);
      out.push(link);
    }
  }
  return out;
}

/**
 * Which of these links the reader is currently on. Exact match wins; failing
 * that, the longest href whose path prefixes the current one, so a post at
 * /insights/category/leagues-and-community/ still lights up INSIGHTS. Anchor
 * links resolve to their page, and the bare page link carries the marker.
 */
export function activeHref(links: NavLink[], pathname: string): string | undefined {
  let bestPath = '';
  for (const { href } of links) {
    const path = href.split('#')[0];
    if (path && pathname.startsWith(path) && path.length > bestPath.length) bestPath = path;
  }
  if (!bestPath) return undefined;
  const bare = links.find((l) => l.href === bestPath);
  return bare ? bare.href : links.find((l) => l.href.split('#')[0] === bestPath)?.href;
}

export const footerNav = [
  {
    heading: 'The Shop',
    links: [
      { label: 'Pro Shop', href: '/pro-shop/' },
      { label: 'Mathews', href: '/pro-shop/mathews/' },
      { label: 'Hoyt', href: '/pro-shop/hoyt/' },
      { label: 'SITKA Gear', href: '/pro-shop/sitka/' },
      { label: 'Services', href: '/services/' },
      { label: 'Bow Tuning', href: '/services/bow-tuning/' },
    ],
  },
  {
    heading: 'Shoot With Us',
    links: [
      { label: 'The Range', href: '/range/' },
      { label: 'Lessons', href: '/lessons/' },
      { label: 'Leagues', href: '/leagues/' },
      { label: 'Kids Camp', href: '/kids/' },
      { label: 'Groups & Events', href: '/groups/' },
      { label: 'Range Waiver', href: '/waiver/' },
    ],
  },
  {
    heading: 'The Family',
    links: [
      { label: 'About', href: '/about/' },
      { label: 'Trophy Room', href: '/trophy-room/' },
      { label: 'Hunting', href: '/hunting/' },
      { label: 'Insights', href: '/insights/' },
      { label: 'Calendar', href: '/calendar/' },
      { label: 'FAQ', href: '/faq/' },
    ],
  },
];
