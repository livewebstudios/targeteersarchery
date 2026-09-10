export interface NavLink {
  label: string;
  href: string;
  blurb?: string;
}

/** Primary nav. Labels render ALL CAPS site-wide. */
export const primaryNav: NavLink[] = [
  { label: 'Pro Shop', href: '/pro-shop/', blurb: 'Bows, crossbows, arrows, gear' },
  { label: 'Services', href: '/services/', blurb: 'Tuning, strings, repairs' },
  { label: 'Lessons', href: '/lessons/', blurb: 'Private and group instruction' },
  { label: 'Kids Camp', href: '/kids/', blurb: 'Summer camp and youth programs' },
  { label: 'Leagues', href: '/leagues/', blurb: 'Adult and youth leagues' },
  { label: 'Groups', href: '/groups/', blurb: 'Parties, scouts, corporate' },
  { label: 'The Range', href: '/range/', blurb: '11 lanes, air conditioned' },
  { label: 'Insights', href: '/insights/', blurb: 'Notes from the shop' },
  { label: 'About', href: '/about/', blurb: 'Three generations on Route 46' },
  { label: 'Contact', href: '/contact/', blurb: 'Hours, map, get in touch' },
];

/** Secondary links: a MORE dropdown on desktop, second column on mobile. */
export const moreNav: NavLink[] = [
  { label: 'Trophy Room', href: '/trophy-room/', blurb: '200+ mounts and one polar bear' },
  { label: 'Bow Tuning', href: '/services/bow-tuning/', blurb: 'How we tune a bow' },
  { label: 'Calendar', href: '/calendar/', blurb: 'What is happening and when' },
  { label: 'Hunting', href: '/hunting/', blurb: 'Planning a trip' },
  { label: 'Waiver', href: '/waiver/', blurb: 'Sign before you shoot' },
  { label: 'FAQ', href: '/faq/', blurb: 'The questions we get most' },
  { label: 'Careers', href: '/careers/', blurb: 'Work behind the counter' },
];

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
