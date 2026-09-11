# Dealer logos

The carousel in `src/components/DealerRow.astro` matches a file here to each
brand's `slug` in `src/data/business.ts`. Drop a replacement in under the same
slug and rebuild; the tile picks it up with no code change. SVG is best, a
transparent PNG around 600px wide also works.

| Brand | File | Source |
|---|---|---|
| Targeteers Archery | `targeteers.png` | the shop's own lockup |
| Hoyt | `hoyt.png` | previous site's media |
| Mathews Archery | `mathews.svg` | mathewsinc.com |
| Bowtech | `bowtech.png` | bowtecharchery.com |
| TenPoint | `tenpoint.png` | tenpointcrossbows.com |
| Ravin | `ravin.svg` | ravincrossbows.com |
| SITKA Gear | `sitka.svg` | sitkagear.com |
| Easton | `easton.png` | eastonarchery.com |
| Carbon Express | `carbon-express.png` | feradyne.com |

These were taken from the manufacturers' public sites on the client's
instruction, as an authorized dealer. Four of them needed work first, because a
public site serves whatever variant its own header needs:

- **Mathews** and **Carbon Express** were white, meant for a dark header. Recoloured to ink.
- **Bowtech** was white and carried the retired "Refuse to Follow" line. Slogan cropped, greys recoloured, the red swoosh left alone.
- **Easton** was a promotional lockup with "Made in USA" and a flag beneath the wordmark. Cropped to the wordmark.
- **SITKA** was inline SVG in the page, and it is the animal mark alone with no wordmark.

**Replace these with dealer-portal files when convenient.** Those are the
approved lockups, they come with a usage guide, and they are not a header
variant that had to be recoloured. Two are worth replacing first: the SITKA
tile is the symbol without the wordmark, and the Hoyt mark is an older lockup.

Logos are trademarks. They remain the property of each manufacturer and are
used here on the strength of Targeteers' dealer status.
