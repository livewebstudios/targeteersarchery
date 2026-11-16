# Session summary: the whole site in Trailhead

**Date:** 2026-11-16 · **Branch:** `demo/home-three` · **Not committed, not merged.**

Jon picked Trailhead from the three home page demos and asked for the whole site in it. Every route now uses the same skin: a fixed landscape under a navy wash, clear glass panels, white ink, tan labels, one orange button per screen, the five-link nav, the phone action bar and the glass footer.

## What changed

**The system** (every page inherits it)
- `src/styles/tokens.css`: Rob's logo colours, the ink scale, the glass and pane recipes, the washes. The old cream-and-ember names are kept as aliases pointing at the new skin; `#site-gate` pins their old values.
- `src/styles/global.css`: type, `.glass`, `.pane`, the solid fallbacks, buttons (`.d-btn--orange / --light / --outline`), the backdrop, the brand heading arrow, reveals, the hand-built band override.
- `src/layouts/Base.astro`: backdrop (or the page's own through the `backdrop` slot), `SiteNav`, the page as a grid of panels, the section strip, `Footer`, `ActionBar`. Gate, motion failsafe, CMS invite redirect and view transitions unchanged.
- New: `Backdrop.astro`, `nav/SiteNav.astro`, `nav/ActionBar.astro`, `nav/SectionLinks.astro`, `data/scenes.ts`.
- Rewritten: `Footer`, `Section`, `PageHero`, `Card`, `Button`, `ContactBand` (now glass), `Field`, `Form`, `OpenNowPill`, `DealerRow`, `ArrowLink`, `data/nav.ts`.
- Removed: `nav/Nav.astro`, `nav/MobileMenu.astro`, `nav/SubNav.astro`, `nav/SubRail.astro`, `styles/mobile-menu.css`, `hero/HeroFilm.astro`, `Milestones.astro`.
- Moved: `FactList`, `BrandArrow`, `TaskIcon` from `components/demo/` to `components/`.
- `astro.config.mjs`: `scopedStyleStrategy: 'class'` (see OPEN_QUESTIONS 14).

**The home page** (`src/pages/index.astro`) is Trailhead with the old home page's production SEO.

**Pages:** the eight hand-built bands now sit in glass; the post layout puts the header and photo in one glass card; contact's map panel is normal width; category chips, the checkbox, the newsletter button and hand-set faint text colours fixed for navy.

**Scripts:** `contrast.mjs`, `layout-check.mjs` and `kill-list.mjs` are new. `qa-screens.mjs` now covers every route (hoyt, sitka, the category page and thank-you added) at 390 and 1440, with `--widths` and `--only`.

**Docs:** README (the look, navigation, the arrow, the film, QA), this file, `OPEN_QUESTIONS.md`.

## Checks run (against `npm run build` + `astro preview --port 4322`)

| Check | Result |
|---|---|
| `npx astro check` | 0 errors, 0 warnings |
| `npm run build` | clean, 45 pages, sitemap, RSS, `/admin/` |
| `node scripts/a11y.mjs` (25 routes × 375, 1440) | no axe violations |
| `node scripts/contrast.mjs` (9 grounds × 2 widths × glass and pane) | lowest 4.62:1 |
| `node scripts/layout-check.mjs` (25 routes × 360, 390, 768, 1024, 1440, 1920) | no horizontal scroll, no glass in glass, never more than one orange on screen |
| `node scripts/layout-check.mjs --transparency` | every glass surface solid |
| `node scripts/kill-list.mjs` (48 built files) | no em dashes, no banned phrases |
| `node scripts/qa-screens.mjs` | 50 screenshots in `qa/`; reduced motion forced, every page complete |
| `qa-screens --demos` | the four demo routes still render |

Untouched: `SiteGate.astro`, `public/admin/` (Decap 3.1.2 pin), `public/_redirects`, `public/robots.txt`, the content collections, every Formspree endpoint.

## To review

```bash
npm run dev
```

Open `http://localhost:4321/`, enter the admin password once, and walk the five destinations. `/demos/` is still there for comparison.

## Next

1. Jon reviews the look, especially how much darker the glass is than the approved demo (OPEN_QUESTIONS 1).
2. Commit on this branch, push, open the PR for a Netlify Deploy Preview.
3. Lighthouse on the preview, and a real-phone and Safari pass.
4. Before launch: remove the demos and their kit, then the gate.
