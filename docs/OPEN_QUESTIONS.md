# Open questions: the Trailhead site

Branch `demo/home-three`, 2026-11-16. Jon picked Trailhead and asked for the whole site in it. These are the calls made while doing that, plus what still needs Jon or Rob. Nothing here blocks review. The older demo-phase notes are at the bottom.

## Judgment calls (worth a look on the preview)

1. **The glass is darker than the demo Jon approved.** The demo's contrast check measured the darkest part of the ground, which is the wrong end for white text. Measured against the brightest 1% of every scene (`scripts/contrast.mjs`), tan labels came out at 3.1:1 and faint text at 3.8:1. To clear 4.5:1 everywhere, the fix went where the brief says contrast should come from, the wash, plus a small step on the glass:
   - Wash over the scenes: 0.48/0.56 to **0.64/0.68**. Over the film: 0.42/0.50 to **0.58/0.64**.
   - Glass navy tint 0.20 to **0.28**, diagonal shine 0.16 to **0.12** at its brightest.
   - Lowest result now 4.62:1. If Jon wants it lighter, the trade is tan labels (or faint notes) turning white.
2. **Tan on cards.** A card inside glass (a pane) sits brighter than the glass, and tan text on it measured 3.85:1. Labels on panes use a paler tan, `#ffd29a`, set automatically on `.pane` and on the page-built cards that use the pane tint. Same family, 4.65:1 worst case.
3. **Hover never brightens a card's fill.** A 14% white hover tint dropped faint text under 4.5:1 while hovered. Cards and home tiles now lift and brighten the rim instead.
4. **Every section is one glass panel.** `Section.astro` renders its content in a single `.glass` panel; anything inside is a pane. The old tones collapse to one skin; `pine` and `bark` read a touch deeper so a run of panels does not look identical. The eight hand-built dark bands (range promise, tuning steps, polar bear and so on) keep their markup but now sit in one deeper glass panel (`.band__panel`).
5. **Page heroes put Rob's photo inside the card.** Landscapes behind the glass, his photos inside it: the hero is one glass card with the H1 on the left and his photo on the right (on top on a phone).
6. **One landscape per destination** (`src/data/scenes.ts`): timber for the pro shop, hardwoods for service, canopy for hunting, ridge for range and leagues, meadow for lessons and kids, dusk for about, tarn for insights and FAQ, valley for contact and everything else. The home page keeps the film.
7. **Buttons.** Orange is reserved for CALL. `<Button variant="primary">` is now a white fill with navy text; `variant="orange"` exists for a page's one real call and marks itself `data-primary`, so the nav's CALL steps down while it is on screen. Form buttons are white outlines.
8. **Form button labels.** The default is SEND IT. The pages' own labels (Request a lesson, Send enquiry, Sign me up, Sign and send, Ask about a spot, Send message) were kept: none is banned and each says what happens.
9. **A section strip at the foot of each page.** With the sub-nav gone, four destination pages did not link to everything they absorbed (Services did not link Hunting; Range did not link Leagues; Lessons did not link Groups; About did not link FAQ, Careers or Insights). Rather than write links into the copy, every page under a destination ends with a slim glass strip listing that destination's pages (`SectionLinks.astro`). Not sticky, not a dropdown. Easy to remove if Jon prefers the footer alone.
10. **The footer lists every page,** grouped Pro Shop & Service, Range & Lessons, About, plus the visit block with the week's hours (`#hours`, where the phone action bar's HOURS button lands). Footer link labels are authored in caps now, not just styled.
11. **Home content that did not come across.** Trailhead replaces the old home page whole. The milestone band, the "What we do" cards, the trophy panel, the three-post insights rail and the newsletter box were not carried over: the six task tiles, the hours card, the four side cards (calendar, leagues, latest insight, dealers) and the family strip already answer the same questions. The newsletter signup stays on Contact. `HeroFilm.astro` and `Milestones.astro` were deleted.
12. **Production home differences from the demo:** real SEO (title, description, keywords, `/og/home.jpg`, indexable, canonical, LocalBusiness JSON-LD from `Base`), the `?bg=valley` test switch removed, the form posts as `contact-home`, and the phone action bar's HOURS goes to the hours card (`#today`).
13. **Retired:** the mega menu (`Nav.astro`), `MobileMenu.astro`, `SubNav.astro`, `SubRail.astro` and `mobile-menu.css`. `nav.ts` is now the five destinations, the pages under each, and the footer.
14. **Scoped styles were partly dead.** Astro's default attribute scoping never reaches an element a child component renders, so every page rule aimed at `<Reveal class="...">` (photo sizes, form boxes, the Sasquatch) silently did nothing, already on `main`. `astro.config.mjs` now uses `scopedStyleStrategy: 'class'`. Some layouts therefore look the way they were originally written rather than the way they rendered before.
15. **Dealer marks** are knocked back to white on the live site now, with Hoyt and TenPoint keeping their badge colours (this closes demo-phase item 8). Rob's own lockup sits on a white plate.
16. **The gate is untouched.** Its file is unchanged. Because it reads the old palette by name, `tokens.css` pins those names to their old values inside `#site-gate`.
17. **The demos stay** at `/demos/` for comparison: noindex, out of the sitemap, disallowed in robots.txt, still behind the gate. They now share `tokens.css` and `global.css` with the site and were re-captured to confirm they still render. They and their kit (`src/components/demo/`, `DemoBase.astro`, `demo.css`, the demo bar) should come out before launch. `FactList`, `BrandArrow` and `TaskIcon` moved to `src/components/` because the live site uses them.
18. **The skin is called glass now.** Production uses `.glass` and `.pane`. `.glass-frost` and `.pane-frost` are kept as aliases only so the demo still renders.

## Still needs Jon or Rob

- Range distance: 27 or 28 yards.
- 2026 lesson prices.
- Thursday closing time: 7 pm or 5 pm.
- Formspree IDs, GA4 ID and Mailchimp action URL are still placeholders in `business.ts`. Every form shows the "not connected yet, call us" note until its ID is set.
- The events collection needs winter dates: every entry is in the past, so the home page's THIS WEEK card shows its empty state.
- `trophy/mount-04.jpg` is a snowy spruce landscape, not mounts (carried from the demo notes).

## Not done or not verified

- **No Lighthouse, LCP or CLS run** since the re-skin. Every inner page now loads a full-screen backdrop photo eagerly; worth measuring on a mid-range phone.
- **Contrast was measured on the film's poster frame,** not on every frame of the moving film.
- **Checked by eye** at 390 and 1440 from full-page captures of all 25 routes, with closer looks at the home page, contact, trophy room and the pro shop dealer row. Not checked on a real phone or in Safari, where `backdrop-filter` behaves differently.
- Hover and focus states were checked in code and in the browser on a few pages, not on every component.

## Demo-phase notes still true

- The live gate renders its own H1. With the gate down each page shows one H1.
- Post dates on `PostCard` show a day early in any US timezone during `astro dev` (UTC date, local format). Harmless on Netlify's UTC build.
- Asset paths: hand-written public paths are relative (the LWS badge). The heading arrow is a root-absolute `url('/images/...')` in CSS, the deviation the README documents.
