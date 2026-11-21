# Targeteers v2 home demos: session summary

**Date:** 2026-11-21
**Branch:** `demo/home-v2`, cut from `origin/main` at `d607c19`
**Draft PR:** https://github.com/livewebstudios/targeteersarchery/pull/1 ("v2 home page demos (do not merge)")
**Deploy Preview:** https://deploy-preview-1--targeteersarchery.netlify.app (address taken from Netlify's comment on the PR, status "ready"). Checked live: `/`, `/v2/` and the three demos answer 200, `/demos/` answers 404, the gate is in the page, and Netlify also sends `x-robots-tag: noindex`. That check was against the build of `6e55443`; this summary commit triggers one more preview build of the same code.
**Gate:** up on every route. Password unchanged. `SiteGate.astro` untouched.

All six tasks were built in order. Every judgment call (75 of them) is in `docs/26_11_21_v2_OPEN_QUESTIONS.md`.

---

## 1. What was built

| Route | File | What |
|---|---|---|
| `/` | `src/pages/index.astro` | The chooser. The Trailhead home page cannot be reached on this branch. |
| `/v2/` | `src/pages/v2/index.astro` | The chooser, same component |
| `/v2/1-route-46/` | `src/pages/v2/1-route-46.astro` | Demo 1, ROUTE 46 |
| `/v2/2-blackout/` | `src/pages/v2/2-blackout.astro` | Demo 2, BLACKOUT |
| `/v2/3-since-1957/` | `src/pages/v2/3-since-1957.astro` | Demo 3, SINCE 1957 |

All five are `noindex, nofollow`. `/v2/` is out of the sitemap and disallowed in `robots.txt`.

**Demo 1, ROUTE 46.** Rob's old home page, section for section. White header with his six links, the showroom photo with nothing on it, Libre Baskerville capitals in olive and tan, his three badges over a four-up proof row, his three tabbed boxes, a forest band of six white target cards with the facts on them, the hunting band, a cream About, a dark green footer with four small targets. Signature move: an arrow flies into each of the six targets, one after another, and quivers.

**Demo 2, BLACKOUT.** Near black, Barlow Condensed capitals, photos edge to edge, no boxes. Full bleed hero on the wall of bows, giant proof numerals, the pledge as the loudest thing in its section, white dealer marks, six photo tiles with fact rows, the Yukon hunt band, outlined 1957 numerals in About. Signature move: an orange arrow is fired along five of the seams between sections.

**Demo 3, SINCE 1957.** Warm paper, navy ink, Zilla Slab in sentence case. Logo centered with three links each side over a double rule, a then and now hero pair, a ruled proof row with the 2007 shield, the pledge as a pull quote, numbered sections (No. 01 to No. 11), the six offerings as a ledger with dotted leaders and captioned photos, Rob on horseback as the one cinematic band. Signature move: an arrow travels the line from 1957 to Today as the timeline scrolls through the screen.

**The chooser.** Neutral: white, navy text, system font, the logo at 220px. Three cards, each with one photo from that demo's hero.

**Shared kit (data and logic, no look):** `src/data/homeV2.ts` (the copy deck, word for word, plus the photo slots), `src/layouts/V2Base.astro`, `src/styles/v2-base.css`, `src/scripts/v2.ts`, and in `src/components/v2/`: `V2Switcher`, `V2Logo`, `V2OpenNow`, `V2Hours`, `V2Form`, `V2Arrow`, `V2Brands`, `V2ActionBar`, `V2Chooser`.

**Photos:** the 16 upgraded photos are in `src/assets/v2/` and committed (10 MB of sources; Astro serves resized WebP).

**QA scripts:** `scripts/qa-screens-v2.mjs` (asked for), plus `scripts/qa-check-v2.mjs` and `scripts/qa-lighthouse-v2.mjs`.

### Commits

| Commit | What |
|---|---|
| `cd8fce9` | Throw out the v1 demos and lay the v2 foundation `[skip netlify]` |
| `e65c3f3` | Add the upgraded photo set and the shared v2 kit `[skip netlify]` |
| `729b327` | Build demo 1, ROUTE 46 `[skip netlify]` |
| `da9db83` | Build demo 2, BLACKOUT `[skip netlify]` |
| `d70e031` | Build demo 3, SINCE 1957, and finish the chooser `[skip netlify]` |
| `6e55443` | QA the v2 home page demos and make them ready for review |
| (this one) | Session summary. No skip flag, so the preview builds from the last commit. |

---

## 2. Pre-flight

