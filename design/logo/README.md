# INDIA TOUR logo (skyline)

Open `brand-sheet.html` in a browser to see the full logo family. The previous silhouette logo
is archived in `../logo-v1-silhouette/`.

## Concept

Three Delhi and Agra landmarks stand on a flowing line, coloured as a quiet tricolour:

- **Qutub Minar** (saffron): five tapering storeys with projecting balconies and fluting.
- **India Gate** (golden): the triumphal arch with its stepped attic and crowning bowl.
- **Taj Mahal** (emerald): onion dome, chhatris, pointed iwans, plinth and minarets.
- **The route line** (emerald): a tapered sweep beneath them, part landscape and part road,
  suggesting the journey across India's destinations.

**Wordmark:** "INDIA TOUR" in Outfit Bold, widely letter-spaced, centred under the line and
converted to outlines, so it never depends on an installed font.

## Files (`frontend/public/brand/`)

| File | Use |
| --- | --- |
| `india-tour-logo.svg` | **Primary**: skyline above, name below. Print, merchandise, about pages |
| `india-tour-logo-horizontal.svg` | Website header and mobile navigation (the stacked logo is too small to read at header height) |
| `…-reversed.svg` | On navy, dark backgrounds or photos (Taj and line lifted to a lighter emerald for contrast) |
| `…-mono.svg` | Single colour (navy): stamps, embroidery, one-colour print |
| `…-white.svg` | Single colour (white) on brand colours |
| `india-tour-app-icon.svg`, `-512.png`, `-192.png` | App icon and social profile picture (full skyline on white) |
| `india-tour-app-icon-square.svg` | Full-bleed tile for platforms that round corners themselves |
| `india-tour-favicon.svg` | Browser tab icon: the Taj Mahal alone, white on emerald |
| `india-tour-logo-1200.png` | Raster primary logo for places that can't take SVG |

The site serves `favicon.svg`, `favicon-32.png` and `apple-touch-icon.png` from `frontend/public/`.
All gaps (arches, balconies, windows) are transparent geometry, so every file works on any
background.

**Why the favicon is only the Taj Mahal:** at 16–32 px three monuments merge into an
unreadable smudge. The Taj Mahal alone stays recognizable and is the brand's most iconic form.

## Colours

| Name | Hex | Role |
| --- | --- | --- |
| Saffron | `#F07F14` | Qutub Minar |
| Golden orange | `#F2A20C` | India Gate |
| Emerald | `#0B6E4F` | Taj Mahal, route line, favicon tile |
| Light emerald | `#2FB07B` | Emerald on dark backgrounds only |
| Midnight navy | `#14213D` | Wordmark, single-colour version |

## Usage

- **Clear space:** keep at least the height of the "I" in INDIA free on every side.
- **Minimum size:** stacked logo 80 px wide; horizontal logo 20 px tall. Below that, use the
  app icon or favicon.
- **Don't:** stretch it, rearrange the monuments, recolour individual parts, add shadows or
  outlines, or place the colour version on busy photos (use the reversed version).

## Editing and rebuilding

Each monument is a function in `skyline.py` (`qutub_minar`, `india_gate`, `taj_mahal`,
`route_line`) built from simple shapes, so proportions can be tuned precisely. Layout,
colours, font and letter spacing are at the top of `build_skyline.py`.

```bash
cd design/logo
python3 -m venv .venv && .venv/bin/pip install fonttools uharfbuzz shapely
.venv/bin/python build_skyline.py ../../frontend/public/brand
cp ../../frontend/public/brand/india-tour-favicon.svg ../../frontend/public/favicon.svg
```

The PNGs were exported from the SVGs with headless Chrome. Re-export them if you change the art.

Font: Outfit by Rodrigo Fuenzalida, SIL Open Font License (`fonts/OFL.txt`). The license
allows using it in a logo and converting it to outlines.
