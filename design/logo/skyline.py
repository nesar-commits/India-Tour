"""INDIA TOUR skyline logo: Qutub Minar, India Gate and Taj Mahal over a flowing route line.

Every monument is built from geometric primitives with shapely, so silhouettes are crisp,
symmetric and real vector shapes (negative space included).
Coordinates: x right, y down; the monuments stand on y = GROUND.
"""
import math

from shapely import affinity
from shapely.geometry import Point, Polygon, box
from shapely.ops import unary_union

GROUND = 200.0


def sample_cubic(p0, c1, c2, p1, n=24):
    pts = []
    for i in range(n + 1):
        t = i / n
        m = 1 - t
        pts.append((m**3 * p0[0] + 3 * m * m * t * c1[0] + 3 * m * t * t * c2[0] + t**3 * p1[0],
                    m**3 * p0[1] + 3 * m * m * t * c1[1] + 3 * m * t * t * c2[1] + t**3 * p1[1]))
    return pts


def pointed_arch(cx, bottom, width, height, rise=0.62):
    """Mughal pointed (two-centred) arch opening: straight jambs, then two arcs meeting at an apex."""
    half = width / 2
    spring = bottom - height * rise  # where the curve starts
    apex = bottom - height
    left = sample_cubic((cx - half, spring), (cx - half, spring - (spring - apex) * 0.55),
                        (cx - half * 0.35, apex + (spring - apex) * 0.15), (cx, apex), 16)
    right = [(2 * cx - x, y) for x, y in reversed(left)]
    return Polygon([(cx - half, bottom), *left, *right[1:], (cx + half, bottom)])


def round_arch(cx, bottom, width, height):
    half = width / 2
    spring = bottom - (height - half)
    return unary_union([box(cx - half, spring, cx + half, bottom), Point(cx, spring).buffer(half, quad_segs=24)])


def onion_dome(cx, base, width, height, bulge=1.3, finial=0.0):
    """Mughal onion dome: swells past its base, then sweeps in to a point."""
    half = width / 2
    apex = base - height
    left = (
        sample_cubic((cx - half, base), (cx - half * bulge * 1.05, base - height * 0.18),
                     (cx - half * bulge, base - height * 0.62), (cx - half * 0.48, base - height * 0.82), 20)
        + sample_cubic((cx - half * 0.48, base - height * 0.82), (cx - half * 0.14, base - height * 0.90),
                       (cx - half * 0.04, base - height * 0.96), (cx, apex), 10)[1:]
    )
    right = [(2 * cx - x, y) for x, y in reversed(left)]
    dome = Polygon(left + right[1:])
    parts = [dome]
    if finial:
        parts.append(box(cx - 0.55, apex - finial, cx + 0.55, apex + 1))
        parts.append(Point(cx, apex - finial * 0.45).buffer(1.25, quad_segs=12))
    return unary_union(parts)


# ---------------------------------------------------------------- monuments

def qutub_minar(cx=86.0):
    """Five tapering storeys separated by projecting balconies, topped by a small cupola."""
    top_y, base_w, top_w = 34.0, 24.0, 11.0
    h = GROUND - top_y
    w_at = lambda y: top_w + (base_w - top_w) * (y - top_y) / h
    shaft = Polygon([(cx - base_w / 2, GROUND), (cx - top_w / 2, top_y), (cx + top_w / 2, top_y), (cx + base_w / 2, GROUND)])
    parts, cuts = [shaft], []
    # storey heights shrink upward like the real tower
    levels = [GROUND - h * f for f in (0.36, 0.60, 0.78, 0.92)]
    for y in levels:
        w = w_at(y) + 5.0
        parts.append(box(cx - w / 2, y - 3.2, cx + w / 2, y))  # balcony
        cw = w_at(y + 2.6)
        cuts.append(box(cx - cw / 2 - 0.1, y, cx + cw / 2 + 0.1, y + 1.1))  # shadow line under balcony
    # cupola, drum and finial
    parts.append(box(cx - 4.2, top_y - 5, cx + 4.2, top_y))
    parts.append(Point(cx, top_y - 5).buffer(4.2, quad_segs=16).intersection(box(cx - 5, top_y - 10, cx + 5, top_y - 5)))
    parts.append(box(cx - 0.6, top_y - 15, cx + 0.6, top_y - 8))
    # gentle flute lines on the lowest storey
    for dx in (-4.2, 4.2):
        cuts.append(box(cx + dx - 0.55, levels[0] + 5, cx + dx + 0.55, GROUND - 6))
    return unary_union(parts).difference(unary_union(cuts))


