"""India silhouette geometry: projection, simplification, fitting into a box."""
import json
import math
from pathlib import Path

HERE = Path(__file__).parent
RAW = json.loads((HERE / "india_mainland.json").read_text())
LAT0 = 22.0  # equirectangular with cos(lat) scaling, good enough for a country this size


def project(points):
    k = math.cos(math.radians(LAT0))
    return [((lon - 68.0) * k, (37.2 - lat)) for lon, lat in points]


def _perp(p, a, b):
    (x, y), (x1, y1), (x2, y2) = p, a, b
    dx, dy = x2 - x1, y2 - y1
    if dx == dy == 0:
        return math.hypot(x - x1, y - y1)
    return abs(dy * x - dx * y + x2 * y1 - y2 * x1) / math.hypot(dx, dy)


def douglas_peucker(pts, tol):
    if len(pts) < 3:
        return pts
    i, dmax = max(((i, _perp(pts[i], pts[0], pts[-1])) for i in range(1, len(pts) - 1)), key=lambda t: t[1])
    if dmax <= tol:
        return [pts[0], pts[-1]]
    return douglas_peucker(pts[: i + 1], tol)[:-1] + douglas_peucker(pts[i:], tol)


def simplified(tol):
    pts = project(RAW)
    if pts[0] == pts[-1]:
        pts = pts[:-1]
    # split the closed ring at the two extreme points so DP keeps them
    top = min(range(len(pts)), key=lambda i: pts[i][1])
    pts = pts[top:] + pts[:top]
    bottom = max(range(len(pts)), key=lambda i: pts[i][1])
    a = douglas_peucker(pts[: bottom + 1], tol)
    b = douglas_peucker(pts[bottom:] + [pts[0]], tol)
    return a[:-1] + b[:-1]


def fit(pts, box, pad=0.0):
    """Scale/translate points to fit (x, y, w, h), centred, uniform scale."""
    bx, by, bw, bh = box
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    w, h = max(xs) - min(xs), max(ys) - min(ys)
    s = min((bw - 2 * pad) / w, (bh - 2 * pad) / h)
    ox = bx + (bw - w * s) / 2 - min(xs) * s
    oy = by + (bh - h * s) / 2 - min(ys) * s
    return [(x * s + ox, y * s + oy) for x, y in pts], (s, ox, oy)


def to_geo(xy, transform):
    """Inverse of fit+project: canvas point -> (lon, lat). Used to place features by real location."""
    s, ox, oy = transform
    k = math.cos(math.radians(LAT0))
    x, y = (xy[0] - ox) / s, (xy[1] - oy) / s
    return x / k + 68.0, 37.2 - y


def from_geo(lon, lat, transform):
    s, ox, oy = transform
    k = math.cos(math.radians(LAT0))
    return ((lon - 68.0) * k * s + ox, (37.2 - lat) * s + oy)


def path_d(pts, prec=2):
    f = lambda v: f"{v:.{prec}f}".rstrip("0").rstrip(".")
    return "M" + " L".join(f"{f(x)} {f(y)}" for x, y in pts) + " Z"
