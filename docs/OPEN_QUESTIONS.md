# Open questions: home page demos

Branch `demo/home-three`, 2026-11-16. Calls I made while building the three demos, plus what still needs Jon or Rob. Nothing here blocks the review.

## Judgment calls (worth a look on the preview)

1. **One orange per viewport vs. the nav's orange CALL button.** The brief puts an orange CALL in the nav and an orange CALL THE SHOP in the Base Camp hero, which would be two oranges on one screen. Resolution:
   - On desktop, the nav's call button drops to an outline while any in-page orange button (`data-primary`) is on screen, and turns orange again once it scrolls away.
   - Below 48rem the action bar always holds the orange, so in-page primaries render as outlines there.
2. **Trailhead arrow resting place.** The arrow leaves the selected tile pointed at the panel, then levels out and sticks flat in the panel's top-left corner, like a heading arrow. Resting it on the line from tile to panel put it across an unselected tile whenever the open tab was in the top row.
3. **Trailhead greeting** sits on a single frost strip. Navy or white text straight on the bright film failed contrast over the snow and sky.
4. **Trailhead height.** The dashboard itself (greeting, status, tiles, panel, side cards) is about 1.5 screens at 1440×900. With the required visit block, form and footer, the whole page is about 3.4 screens.
5. **Long Shot target.** The target face lives at the end of the fixed rail and grows (2.6× desktop, 1.6× phone) as station 6 arrives. The rail stops short of the screen edge by the grown radius, so the arrow lands dead in the gold at every viewport height. Tick positions are measured from the real station offsets, so the point crosses each ring as that station reaches the top.
6. **Long Shot station 4** (lessons and kids side by side) has a visually hidden H2 and two H3 panels, so the outline stays valid.
7. **No scroll snap in Long Shot.** The brief allowed proximity snap on desktop. Left out because it fights Lenis.
8. **Dealer logos: Hoyt and TenPoint** ship as black badge logos built for dark grounds. A one-colour knockout turns them into solid slabs, so in the demos they keep their own colours. **The live home page's pine band has the same problem today:** both render as grey rectangles. Out of scope here. Worth a dealer-portal file or an exemption on the live site.
9. **Trophy photo.** `trophy/mount-04.jpg`, named in the brief for Base Camp's trophy panel and Long Shot station 5, is a snowy spruce landscape, not mounts. It's used as briefed, with corrected alt text. One of `mount-01` to `mount-03` would sell "Two hundred mounts" better.
10. **Trailhead THIS WEEK** shows an empty state with a calendar link. Every entry in `src/content/events/` is in the past (the latest is Nov 14). The events collection needs winter dates.
11. **Asset paths.** Hand-written public paths in the demos are relative (the LWS badge, the target face). The brand arrow backgrounds in `demo.css` are root-absolute `url('/images/...')`, the same pattern `global.css` already uses: the CSS is inlined into pages at different depths, so a relative `url()` would break. This is the deviation the README already documents for this Astro build.
12. **Footer link labels** are authored in `nav.ts` title case and displayed in caps with CSS.

## Existing-site issues found along the way (not fixed, out of scope)

- **Skip link fails axe's `region` rule on the live routes** once the gate cookie is set. The demos wrap it in a labelled nav and pass. The README's "zero violations" figure predates the gate.
- **The live gate renders its own H1** on every page. With the gate down it is `display: none`, so each demo shows exactly one H1. With the gate up, the gate's H1 is the visible one. The gate was not touched.
- **Post dates on the live `PostCard`** show a day early in any US timezone (UTC date, local format). It's harmless on Netlify's UTC build, but `astro dev` on Jon's machine shows the wrong day. The demos format in UTC.

## Carried from the existing build

- Range distance: 27 or 28 yards.
- 2026 lesson prices.
- Thursday closing time: 7 pm or 5 pm.
- Formspree IDs, GA4 ID and Mailchimp action URL are still placeholders in `business.ts`. The three demo forms post to `formspree.contact` and show the "not connected yet, call us" note until the ID is set.

## Not done this session

- The Impeccable passes (`/polish`, `/colorize`, `/layout`, `/animate`) were not run as skills. Each demo got a manual review at 390 and 1440 with motion on, and the fixes went in (photo overlap, target fit, arrow transforms, card heights, badge logos).
- No Lighthouse run. CLS and LCP were measured with PerformanceObserver on the production build (see `SESSION_SUMMARY.md`).
- The Netlify Deploy Preview needs the PR opened (see `SESSION_SUMMARY.md`).
