# INDIA TOUR logo, v1 (silhouette), archived

> Replaced on the site by the skyline logo in `design/logo/`. This version's exported files
> are in `exports/`; copy them back to `frontend/public/brand/` (and the favicon files to
> `frontend/public/`) to switch back.

Open `brand-sheet.html` in a browser to see the full logo family.

## Concept

**Symbol:** a faceted silhouette of India with two details:

- **The journey:** a winding path cut out of the land, from Delhi to just short of Kanyakumari.
  It suggests a road trip, a river and a route plotted across the country, and it's real
  negative space, not a painted line.
- **The sunrise:** a saffron sun rising in the east from the Bay of Bengal, tucked behind the
  coast. The land partly covers it, so it reads as *rising*. It also marks India as the
  country where the sun first lights up the northeast.

**Colour:** emerald land, saffron sun and the white path quietly echo the tricolour. The navy
wordmark nods to the Ashoka Chakra. There's no literal flag.

**Wordmark:** "INDIA TOUR" set in Outfit Bold (geometric, round O like the sun), letter-spaced
0.12 em, converted to outlines so it never depends on an installed font.

## Files (`exports/`)

| File | Use |
| --- | --- |
| `india-tour-logo.svg` | Primary logo, on white or light backgrounds |
| `india-tour-logo-reversed.svg` | On dark backgrounds or photos (white, with saffron sun) |
| `india-tour-logo-mono.svg` | Single colour (navy): print, stamps, embroidery, fax |
| `india-tour-logo-white.svg` | Single colour (white) on brand colours |
| `india-tour-mark.svg`, `-mono`, `-white` | Symbol on its own |
| `india-tour-app-icon.svg`, `-512.png`, `-192.png` | App icon, social profile picture, PWA |
| `india-tour-app-icon-square.svg` | Full-bleed tile, for platforms that round corners themselves |
| `india-tour-logo-1200.png` | Raster logo for places that can't take SVG |

`favicon.svg`, `favicon-32.png` and `apple-touch-icon.png` for this version are in `exports/` too.

All negative space is transparent geometry, so every file works on any background.

## Colours

| Name | Hex | Role |
| --- | --- | --- |
| Emerald | `#0B6E4F` | Land, "TOUR", app tile |
| Saffron | `#F2A20C` | Sun (accent only; not for text on white) |
| Midnight navy | `#14213D` | "INDIA", single-colour version |

## Usage

- **Clear space:** keep at least the height of the "I" in INDIA free on every side.
- **Minimum size:** the logo should be at least 20 px tall on screen; below that, use the
  symbol or app icon.
- **Don't:** stretch it, recolour individual parts, add effects or outlines, or place the
  colour version on busy photos (use the reversed version).

## The map outline

The silhouette comes from Natural Earth's 10m countries dataset, **India point-of-view**
edition (`ne_10m_admin_0_countries_ind`). It follows India's official boundary, including all
of Jammu & Kashmir and Ladakh. Indian law requires maps of India to show that boundary, so
don't swap it for an outline from a generic world map. Natural Earth data is in the public
domain.

## Editing and rebuilding

The logo is generated, so it can be adjusted precisely. The main settings are at the top of
`build_logo.py`: simplification `TOL`, `SUNRISE` position, `ROUTE` waypoints (real
longitude/latitude), sizes, font and colours.

```bash
cd design/logo
python3 -m venv .venv && .venv/bin/pip install fonttools uharfbuzz shapely
.venv/bin/python build_logo.py exports
```

The PNGs were exported from the SVGs with headless Chrome. Re-export them if you change the
symbol.

Font: Outfit by Rodrigo Fuenzalida, SIL Open Font License (`fonts/OFL.txt`). The license
allows using it in a logo and converting it to outlines.
