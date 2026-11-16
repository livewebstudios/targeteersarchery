# Targeteers Archery

The website for Targeteers Archery Pro Shop, 101 Route 46 West, Saddle Brook, NJ.
Built by [Live Web Studios](https://livewebstudios.com).

Astro 5 (static) with a couple of React islands, no Tailwind, no UI kit. Design
tokens are CSS custom properties; every component carries its own scoped styles.

---

## Running it

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static output into dist/
npm run preview    # serve dist/ exactly as Netlify will
npm run check      # astro check — types and template diagnostics
```

Node 20 or newer.

---

## The look: clear glass over country

The whole site is the **Trailhead** design Jon picked from the three home page
demos in November 2026. Every page is the same stack:

1. **A fixed landscape** behind everything (`Backdrop.astro`, real `<img>`
   elements, never `background-attachment: fixed`). Each of the five
   destinations has its own scene, set in `src/data/scenes.ts`. The home page
   uses Rob's hero film instead.
2. **A navy wash** over the landscape (`--wash`, `--wash-film`). This does most
   of the contrast work. Do not lighten it without re-running
   `node scripts/contrast.mjs`.
3. **Clear glass panels** on top (`.glass`): a thin navy tint under a diagonal
   white shine, `blur(24px) saturate(160%)` (12px on a phone), a white rim and a
   lit top edge. Every `<Section>`, the page hero, the contact band, the nav pill
   and the footer is one glass panel. The page itself is a grid of panels with
   an even gap (`.page` in `Base.astro`).
4. **Panes** inside glass (`.pane`): tinted and rimmed, never blurred again.
   Cards, the home page tiles and form boxes are panes. **Never glass inside
   glass.** `scripts/layout-check.mjs` reports any it finds.

Ink and accents:

| Token | Value | Use |
|---|---|---|
| `--ink` | `#f8f8f4` | Headings and body copy |
| `--ink-muted` | white at 0.9 | Paragraphs, list text |
| `--ink-faint` | white at 0.8 | Notes, captions. Nothing fainter. |
| `--tgt-tan` | `#fcba66` | Small accent labels on glass. Orange text fails over snow. |
| `--tgt-tan-pale` | `#ffd29a` | The same labels on a pane, which sits brighter. Set automatically on `.pane`. |
| `--tgt-orange` | `#e46024` | **Fills only**, always with navy text. One per screen. |
| `--tgt-navy` | `#001840` | The menu, the phone action bar, the solid fallback |

**One orange per screen.** The nav's CALL button is orange. While any in-page
button marked `data-primary` (a `<Button variant="orange">`) is on screen, the
nav's CALL drops to an outline. Below 48rem the phone action bar owns the
orange and in-page primaries render as outlines. A page's main action is
otherwise `<Button variant="primary">`: white fill, navy text.

**Fallbacks.** With no `backdrop-filter`, or with `prefers-reduced-transparency`,
every glass surface becomes solid navy at 0.92.

The old cream-and-ember token names (`--cream-*`, `--bark-*`, `--stone-400`,
`--ember*`, `--pine-*`) still exist in `tokens.css`, re-pointed at the glass
skin, so an older page style that says `color: var(--bark-500)` reads as muted
white ink. New code should use `--ink`, `--hair`, `--accent-text` and `--tgt-*`.
The pre-launch gate is the one exception: `#site-gate` pins the old values so
the gate looks exactly as it did.

Astro is set to `scopedStyleStrategy: 'class'` so that a page's scoped style
reaches the element a child component renders with the class it was handed
(`<Reveal class="intro__media">`). With the default attribute strategy those
rules silently never applied.

---

## Day-to-day: what lives where

| You want to change… | Edit this |
|---|---|
| Phone, address, email, hours, socials, Formspree IDs, GA4 ID, Mailchimp URL | `src/data/business.ts` |
| The five nav destinations, the pages under each, footer columns | `src/data/nav.ts` |
| The six "What are you here for?" tasks on the home page | `src/data/home.ts` |
| Which landscape sits behind which part of the site | `src/data/scenes.ts` |
| Colours, glass, wash, type scale, spacing, motion timing | `src/styles/tokens.css` |
| Dealer carousel tiles, including the shop's own | `brands` in `src/data/business.ts` |
| Favicon and app icons | `public/images/cropped-target.png`, then `node scripts/make-icons.mjs` |
| Blog posts | `src/content/insights/` — or `/admin/`, see below |
| Calendar highlights | `src/content/events/` |
| League seasons | `src/content/leagues/` |
| FAQ entries | `src/content/faq/` |
| Staff cards on the About page | `src/content/team/` |
| Mathews / Hoyt / SITKA landing-page copy | `src/content/brands/` |
| Backdrop landscapes | `src/assets/demo-scenes/` (replace a file, keep its name) |
| Dealer logo files | `src/assets/brands/` — see the README in there |
| Old-URL redirects | `public/_redirects` |

`business.ts` is the single source of truth. The footer, the JSON-LD, the
"open today" pill and every form read from it, so changing the phone number in
one place changes it in eleven.

### Hours

`hours` in `src/data/business.ts` is an array, one row per day, in 24-hour time.
Set `closed: true` for a closed day. The tables and the "open today" pill are
rendered at build time and then corrected in the browser to the store's own
timezone, so a visitor in California still sees New Jersey hours.

### Adding a blog post in code

Drop a `.md` file into `src/content/insights/`:

```markdown
---
title: "Sentence case headline"
description: "One or two sentences. This is what Google shows under the link."
date: 2026-10-02
category: "Tuning & Gear"      # see src/content.config.ts for the six options
image: "../../assets/insights/whatever.jpg"   # optional
imageAlt: "What is in the photo"
draft: false
---

Body in Markdown. Use `## ` for section headings.
```

Categories generate their own index pages automatically, and the post appears in
`/rss.xml` and the sitemap on the next build.

### Adding an event or a league

Same idea, in `src/content/events/` and `src/content/leagues/`. The field lists
are in `src/content.config.ts`, and a bad value fails the build with a readable
message rather than shipping broken.

### The dealer carousel

`src/components/DealerRow.astro` runs the authorized-dealer row on the home page
and the pro shop page. It is a slow continuous marquee: three identical passes
sit side by side and the strip slides by exactly a third, so the loop has no
seam and needs no JavaScript to run. It pauses on hover, on keyboard focus, and
on its own pause button, and under `prefers-reduced-motion` it stops being a
carousel and renders as a plain wrapped row. Only the first pass is exposed to
screen readers and the tab order.

**Every tile now carries a real mark.** The component matches a file here to
each brand's `slug` in `src/data/business.ts`:

```
src/assets/brands/targeteers.png      the shop's own, leads the row
src/assets/brands/hoyt.png            from the previous site's media
src/assets/brands/mathews.svg         mathewsinc.com
src/assets/brands/bowtech.png         bowtecharchery.com
src/assets/brands/tenpoint.png        tenpointcrossbows.com
src/assets/brands/ravin.svg           ravincrossbows.com
src/assets/brands/sitka.svg           sitkagear.com
src/assets/brands/easton.png          eastonarchery.com
src/assets/brands/carbon-express.png  feradyne.com
```

Drop a replacement in under the same slug, rebuild, and the tile picks it up.
No code change. On navy glass every mark is knocked back to white so the row
reads as one row. Hoyt and TenPoint ship as black badges made for dark grounds
and keep their own colours. The Targeteers tile is exempt and sits on a white
plate, because Rob's logo is never recoloured; an internal `url` in
`business.ts` is what marks a tile as ours.

**These came off the manufacturers' public sites, on the client's instruction
as an authorized dealer, and four needed work to be usable.** Public sites
serve the variant their own header needs, which is rarely the one you want:

| Brand | What was published | What was done |
|---|---|---|
| Mathews | White SVG, for a dark header | Fills swapped to ink |
| Carbon Express | White PNG, 894px | Greys mapped to ink |
| Bowtech | White PNG carrying the retired "Refuse to Follow" line | Slogan cropped off, greys mapped to ink, the red swoosh left alone |
| Easton | A promo lockup with "Made in USA" and a flag under the wordmark | Cropped to the wordmark |
| SITKA | Inline SVG in the page, and it is the animal mark alone, no wordmark | Extracted, `currentColor` set to ink |
| Hoyt, Ravin, TenPoint | Usable as published | Trimmed only |

Worth replacing with dealer-portal files when convenient. The portal versions
are the approved lockups, they come with the usage terms, and they will not be
a header variant that had to be recoloured. The SITKA tile in particular is the
symbol without the wordmark, and the Hoyt mark is an older lockup that came off
the previous site rather than the portal.

---

## Navigation

Five destinations, ALL CAPS, no dropdowns, no panels, no sub-nav:

`PRO SHOP · BOW SERVICE · RANGE & LEAGUES · LESSONS & KIDS · ABOUT`

Everything is in `src/data/nav.ts`. Each destination lists the URL prefixes it
`owns` and the `pages` under it:

| Destination | Pages under it |
|---|---|
| PRO SHOP `/pro-shop/` | Mathews, Hoyt and SITKA brand pages (SEO landers) |
| BOW SERVICE `/services/` | Bow tuning, Hunting setups |
| RANGE & LEAGUES `/range/` | Leagues, Range waiver, Calendar |
| LESSONS & KIDS `/lessons/` | Kids camp, Groups & parties |
| ABOUT `/about/` | Trophy room, Insights, FAQ, Careers |

Four surfaces read that file:

| Surface | Component | Shows up |
|---|---|---|
| The nav pill | `src/components/nav/SiteNav.astro` | Sticky, 16px off the top. Logo on its white plate, five links, open-now pill, orange CALL. The current destination is underlined. |
| The menu | the `<dialog>` inside `SiteNav.astro` | Below 72rem. Solid navy, the five links plus CONTACT, every link visible. |
| The section strip | `src/components/nav/SectionLinks.astro` | Foot of every page under a destination: that destination's pages, the current one marked. This is how pages that left the top nav stay one click from their parent. |
| The footer | `src/components/Footer.astro` | Every page on the site, grouped, plus the visit block (`#hours`). |

Contact lives in the footer, the visit block and the phone action bar
(`src/components/nav/ActionBar.astro`: CALL, DIRECTIONS, HOURS, below 48rem, on
every page). Its HOURS button jumps to `#hours` in the footer; the home page
points it at the hours card (`#today`) instead.

To add a page: put it under the right destination's `pages` (and its prefix in
`owns` if its URL sits outside the destination's path), then add it to
`footerNav`. Every URL that ever existed keeps working; nothing was removed from
`public/_redirects`.

---

## If a page renders blank below the hero

Almost always the dev server, not the site. Scroll reveals start at
`opacity: 0` and are un-hidden by `src/scripts/motion.ts`; if that module fails
to load, everything it was going to reveal stays invisible.

The usual cause is Vite's pre-bundled dependency cache going stale after new
imports are added, while a long-running `astro dev` keeps serving the old URLs.
The console shows `504 (Outdated Optimize Dep)` for lenis, gsap or
gsap/ScrollTrigger. Reloading does not clear it. Restart the dev server:

```bash
rm -rf node_modules/.vite && npm run dev
```

Two guards keep this from ever reaching a visitor. `Base.astro` puts a `.js`
class on `<html>` inline in the head, so the hidden start state only applies
when scripting is available at all; and a 2-second timer adds `.motion-failed`
if `motion.ts` never set `data-motion-ready`, which puts every reveal and every
section arrow back on screen. A missing animation is an acceptable failure. A
blank page is not.

---

## The target mark and the shot arrow

**The target mark.** Every icon the browser shows comes from the client's own
target face at `public/images/cropped-target.png`. Replace that file and run:

```bash
node scripts/make-icons.mjs
```

That rewrites the favicon, the .ico, the Apple touch icon, the 192 and 512 app
icons, a padded maskable icon, and `site.webmanifest`. The same file is
available on the page through `TargetMark.astro`, which is used for the small
filled marks: team avatars, the post mark, the Hours heading. The large
decorative ring backdrops on the footer, contact band, milestones and About
wall stay on `TargetIcon.astro`, which is line art in `currentColor` and sits
inside the panel as faint white line art.

**The shot arrow.** An arrow flies into every section heading on the site, 80
of them across 21 routes. It is one CSS rule, `.shot-head` in `global.css`,
driving a `::before` on the heading itself. To give a new heading an arrow, add
that class. Nothing else.

The site uses the brand arrow, `public/images/shot-arrow-brand-light.svg`:
pale shaft, orange vanes, tan edge, made for navy glass. It always sits on its
own line above the heading, inside the panel. (`shot-arrow.svg`,
`shot-arrow-light.svg` and `shot-arrow-brand.svg` are the earlier cream-site and
light-glass versions, kept for the demos.) All four come from:

```bash
node scripts/make-arrow.mjs
```

`SectionHead` renders the class automatically; pass `arrow={false}` to turn it
off.

The flight fires from `.is-revealed` on the heading or any ancestor, so every
arrow needs a revealing block around it. `scripts/` has no check for this; the
way to verify after adding headings is to load each route, add `is-revealed`
everywhere, and look for a `.shot-head` with no `.is-revealed` ancestor.

Under `prefers-reduced-motion`, and under
the `.motion-failed` failsafe, the arrow is simply there with no flight.

---

## The CMS at `/admin/`

Decap CMS, blog posts only. Lisa writes and publishes there; everything else on
the site stays in code.

**One-time Netlify setup:**

1. Site settings → Identity → **Enable Identity**
2. Identity → Registration → **Invite only**
3. Identity → Services → **Git Gateway → Enable**
4. Identity → **Invite users** → Lisa's email, and Jon's

The editorial workflow is on, so a post goes Draft → In review → Ready and
Netlify builds a deploy preview for each one before it goes live.

Decap is pinned to **3.1.2** in `public/admin/index.html`. That pin is
deliberate. Later builds have shipped regressions in the editorial-workflow UI.
Do not float it to `@latest`.

Images uploaded in the CMS land in `src/assets/insights/` so that `astro:assets`
optimises them like every other photograph on the site.

---

## The hero film (home page)

`public/video/` holds three files, all silent:

| File | Size | Used for |
|---|---|---|
| `hero.mp4` | 2.2 MB | H.264, ≥1024px viewports |
| `hero.webm` | 1.9 MB | VP9, preferred where supported |
| `hero-sm.mp4` | 1.0 MB | 768–1023px viewports |

The film is the home page's backdrop, behind the glass, under the film wash.
The poster (`src/assets/hero/hero-poster.jpg`) is the Largest Contentful Paint.
The video element is only created in the browser (the `film()` function in
`src/pages/index.astro`), and only when the viewport is at least 768px wide, the
visitor has not asked for reduced motion, and the connection is not flagged as
save-data. It crossfades in on `canplay`. Below that, the poster stays, with a
soft-focus copy under the lower cards.

### Swapping the video

Put the new cut at `assets/video/hero.mp4` in the working folder, then:

```bash
ffmpeg -y -i ../assets/video/hero.mp4 -filter_complex "\
[0:v]split=3[a][b][c];\
[a]trim=start=0:end=0.75,setpts=PTS-STARTPTS,format=yuv420p[head];\
[b]trim=start=0.75:end=9.2917,setpts=PTS-STARTPTS,format=yuv420p[mid];\
[c]trim=start=9.2917:end=10.0417,setpts=PTS-STARTPTS,format=yuv420p[tail];\
[tail][head]xfade=transition=fade:duration=0.75:offset=0[blend];\
[blend][mid]concat=n=2:v=1:a=0,format=yuv420p[v]" \
 -map "[v]" -an -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p -movflags +faststart loop.mp4

ffmpeg -y -i loop.mp4 -an -c:v libx264 -preset veryslow -crf 25 -pix_fmt yuv420p -movflags +faststart public/video/hero.mp4
ffmpeg -y -i loop.mp4 -an -vf scale=960:-2 -c:v libx264 -preset veryslow -crf 26 -pix_fmt yuv420p -movflags +faststart public/video/hero-sm.mp4
ffmpeg -y -i loop.mp4 -an -c:v libvpx-vp9 -crf 36 -b:v 0 -row-mt 1 -pix_fmt yuv420p public/video/hero.webm
ffmpeg -y -i loop.mp4 -frames:v 1 -q:v 3 poster.jpg   # then run npm run assets
```

The trim points assume a 10.04s source. Adjust them to `duration - 0.75`.
`-an` is not optional: the hero autoplays, so it must be silent.

---

## Images

Source photographs live in the working folder at `../assets/`, which is **local
only and never committed**. `npm run assets` reads from there and writes
optimised, colour-corrected files into `src/assets/`, which is what the site
imports.

```bash
npm run assets   # logo alpha + photo prep + favicons + OG cards
```

Three things it does that are worth knowing:

- **`scripts/fix-logo.mjs`** — the supplied `logo.png` is a screenshot with the
  transparency checkerboard baked into the pixels. This reconstructs a real
  alpha channel by flood-filling the checker greys. There is no monochrome
  variant: a full-colour lockup cannot be flattened to one colour and stay
  legible, so the real logo always sits on a white plate instead.
- **`scripts/prepare-assets.mjs`** — grey-world white balance on the store and
  range photographs, which were shot under whatever fluorescent tubes were
  overhead. Vintage prints get a 2x lanczos upscale, a warm tone and fine grain.
- **`scripts/make-og.mjs`** — the 1200x630 social cards in `public/og/`. These
  render through system fonts and are committed as finished JPGs, so nothing is
  needed at deploy time.

You only need to re-run `npm run assets` when photographs change. The output is
committed.

---

## Deploying

Netlify, from `main`. `netlify.toml` sets the build command, the publish
directory and Node 20.

`public/_redirects` maps every old WordPress URL, and sends the whole
`/wp-admin`, `/wp-content`, `/xmlrpc.php` surface to a 404 rather than leaving
scanners something to chew on.

### Before the domain moves

- [ ] Formspree IDs in `src/data/business.ts` (six forms: contact, lesson, league, kids, groups, waiver)
- [ ] GA4 measurement ID in `src/data/business.ts` — the tag only emits on a production build once the placeholder is replaced
- [ ] Mailchimp embed action URL in `src/data/business.ts`
- [ ] Netlify Identity + Git Gateway on, Lisa invited
- [ ] Google Search Console verified, `sitemap-index.xml` submitted
- [ ] Google Business Profile updated with showroom and range photos

### Open questions for Rob

These are marked with `<!-- CONFIRM -->` in the source. Search for it.

- Founder's and father's names and years for the remembrance section on `/about/`. Ships as "Est. 1957" until supplied.
- Thursday closing time: the old database said 7 pm, the 2025 live footer said 5 pm.
- Range yardage: the old copy said 27 in one place and 28 in another.
- 2026 lesson pricing.
- Current league schedule, start dates and prices.
- Whether "North Jersey's only authorized Mathews dealer" is still accurate. The site deliberately does not claim it.
- Whether the Trophy Room is open to unaccompanied walk-ins during all store hours.
- The polar bear: year, location, who took it.
- Public email: the old site used the resumes address. `info@` may be preferable.
- Waiver wording. The placeholder on `/waiver/` is plain-language text written for the site; the old `Waiver.pdf` came from the compromised WordPress install and was deliberately not carried over.

---

## QA

```bash
npm run build
npx astro preview --port 4322 &
node scripts/qa-screens.mjs       # every route at 390 and 1440 into qa/
node scripts/a11y.mjs             # axe-core over every route at 375 and 1440
node scripts/contrast.mjs         # ink and tan over the brightest ground of every scene
node scripts/layout-check.mjs     # 6 widths: no sideways scroll, no glass in glass, one orange per screen
node scripts/layout-check.mjs --transparency   # every glass surface solid under reduced transparency
node scripts/kill-list.mjs        # no em dashes or banned phrases in any built page
```

From Git Bash on Windows, prefix each with `MSYS_NO_PATHCONV=1`.
`qa-screens.mjs` takes `--widths=360,1920` and `--only=home,lessons` while
iterating, and `--demos` for the demo routes. The scripts drive the machine's
own Chrome through `puppeteer-core`, so nothing large gets installed.

axe cannot see through `backdrop-filter`, so it skips most text on this site.
`contrast.mjs` is the real check: it lays an empty glass panel (and a pane) over
each scene, takes the brightest 1% of the result, and composites every ink over
it. Lowest result at handover: **4.62:1**.

**Last measured** (2026-11-16, after the glass re-skin): axe zero violations
across 25 routes at 375 and 1440; layout check clean across 25 routes at 360,
390, 768, 1024, 1440 and 1920, with and without reduced transparency; kill list
clean across 48 built files. Lighthouse has not been re-run since the re-skin.

---

## Two things that deviate from the LWS house rules

**Asset paths are root-absolute, not relative.** The house rule exists because
LWS sites move hosts before client approval and root-relative paths break on
every move. Astro's asset pipeline emits hashed, root-absolute URLs
(`/_astro/hero-poster.a1b2c3.webp`) and there is no per-file way around that
without giving up image optimisation and bundling entirely. The supported
mechanism for a move is the `base` option:

```js
// astro.config.mjs — if the site ever has to live in a subdirectory
export default defineConfig({
  site: 'https://example.com',
  base: '/targeteers',
});
```

Set `base`, rebuild, and every internal URL is rewritten. `<link rel="canonical">`
already uses the full absolute HTTPS URL, as the house rule requires.

**The logo is served through `astro:assets`.** It is a real `<img>` element with
the real logo file, never a CSS construction, but the `src` is the hashed
optimised copy rather than a literal `images/logoRGB.png`. That takes the
navigation logo from a 325 KB PNG to a 26 KB WebP. A plain copy is also shipped
at `public/images/logoRGB.png` for anything that needs the raw file, and the
alpha-corrected source is at `src/assets/brand/logoRGB.png`.

---

*Live Web Studios, Est. 2004 · livewebstudios.com*