def india_gate(cx=152.0):
    """Triumphal arch: a block with a tall round-arched opening, cornice, stepped attic and bowl."""
    base_top, w = 112.0, 64.0
    body = box(cx - w / 2, base_top, cx + w / 2, GROUND)
    parts = [
        body,
        box(cx - w / 2 - 3.5, base_top - 5.5, cx + w / 2 + 3.5, base_top),  # cornice
        box(cx - 23, base_top - 18, cx + 23, base_top - 5.5),  # attic
        box(cx - 16, base_top - 26, cx + 16, base_top - 18),  # upper attic
    ]
    bowl_base = base_top - 26
    parts.append(Point(cx, bowl_base).buffer(9, quad_segs=24).intersection(box(cx - 10, bowl_base - 10, cx + 10, bowl_base)))
    parts.append(box(cx - 10, bowl_base - 1.2, cx + 10, bowl_base))
    gate = unary_union(parts)
    cuts = [
        round_arch(cx, GROUND, 24, 62),  # main arch
        box(cx - 20, base_top - 13, cx + 20, base_top - 11.6),  # inscription band on the attic
    ]
    return gate.difference(unary_union(cuts))


def taj_mahal(cx=264.0):
    """Plinth, iwan facade with pointed arches, drum, onion dome, chhatris and two minarets."""
    plinth_top = GROUND - 7
    hall_top = plinth_top - 46
    parts = [box(cx - 62, plinth_top, cx + 62, GROUND)]
    hall = box(cx - 36, hall_top, cx + 36, plinth_top)
    # chamfer the hall's top corners slightly
    hall = hall.difference(Polygon([(cx - 36, hall_top), (cx - 30, hall_top), (cx - 36, hall_top + 6)]))
    hall = hall.difference(Polygon([(cx + 36, hall_top), (cx + 30, hall_top), (cx + 36, hall_top + 6)]))
    parts.append(hall)
    parts.append(box(cx - 13, hall_top - 6, cx + 13, hall_top + 1))  # pishtaq frame rising above the roof
    drum_top = hall_top - 12
    parts.append(box(cx - 15, drum_top, cx + 15, hall_top - 5))  # drum
    parts.append(onion_dome(cx, drum_top + 1, 30, 44, finial=11))
    for side in (-1, 1):  # chhatris on the roof corners
        x = cx + side * 26
        parts.append(box(x - 5, hall_top - 7, x + 5, hall_top + 1))
        parts.append(onion_dome(x, hall_top - 6.5, 10, 11, finial=4))
    for side in (-1, 1):  # minarets at the plinth ends
        x = cx + side * 54
        top = plinth_top - 70
        parts.append(Polygon([(x - 3.6, plinth_top), (x - 2.8, top), (x + 2.8, top), (x + 3.6, plinth_top)]))
        for f in (0.33, 0.66):
            y = plinth_top - 70 * f
            parts.append(box(x - 4.4, y - 2, x + 4.4, y))
        parts.append(box(x - 4.6, top - 2, x + 4.6, top))
        parts.append(onion_dome(x, top - 1.5, 8, 9, finial=3.5))
    taj = unary_union(parts)
    cuts = [pointed_arch(cx, plinth_top, 15, 34)]  # great iwan
    for side in (-1, 1):
        for dx in (21, 30):  # smaller stacked side arches
            cuts.append(pointed_arch(cx + side * dx, plinth_top - 3, 6, 15))
            cuts.append(pointed_arch(cx + side * dx, plinth_top - 24, 6, 14))
    cuts.append(box(cx - 60, plinth_top + 2.2, cx + 60, plinth_top + 3.4))  # plinth line
    return taj.difference(unary_union(cuts))


def route_line(x0=52.0, x1=344.0, y=215.0, amp=6.5, thick=6.2):
    """A flowing, tapered landscape line: thick in the middle, fine at both ends."""
    n = 120
    top, bot = [], []
    for i in range(n + 1):
        u = i / n
        x = x0 + (x1 - x0) * u
        cy = y - amp * math.sin(math.pi * u) + 2.2 * math.sin(2 * math.pi * u)  # gentle rise, slight S
        t = thick * math.sin(math.pi * u) ** 0.8 / 2
        top.append((x, cy - t))
        bot.append((x, cy + t))
    return Polygon(top + list(reversed(bot))).buffer(0)


def skyline():
    return {"qutub": qutub_minar(), "gate": india_gate(), "taj": taj_mahal(), "route": route_line()}


def d_of(geom, prec=2):
    f = lambda v: f"{round(v, prec):g}"
    out = []
    for poly in getattr(geom, "geoms", [geom]):
        for ring in [poly.exterior, *poly.interiors]:
            c = list(ring.coords)[:-1]
            out.append("M" + " ".join(f"{f(x)} {f(y)}" for x, y in c) + "Z")
    return "".join(out)


def moved(geom, s, dx, dy):
    return affinity.translate(affinity.scale(geom, s, s, origin=(0, 0)), dx, dy)
