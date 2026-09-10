import { business, hours } from '~/data/business';

const ID = 'https://targeteersarchery.com/#store';

export function localBusinessSchema(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportingGoodsStore',
    '@id': ID,
    name: business.name,
    alternateName: business.shortName,
    slogan: business.tagline,
    url: siteUrl,
    image: `${siteUrl}og/home.jpg`,
    logo: `${siteUrl}images/logoRGB.png`,
    telephone: business.phone,
    email: business.email,
    priceRange: '$$',
    foundingDate: business.founded,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address.street,
      addressLocality: business.address.city,
      addressRegion: business.address.region,
      postalCode: business.address.postal,
      addressCountry: business.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: business.geo.lat,
      longitude: business.geo.lng,
    },
    hasMap: business.mapsUrl,
    openingHoursSpecification: hours
      .filter((h) => !h.closed)
      .map((h) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: `https://schema.org/${h.schema}`,
        opens: h.open,
        closes: h.close,
      })),
    areaServed: business.areaServed.map((name) => ({ '@type': 'Place', name })),
    sameAs: [business.socials.facebook, business.socials.instagram, business.socials.twitter],
    knowsAbout: [
      'Compound bow tuning',
      'Custom bow strings',
      'Archery lessons',
      'Indoor archery range',
      'Crossbows',
      'Bowhunting',
    ],
  };
}

export function breadcrumbSchema(siteUrl: string, trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: new URL(t.path, siteUrl).href,
    })),
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}
