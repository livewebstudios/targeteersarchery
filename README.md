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

## Day-to-day: what lives where

| You want to change… | Edit this |
|---|---|
| Phone, address, email, hours, socials, Formspree IDs, GA4 ID, Mailchimp URL | `src/data/business.ts` |
| Nav groups, dropdown panels, sub-nav links, footer columns | `src/data/nav.ts` |
| Colours, type scale, spacing, motion timing, arrow colours | `src/styles/tokens.css` |
| Dealer carousel tiles, including the shop's own | `brands` in `src/data/business.ts` |
| Favicon and app icons | `public/images/cropped-target.png`, then `node scripts/make-icons.mjs` |
| Blog posts | `src/content/insights/` — or `/admin/`, see below |
| Calendar highlights | `src/content/events/` |
| League seasons | `src/content/leagues/` |
| FAQ entries | `src/content/faq/` |
| Staff cards on the About page | `src/content/team/` |
| Mathews / Hoyt / SITKA landing-page copy | `src/content/brands/` |
| The "Since 1957" milestone band | `milestones` in `src/pages/index.astro` |
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

**It currently shows cream wordmarks, not logos.** Manufacturer logo files were
not in the material handed over, and hotlinking them from the brands' own sites
is off the table. The component already looks for a real logo per brand:

```
src/assets/brands/hoyt.svg
src/assets/brands/mathews.svg
src/assets/brands/bowtech.svg
src/assets/brands/tenpoint.svg
src/assets/brands/ravin.svg
src/assets/brands/sitka.svg
src/assets/brands/easton.svg
src/assets/brands/carbon-express.svg
```

Drop those files in, rebuild, and each tile switches from the wordmark to the
real mark. No code change. The filename has to match the brand's `slug` in
`src/data/business.ts`. On the dark bands, logos are knocked back to cream so
the row still reads as one row.

Get the files from each manufacturer's dealer portal rather than off their
public site: the portal versions are the approved lockups and come with the
usage terms.

Two logos did survive in the old site's media, if you want them wired sooner:
Hoyt (clean, with transparency) and Bowtech (low resolution, and carrying an
old tagline). Both are in the working folder at
`assets/extracted-media/uploads/2020/11/`.

---

## Navigation

Everything is defined in `src/data/nav.ts`. The site has six top-level groups
plus a plain Contact link:

`PRO SHOP · SERVICES · LESSONS & KIDS · RANGE & LEAGUES · ABOUT · CONTACT`

Each group carries one or two columns of links (label, href, one-line blurb)
and an optional dark feature tile. Labels render ALL CAPS everywhere. To add a
page to the nav, add it to the right group's `columns` and, if its URL sits
outside the group's own path, add that path to the group's `extra` array so the
sub-nav knows the page belongs there.

Three surfaces read that one file:

| Surface | Component | Shows up |
|---|---|---|
| Mega dropdown panels | `src/components/nav/Nav.astro` | 72rem and up. Hover opens, click keeps open, Escape closes |
| Sticky sub-nav strip | `src/components/nav/SubNav.astro` | Below 104rem, inside the sticky header, scrolls sideways on a phone and centres the page you are on |
| Fixed vertical sub-nav rail | `src/components/nav/SubRail.astro` | 104rem and up, in the right margin, fades in once the hero is past |
| Overlay menu | `src/components/nav/MobileMenu.astro` | Below 72rem. Every group expanded, no accordions |

The rail is rendered from `Base.astro` rather than from inside the header,
because the header carries a `backdrop-filter` and that would make it the
containing block for a fixed child. Pages inside a group get `has-subnav` on
`<body>`, which pulls `--wrap-wide` in at 104rem so no wide band ever runs
underneath the rail.

Anchor links in the panels (`/pro-shop/#carry`, `/services/#strings`,
`/lessons/#book`) point at `id`s on the relevant `<Section>`. If you rename a
section id, fix the nav entry too.

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
inside the cream palette rather than fighting it.

**The shot arrow.** An arrow flies into every section heading on the site, 80
of them across 21 routes. It is one CSS rule, `.shot-head` in `global.css`,
driving a `::before` on the heading itself. To give a new heading an arrow, add
that class. Nothing else.

The arrow art is two static SVGs in `public/images/`, generated by:

```bash
node scripts/make-arrow.mjs
```

Two files because a `background-image` cannot read CSS custom properties, and
the shaft has to change: carbon on cream, pale anodised on the dark bands and
on the photo panels. `SectionHead` renders the class automatically; pass
`arrow={false}` to turn it off.

Two placements:

| Where | Placement |
|---|---|
| `SectionHead` at 90rem and up | Out in the page margin, point resting just short of the first word |
| Everything else, and all widths under 90rem | Its own line above the heading, whole arrow visible |

That split matters. A heading inside a two-column block or a half-width panel
has no page margin to fly through, so the margin placement would put the arrow
on top of the neighbouring photograph or clip it to a stub. Only headings that
sit at the edge of the content column get it. A heading that does sit there but
is not a `SectionHead` can opt in with `.shot-head--margin`.

The flight fires from `.is-revealed` on the heading or any ancestor, so every
arrow needs a revealing block around it. `scripts/` has no check for this; the
way to verify after adding headings is to load each route, add `is-revealed`
everywhere, and look for a `.shot-head` with no `.is-revealed` ancestor.

Colours are the `--arrow-*` tokens. Under `prefers-reduced-motion`, and under
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

## The hero film

`public/video/` holds three files, all silent:

| File | Size | Used for |
|---|---|---|
| `hero.mp4` | 2.2 MB | H.264, ≥1024px viewports |
| `hero.webm` | 1.9 MB | VP9, preferred where supported |
| `hero-sm.mp4` | 1.0 MB | 768–1023px viewports |

The poster (`src/assets/hero/hero-poster.jpg`) is the Largest Contentful Paint.
The video element is only created in the browser, and only when the viewport is
at least 768px wide, the visitor has not asked for reduced motion, and the
connection is not flagged as save-data. It crossfades in on `canplay`. Below
that, the poster runs a 45-second Ken Burns drift instead.

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
  legible, so dark sections put the real logo on a cream plate instead.
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
npm run qa                 # screenshots at 375 / 768 / 1280 / 1920 into qa/
node scripts/a11y.mjs      # axe-core over every route at two widths
```

Both scripts drive the Mac's own Chrome through `puppeteer-core`, so nothing
large gets installed into the project.

**Last measured** (Lighthouse 12, `astro preview`):

| | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| `/` desktop | 100 | 100 | 100 | 100 |
| `/` mobile | 96 | 100 | 100 | 100 |
| `/about/` mobile | 91 | 100 | 100 | 100 |
| `/range/` mobile | 97 | 100 | 100 | 100 |

axe-core: zero violations across 25 routes at 375px and 1440px.

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
