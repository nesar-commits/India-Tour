"""Builds the INDIA TOUR logo family as clean, font-free SVG.

Symbol: India's silhouette (Natural Earth, India point-of-view boundary, simplified to clean
facets) with a winding journey path from Delhi to the southern tip cut out of it, and a saffron
sun rising in the east from the Bay of Bengal. Negative space is real geometry (shapely
booleans), so every file works on any background and in a single colour.

Usage: python build_logo.py <out_dir>
"""
import sys
from pathlib import Path

from shapely.geometry import LineString, Point, Polygon
from shapely.ops import unary_union

from geo import fit, from_geo, simplified
from wordmark import word_runs

EMERALD, SAFFRON, NAVY, WHITE = "#0B6E4F", "#F2A20C", "#14213D", "#FFFFFF"

TOL = 0.38
SUNRISE = (87.9, 16.2)  # lon, lat: northern Bay of Bengal, east of the coast
ROUTE = [(77.21, 28.61), (75.0, 24.6), (79.6, 19.4), (76.4, 13.2), (77.35, 9.7)]  # Delhi -> near Kanyakumari
ROUTE_W, SUN_R, SUN_GAP = 3.4, 13.5, 2.4

FONT, WEIGHT, TRACKING = "Outfit.ttf", 700, 0.12


# ---------------------------------------------------------------- geometry

def bezier_points(d_points, steps=24):
    """Sample the same Catmull-Rom curve mark.py draws, as a polyline."""
    pts = []
    for i in range(len(d_points) - 1):
        p0 = d_points[i - 1] if i > 0 else d_points[i]
        p1, p2 = d_points[i], d_points[i + 1]
        p3 = d_points[i + 2] if i + 2 < len(d_points) else p2
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        for s in range(steps):
            t = s / steps
            mt = 1 - t
            pts.append((
                mt**3 * p1[0] + 3 * mt**2 * t * c1[0] + 3 * mt * t**2 * c2[0] + t**3 * p2[0],
                mt**3 * p1[1] + 3 * mt**2 * t * c1[1] + 3 * mt * t**2 * c2[1] + t**3 * p2[1],
            ))
    pts.append(d_points[-1])
    return pts


def symbol_shapes():
    """(india, sun) shapely geometries in a 100x100 design box."""
    pts, tr = fit(simplified(TOL), (0, 0, 100, 100), pad=5)
    india = Polygon(pts).buffer(0)
    route = LineString(bezier_points([from_geo(*p, tr) for p in ROUTE])).buffer(ROUTE_W / 2, quad_segs=16)
    india = india.difference(route)
    sx, sy = from_geo(*SUNRISE, tr)
    sun = Point(sx, sy).buffer(SUN_R, quad_segs=32).difference(Polygon(pts).buffer(SUN_GAP, quad_segs=16))
    return india, sun


def d_of(geom, prec=2):
    """Shapely (Multi)Polygon -> SVG path data, holes included (use fill-rule evenodd)."""
    f = lambda v: f"{round(v, prec):g}"
    polys = getattr(geom, "geoms", [geom])
    out = []
    for poly in polys:
        for ring in [poly.exterior, *poly.interiors]:
            c = list(ring.coords)[:-1]
            out.append("M" + " ".join(f"{f(x)} {f(y)}" for x, y in c) + "Z")
    return "".join(out)


def transformed(geom, s, dx, dy):
    from shapely import affinity
    return affinity.translate(affinity.scale(geom, s, s, origin=(0, 0)), dx, dy)


# ---------------------------------------------------------------- files

def svg(view_w, view_h, body, title):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {view_w:g} {view_h:g}" role="img" '
            f'aria-labelledby="t"><title id="t">{title}</title>{body}</svg>\n')


def symbol_body(india, sun, india_fill, sun_fill):
    return (f'<path fill="{sun_fill}" fill-rule="evenodd" d="{d_of(sun)}"/>'
            f'<path fill="{india_fill}" fill-rule="evenodd" d="{d_of(india)}"/>')


def main(out):
    out = Path(out)
    out.mkdir(parents=True, exist_ok=True)
    india, sun = symbol_shapes()
    minx, miny, maxx, maxy = unary_union([india, sun]).bounds

    # Mark: square canvas, content centred with a small safe margin.
    side = max(maxx - minx, maxy - miny)
    m = side * 0.06
    s = 100 / (side + 2 * m)
    dx = (100 - (maxx - minx) * s) / 2 - minx * s
    dy = (100 - (maxy - miny) * s) / 2 - miny * s
    mi, ms = transformed(india, s, dx, dy), transformed(sun, s, dx, dy)
    marks = {
        "india-tour-mark.svg": (EMERALD, SAFFRON),
        "india-tour-mark-mono.svg": (NAVY, NAVY),
        "india-tour-mark-white.svg": (WHITE, WHITE),
    }
    for name, (fi, fs) in marks.items():
        (out / name).write_text(svg(100, 100, symbol_body(mi, ms, fi, fs), "India Tour"))

    # App icon / favicon: white symbol on an emerald tile; cut-outs reveal the tile.
    t = 0.72 * 100 / side
    tdx = (100 - (maxx - minx) * t) / 2 - minx * t
    tdy = (100 - (maxy - miny) * t) / 2 - miny * t
    ti, ts = transformed(india, t, tdx, tdy), transformed(sun, t, tdx, tdy)
    tile = f'<rect width="100" height="100" rx="22" fill="{EMERALD}"/>' + symbol_body(ti, ts, WHITE, SAFFRON)
    (out / "india-tour-app-icon.svg").write_text(svg(100, 100, tile, "India Tour"))
    square = f'<rect width="100" height="100" fill="{EMERALD}"/>' + symbol_body(ti, ts, WHITE, SAFFRON)
    (out / "india-tour-app-icon-square.svg").write_text(svg(100, 100, square, "India Tour"))

    # Horizontal lockup: symbol 100 tall, caps 40% of that, centred on the symbol.
    H = 100.0
    ls = H / (maxy - miny)
    li, lsun = transformed(india, ls, -minx * ls, -miny * ls), transformed(sun, ls, -minx * ls, -miny * ls)
    sym_w = (maxx - minx) * ls
    cap = 0.37 * H
    x0 = sym_w + 0.62 * cap
    baseline = H / 2 + cap / 2
    lockups = {
        "india-tour-logo.svg": (EMERALD, SAFFRON, [NAVY, EMERALD]),
        "india-tour-logo-mono.svg": (NAVY, NAVY, [NAVY, NAVY]),
        "india-tour-logo-reversed.svg": (WHITE, SAFFRON, [WHITE, WHITE]),
        "india-tour-logo-white.svg": (WHITE, WHITE, [WHITE, WHITE]),
    }
    for name, (fi, fs, words) in lockups.items():
        text, end = word_runs("INDIA TOUR", FONT, WEIGHT, cap, TRACKING, x0, baseline, words)
        body = symbol_body(li, lsun, fi, fs) + text
        (out / name).write_text(svg(round(end + 1, 1), H, body, "INDIA TOUR"))

    for f in sorted(out.glob("*.svg")):
        print(f"{f.name:<34} {f.stat().st_size:>6} bytes")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "out")
