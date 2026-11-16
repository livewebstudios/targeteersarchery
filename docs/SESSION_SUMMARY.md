# Session summary: three home page demos

**Date:** 2026-11-16 · **Branch:** `demo/home-three` (from `main` at `2b94aea`) · **Not merged.**

## Routes (all gated, noindex, out of the sitemap, disallowed in robots.txt)

| Route | What it is |
|---|---|
| `/demos/` | Review index: logo, one line, three cards |
| `/demos/1-base-camp/` | Smoke glass long scroll. Ridge, timber, dusk crossfade by scroll. The arrow crosses the hero once. |
| `/demos/2-trailhead/` | Frost glass dashboard over Rob's film. ARIA tabs, deep links `#shoot` to `#hunt`, JS-off stacked. The arrow is the tab indicator. `?bg=valley` swaps the film for the valley still. |
| `/demos/3-long-shot/` | Clear glass, seven 100svh stations, seven scenes. An arrow on a fixed rail is scrubbed to the scroll and lands in the target at station 6. |

## Files

**New**
- `src/layouts/DemoBase.astro`
- `src/styles/demo.css` (brand tokens, the three glass recipes, shared kit, re-skins of the existing components)
- `src/data/home.ts`
- `src/components/demo/`: `DemoNav`, `DemoBar`, `ActionBar`, `FactList`, `BrandArrow`, `TaskIcon`, `DemoFooter`
- `src/pages/demos/` (four routes)
- `src/assets/demo-scenes/`: eight renders, all inspected and all clean, so no fallbacks were used. `tarn.jpg` has no slot in any demo.
- `public/images/shot-arrow-brand.svg`, `public/images/shot-arrow-brand-light.svg`
- `public/images/verifiedsecured.png` (copied from the canonical LWS file)

**Changed**
- `astro.config.mjs` (sitemap filter)
- `public/robots.txt`
- `scripts/make-arrow.mjs` (colours overridable, two brand outputs)
- `scripts/qa-screens.mjs` and `scripts/a11y.mjs` (a `--demos` flag, the gate cookie, a Windows Chrome path)
- `package.json` (`@fontsource/barlow-condensed`)
- `.gitignore` (`/26_*_handoff.md`)

**Untouched, verified:** `git diff main` is empty for `src/pages/index.astro`, `src/layouts/Base.astro`, `src/components/nav`, `src/styles/tokens.css`, `src/styles/global.css`, `SiteGate.astro`, and the two original arrow SVGs.

## Checks run

- `npx astro check`: 0 errors. The 6 hints are all pre-existing.
- `npm run build`: clean, 45 pages.
- `node scripts/a11y.mjs --demos`: no axe violations across 4 routes × 2 widths.
- No horizontal scroll at 360, 390, 768, 1024, 1440 or 1920 on any demo route.
- CLS on the production build: 0 to 0.0008. The LCP element is the H1 text on every demo (the index's phone LCP is a card photo), never the film.
- Reduced transparency: glass falls back to solid fills with no blur.
- Reduced motion: every arrow at rest, Base Camp shows timber only, and Long Shot's arrow jumps to the current tick with the visit panel visible.
- Kill-list scan of the demo copy: zero em dashes and zero banned phrases.
- `node scripts/qa-screens.mjs --demos`: 8 full-page screenshots in `qa/` (gitignored).

## To review

```bash
npm run dev
```

Then open `http://localhost:4321/demos/`. The gate is still up, so enter the admin password once per browser.

## Next

Open the PR from `demo/home-three` so Netlify builds a Deploy Preview, review the three directions, then pick one. See `OPEN_QUESTIONS.md`.
