// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://targeteersarchery.com',
  output: 'static',
  // Class-based scoping, so a page's scoped style reaches the element a child
  // component renders with the class it was handed (<Reveal class="x__media">).
  // The default attribute strategy never does, which left those rules dead.
  scopedStyleStrategy: 'class',
  trailingSlash: 'always',
  integrations: [
    react(),
    sitemap({
      filter: (page) =>
        !page.includes('/admin') && !page.includes('/thank-you') && !page.includes('/demos') && !page.includes('/v2'),
    }),
  ],
  image: {
    // 350 source photographs, so keep the build honest about what it re-encodes.
    responsiveStyles: false,
  },
  // Six render-blocking <link>s of 1–6 KB each cost more on a phone than the
  // same CSS inlined into the document.
  build: { inlineStylesheets: 'always' },
  vite: {
    build: { assetsInlineLimit: 1024 },
  },
});