- Local `main` matched `origin/main` at `d607c19` with exactly the 11 modified files the handoff described. `git restore .` discarded them. **No untracked files and nothing beyond those 11.**
- Baseline `npm run build` passed (45 pages) before any change.
- `desktop.ini` was not in `.gitignore`. Added.
- Three font packages installed: `@fontsource/libre-baskerville`, `@fontsource-variable/nunito-sans`, `@fontsource/zilla-slab`.

---

## 3. v1 files deleted, and the ones that had to stay

**Deleted (10 files, plus the Trailhead home page content):**

- `src/pages/demos/index.astro`, `1-base-camp.astro`, `2-trailhead.astro`, `3-long-shot.astro`
- `src/components/demo/ActionBar.astro`, `DemoBar.astro`, `DemoFooter.astro`, `DemoNav.astro`
- `src/layouts/DemoBase.astro`
- `src/styles/demo.css`
- `src/pages/index.astro`: Trailhead content replaced by the chooser

**Had to stay (the build or the type check breaks without them):**

| File | Still imported by |
|---|---|
| `src/data/scenes.ts` | `src/layouts/Base.astro` and `src/components/Backdrop.astro`. Every inner page is built on `Base.astro`. |
| `src/assets/demo-scenes/` (8 AI landscapes) | `scenes.ts` |
| `src/data/home.ts` | `src/components/FactList.astro` and `src/components/TaskIcon.astro` (types). Both are orphans now, but existing components were not to be edited. |

Nothing in v2 imports any of the three. They come out in the promote step with the Trailhead skin.

---

## 4. Photo swaps

**None.** Every photo in the slot table was opened and checked, and each one shows what its slot needs.

One file was **not** copied: `../assets/v2-photos/_before_after.jpg`. It is a comparison sheet, not a site photo, and the acceptance line says the folder holds 16.

Things to know about the photos:

- `camp-wide.jpg` shows the camp kids seated on a bench in front of the trophy displays, not on the shooting line. The deck's alt text ("Summer camp kids at the range") was kept as written. Demo 3 prints it as the caption.
- The two forest backdrops in Demo 1 (`big-woods.jpg`, `forest-wide.jpg`) are not upgraded, so they are capped at their 1920px source width.
- No photo is displayed past its cap at 360, 390, 768, 1024, 1440 or 1920, and the offering and archive photos are served at a true 2x on a 2x screen (checked by decoding the file the browser chose).

---

## 5. The logo: one file is broken

**`src/assets/brand/logo.png` is not transparent.** The handoff lists it as "792 x 336, transparent" for light backgrounds. It is a 3 channel PNG with a grey and white checkerboard baked into its pixels. On any background it shows as a checkered rectangle.

So `V2Logo` renders `logoRGB.png` (true transparency, white keyline) everywhere. On white the keyline disappears and the logo is clean. On Demo 3's paper it reads as a thin white sticker edge. The `on` prop is still there, so the swap is one line when a clean light file exists.

`logoRGB.png` also has a few stray light specks near the arrow point, visible only on the dark backgrounds. They are in the source. The logo was not altered.

---

## 6. Marks that became wordmarks

All eight marks were rendered in one color and inspected.

| Brand | Demo 1 (`color`) | Demo 2 (`mono-light`) | Demo 3 (`mono-dark`) | Why |
|---|---|---|---|---|
| Hoyt | mark | **wordmark** | **wordmark** | Chrome 3D badge. A filter makes a solid block. |
| TenPoint | mark | **wordmark** | **wordmark** | Sits on a black plate. A filter makes a solid block. |
| Easton | mark | **wordmark** | **wordmark** | Not predicted by the handoff. Its boxed "E" becomes a blank lozenge in one color. |
| Mathews | mark | mark | mark | Clean |
| Bowtech | mark | mark | mark | Clean (the red swoosh takes the one color) |
| Ravin | mark | mark | mark | Clean |
| SITKA | mark | mark | mark | Clean. The file is the symbol only, no wordmark. |
| Carbon Express | mark | mark | mark | Clean |

Demo 2 wordmarks are Barlow Condensed 800 capitals. Demo 3 wordmarks are Zilla Slab 600. Demo 3's marks are flooded with the exact navy through an SVG filter. No brand is linked.

---

## 7. QA

### The four Impeccable passes (run as skills, in order)

