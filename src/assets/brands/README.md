# Dealer logos

The carousel in `src/components/DealerRow.astro` looks for a file here named
after each brand's `slug` in `src/data/business.ts`:

| Brand | Expected filename |
|---|---|
| Hoyt | `hoyt.svg` (or `.png` / `.webp`) |
| Mathews Archery | `mathews.svg` |
| Bowtech | `bowtech.svg` |
| TenPoint | `tenpoint.svg` |
| Ravin | `ravin.svg` |
| SITKA Gear | `sitka.svg` |
| Easton | `easton.svg` |
| Carbon Express | `carbon-express.svg` |

Drop a file in and rebuild. That tile switches from the cream wordmark to the
real mark automatically. SVG is best; a PNG with a transparent background at
roughly 600px wide also works.

**Get them from the dealer portal, not from the web.** Every one of these
manufacturers supplies approved logo files to authorized dealers, usually with
a one-page usage guide. Those are the files to use. Do not save logos off the
brands' public sites: they go stale, they are often the wrong lockup, and the
usage terms are in the dealer agreement rather than on the marketing page.

Logos are trademarks. They stay the property of each manufacturer and are used
here on the strength of Targeteers' dealer status.
