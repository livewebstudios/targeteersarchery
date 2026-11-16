/**
 * Site navigation. Five destinations, no dropdowns, no sub-nav. Every other
 * page belongs to one of the five, is linked from that destination's page,
 * and is listed in the footer. Contact lives in the footer, the visit block
 * and the mobile action bar on every page.
 */
export interface NavLink {
  label: string;
  href: string;
}

export interface NavDestination extends NavLink {
  /** Path prefixes that light this destination up as the current section. */
  owns: string[];
  /** Every page under this destination, for the strip at the foot of each. */
  pages: NavLink[];
}

/** The five links in the top nav. Labels are authored ALL CAPS. */
export const siteNav: NavDestination[] = [
  {
    label: 'PRO SHOP', href: '/pro-shop/', owns: ['/pro-shop/'],
    pages: [
      { label: 'THE PRO SHOP', href: '/pro-shop/' },
      { label: 'MATHEWS', href: '/pro-shop/mathews/' },
      { label: 'HOYT', href: '/pro-shop/hoyt/' },
      { label: 'SITKA GEAR', href: '/pro-shop/sitka/' },
    ],
  },
  {
    label: 'BOW SERVICE', href: '/services/', owns: ['/services/', '/hunting/'],
    pages: [
      { label: 'BOW SERVICE', href: '/services/' },
      { label: 'BOW TUNING', href: '/services/bow-tuning/' },
      { label: 'HUNTING SETUPS', href: '/hunting/' },
    ],
  },
  {
    label: 'RANGE & LEAGUES', href: '/range/', owns: ['/range/', '/leagues/', '/waiver/', '/calendar/'],
    pages: [
      { label: 'THE RANGE', href: '/range/' },
      { label: 'LEAGUES', href: '/leagues/' },
      { label: 'RANGE WAIVER', href: '/waiver/' },
      { label: 'CALENDAR', href: '/calendar/' },
    ],
  },
  {
    label: 'LESSONS & KIDS', href: '/lessons/', owns: ['/lessons/', '/kids/', '/groups/'],
    pages: [
      { label: 'LESSONS', href: '/lessons/' },
      { label: 'KIDS CAMP', href: '/kids/' },
      { label: 'GROUPS & PARTIES', href: '/groups/' },
    ],
  },
  {
    label: 'ABOUT', href: '/about/', owns: ['/about/', '/trophy-room/', '/faq/', '/careers/', '/insights/'],
    pages: [
      { label: 'OUR STORY', href: '/about/' },
      { label: 'TROPHY ROOM', href: '/trophy-room/' },
      { label: 'INSIGHTS', href: '/insights/' },
      { label: 'FAQ', href: '/faq/' },
      { label: 'CAREERS', href: '/careers/' },
    ],
  },
];

/** The destination a pathname sits under, if any. */
export function destinationFor(pathname: string): NavDestination | undefined {
  return siteNav.find((d) => currentState(d, pathname));
}

/** The menu on a phone adds the one page the top bar leaves to the footer. */
export const contactLink: NavLink = { label: 'CONTACT', href: '/contact/' };

/**
 * Which destination a pathname sits under: 'page' when it is that
 * destination's own page, 'section' when it is one of the pages it owns.
 */
export function currentState(dest: NavDestination, pathname: string): 'page' | 'section' | undefined {
  if (pathname === dest.href) return 'page';
  return dest.owns.some((p) => pathname.startsWith(p)) ? 'section' : undefined;
}

/**
 * The footer lists every page on the site, grouped under the same five
 * destinations, so nothing that left the top nav is ever more than one
 * click from anywhere. Labels are authored ALL CAPS (LWS nav rule).
 */
export const footerNav: { heading: string; links: NavLink[] }[] = [
  {
    heading: 'Pro Shop & Service',
    links: [
      { label: 'PRO SHOP', href: '/pro-shop/' },
      { label: 'MATHEWS', href: '/pro-shop/mathews/' },
      { label: 'HOYT', href: '/pro-shop/hoyt/' },
      { label: 'SITKA GEAR', href: '/pro-shop/sitka/' },
      { label: 'BOW SERVICE', href: '/services/' },
      { label: 'BOW TUNING', href: '/services/bow-tuning/' },
      { label: 'HUNTING SETUPS', href: '/hunting/' },
    ],
  },
  {
    heading: 'Range & Lessons',
    links: [
      { label: 'THE RANGE', href: '/range/' },
      { label: 'RANGE WAIVER', href: '/waiver/' },
      { label: 'LEAGUES', href: '/leagues/' },
      { label: 'CALENDAR', href: '/calendar/' },
      { label: 'LESSONS', href: '/lessons/' },
      { label: 'KIDS CAMP', href: '/kids/' },
      { label: 'GROUPS & PARTIES', href: '/groups/' },
    ],
  },
  {
    heading: 'About',
    links: [
      { label: 'OUR STORY', href: '/about/' },
      { label: 'TROPHY ROOM', href: '/trophy-room/' },
      { label: 'INSIGHTS', href: '/insights/' },
      { label: 'FAQ', href: '/faq/' },
      { label: 'CAREERS', href: '/careers/' },
      { label: 'CONTACT', href: '/contact/' },
    ],
  },
];