| Pass | Checked | Changed |
|---|---|---|
| `/polish` | Kill list scan over every file created or changed (zero hits; `type="submit"` is markup). Every rendered string and alt text for double spaces, dashes, forbidden phrases and stray punctuation (none). Heading order (no skipped levels). Titles and descriptions. | Demo titles shortened from 65 to 67 characters to under 60. Copy was **not** run through Jon's voice: it is Rob's voice and the deck is locked. |
| `/colorize` | 47 text and edge pairs computed, hover and focus states included. All pass. Every ratio in the handoff's tables came out the same to two decimals. Table saved to `qa/v2/contrast-pairs.md`. | Every color literal in the three stylesheets moved to a custom property. Demo 2's hero and hunt band got a scrim that travels with the text. |
| `/layout` | Overflow, clipping, tap targets, image dimensions and anchor landing at 320, 375, 768, 1024, 1440, then a 16 width sweep. Tablet layouts looked at by eye. | Tap targets brought to 44px. Demo 3's 4px overflow at 320px fixed. Proof rows hold one line at every width. Demo 3's ledger got a tablet layout. |
| `/animate` | Every transition and animation inventoried against the motion budget. Reveals, header state, all three signature moves and the phone timeline exercised with motion on. | Header shrink is transform only now (was a height transition). Timings moved to variables. Demo 3's waiting stops kept above 4.5:1. |

UI/UX Pro Max guideline queries were run as well (the LWS checklist requires it before a client preview link). It led to tabbing through every page, which found that filled buttons had invisible focus rings on two demos. Fixed: 0 weak or missing rings across 31 to 37 tab stops per page.

### Section 9, `node scripts/qa-check-v2.mjs`: 21 of 21 pass

- Gate: a private window shows only the gate on all 5 routes, and the gate is **pixel for pixel** what it is on the old layout (0 differing pixels at 1440 and 390).
- Links: every `href` is `#`, `tel:`, the directions URL, a social URL, a `/v2/` route or the LWS credit. Every `#` link has a target.
- One `<h1>` inside `<main>` on each page. No inline `style` attributes, in the built HTML or written at runtime.
- Open now, on a faked clock, in all three demos: Monday 3 pm `CLOSED · OPENS TUE 12 PM`, Saturday 2:30 pm `OPEN NOW · UNTIL 5 PM`, Saturday 9 am `CLOSED · OPENS TODAY 11 AM`, Sunday 6 pm `CLOSED · OPENS TUE 12 PM`, Friday 6:59 pm `OPEN NOW · UNTIL 7 PM`. Today's row in the hours table follows.
- Mobile menu: opens, holds focus through a full Tab and Shift+Tab cycle, closes on Esc with focus back on MENU, closes on link tap and lands on the section.
- Form: shows "Demo form. Not connected yet." and sends nothing.
- Switcher: all four pages reachable from all four pages.
- No horizontal scroll at 360, 390, 768, 1024, 1440, 1920 (and at 320 in the layout pass).
- Fonts: Demo 1 downloads Libre Baskerville and Nunito Sans only, Demo 2 Barlow Condensed and Instrument Sans only, Demo 3 Zilla Slab and Instrument Sans only.
- Reduced motion: six arrows at rest in their targets (1), five static arrowheads (2), arrow at Today with all stops full (3), nothing left hidden.
- Motion on: 6 of 6 arrows land, 5 of 5 seams fire, the timeline arrow advances with scroll.

### Lighthouse, mobile, and axe

Lighthouse 13.6.0, mobile form factor, simulated slow 4G, against the production build served by `astro preview`.

| Page | Performance | Accessibility | Best practices | LCP | CLS | TBT | axe violations |
|---|---|---|---|---|---|---|---|
| Demo 1, ROUTE 46 | 96 | 100 | 100 | 2.8 s | 0 | 0 ms | 0 (52 rules passed) |
| Demo 2, BLACKOUT | 96 | 100 | 100 | 2.9 s | 0 | 0 ms | 0 (51 rules passed) |
| Demo 3, SINCE 1957 | 98 | 100 | 100 | 2.5 s | 0 | 0 ms | 0 (51 rules passed) |
| Chooser | 99 | 100 | 100 | 2.0 s | 0 | 0 ms | 0 (35 rules passed) |

SEO reads 69 on all four because of `noindex`, as the handoff expected. axe ran at 390 and 1440 with the WCAG 2.0, 2.1 and 2.2 A and AA tags plus best practices.

### Text over photos

65 text blocks sampled at 390, 768, 1024 and 1440: the brightest pixel under each block against the text color.

| Demo | Blocks | Lowest ratio |
|---|---|---|
| Demo 1 (hunt band) | 8 | 4.98:1 |
| Demo 2 (hero, menu over the hero, hunt band) | 45 | 4.87:1 |
| Demo 3 (hunt band) | 12 | 4.98:1 |

### Build

- `npm run build`: clean, 45 pages.
- `npx astro check`: 0 errors, 0 warnings. (10 hints, all in files that were there before this session.)
- `git diff --stat origin/main` lists only new files, the deletions above, the rewritten `src/pages/index.astro`, `public/robots.txt`, `astro.config.mjs`, `package.json`, `package-lock.json` and `.gitignore`. `Base.astro`, `SiteGate.astro`, `tokens.css`, `global.css`, `business.ts`, every existing component and every inner page are unchanged.

### Screenshots (in `build/qa/v2/`, not tracked)

Eight full page shots at 390 and 1440 with reduced motion forced, and nine more in `qa/v2/motion/` from the 1440 pass with motion on. All were looked at. The three 1440 pages were compared side by side: a boxed white and green page, a full bleed black page and a paper ledger. No two share a section layout.

To rerun everything:

```bash
npm run build
npx astro preview --port 4390 &
node scripts/qa-check-v2.mjs
node scripts/qa-screens-v2.mjs
node scripts/qa-screens-v2.mjs --motion
node scripts/qa-lighthouse-v2.mjs
```

---

## 8. Where the build departs from the handoff

The full list with reasons is in the open questions file. The ones worth knowing before Rob sees it:

1. **Demo 3's waiting timeline stops dim to 64 and 82 percent, not 35.** At 35 percent the text is about 2:1 and breaks the 4.5:1 hard rule. It also took Demo 3's Lighthouse accessibility to 97.
2. **Demo 2's scrims are heavier than specified** behind the text, because the orange label and muted lead were under 3:1 over bright pixels. The photo still shows on the right half.
3. **Demo 3's hunt scrim is darker and taller than specified**, for the same reason (the snow is nearly white).
4. **Demo 2's header CALL button is an outline until the hero's CALL button scrolls away**, then turns orange. That keeps one primary button per screen.
5. **The email address is plain text.** A `mailto:` is not on the list of links allowed off the page.
6. **Proof rows go four across later than specified** (960px and 896px), and Demo 2's numerals drop under the 3rem floor on small phones, so TOP 100 never breaks or collides.
7. **The mobile menu has a CLOSE button.** A full screen panel covers MENU.
8. **Demo 1's arrows stick in at an angle**, so the shaft sits on the white card and not along the dark edge.
9. **Libre Baskerville italic is loaded** (one extra file) for the pledge.

---

## 9. Still open

**For Jon**

1. **Re-export the light logo with real transparency.** `src/assets/brand/logo.png` has a checkerboard baked in (section 5).
2. `scenes.ts`, `demo-scenes/` and `home.ts` are still on the branch (section 3). They go in the promote step.
3. `build/.claude/launch.json` already existed and I overwrote it before looking. I rebuilt it as one `targeteers-dev` entry and the result is the same size as the original (186 bytes), but I cannot prove it is identical. I also added a `targeteers-preview` entry (port 4390) to the client folder's `.claude/launch.json`. Both are local and gitignored.
4. Ports 4321 and 4322 on this Mac were held by other client projects' servers (thresholdstudios, movingalwaysforward, livewebstudios-v3). Left alone. This session used 4325 and 4390. Both of this session's servers are still running.
5. `CLAUDE.md` in the client folder still points at the September spec under "Start here". Update it after the pick.
6. Formspree IDs, the GA4 ID and the Mailchimp action URL are still placeholders in `business.ts`. The demo form sends nothing until the Formspree ID is real.
7. The live domain on `main` still shows the gate over the Trailhead build. This branch does not change that.
8. Each `[CONFIRM]` from the deck is carried into the pages as an HTML comment next to the fact it covers.

**For Rob**

1. Which one feels like Targeteers: 1, 2 or 3.
2. Thursday closing time: 7 pm or 5 pm. (The pages show 7 pm.)
3. Range distance: 27 or 28 yards. (The pages show 27.)
4. 2026 lesson prices. (The pages show $35, $55, $25, $45.)
5. Current league schedule.
6. The award wording: "Dealer of the Year, 2007" or "East Coast Dealer of the Year".
7. Is Mathews still exclusive to Targeteers in North Jersey. Left off the page until confirmed.
8. New, from this session: is the camp photo fine captioned "Summer camp kids at the range"? It shows the kids on a bench in front of the trophy displays.
