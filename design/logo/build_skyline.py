"""Builds the INDIA TOUR skyline logo family as clean, font-free SVG.

Usage: python build_skyline.py <out_dir>
"""
import sys
from pathlib import Path

from shapely.ops import unary_union

from skyline import d_of, moved, skyline, taj_mahal
from wordmark import outline, word_runs

SAFFRON, GOLD, EMERALD = "#F07F14", "#F2A20C", "#0B6E4F"
EMERALD_LIGHT = "#2FB07B"  # emerald lifted for dark backgrounds
NAVY, WHITE = "#14213D", "#FFFFFF"
FONT, WEIGHT, TRACKING = "Outfit.ttf", 700, 0.24

PALETTES = {
    "color": dict(qutub=SAFFRON, gate=GOLD, taj=EMERALD, route=EMERALD, text=NAVY),
    "reversed": dict(qutub=SAFFRON, gate=GOLD, taj=EMERALD_LIGHT, route=EMERALD_LIGHT, text=WHITE),
    "mono": dict(qutub=NAVY, gate=NAVY, taj=NAVY, route=NAVY, text=NAVY),
    "white": dict(qutub=WHITE, gate=WHITE, taj=WHITE, route=WHITE, text=WHITE),
}


def svg(w, h, body, title="INDIA TOUR"):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:g} {h:g}" role="img" '
            f'aria-labelledby="t"><title id="t">{title}</title>{body}</svg>\n')


def art_paths(shapes, pal):
    return "".join(f'<path fill="{pal[k]}" fill-rule="evenodd" d="{d_of(shapes[k])}"/>'
                   for k in ("route", "qutub", "gate", "taj"))


def text_width(cap, tracking=TRACKING):
    return outline("INDIA TOUR", FONT, WEIGHT, cap, tracking)[1]


def main(out):
    out = Path(out)
    out.mkdir(parents=True, exist_ok=True)
    raw = skyline()
    minx, miny, maxx, maxy = unary_union(list(raw.values())).bounds
    art_w, art_h = maxx - minx, maxy - miny

    # ---- Stacked primary: art on top, text centred below, sized to ~80% of the art width.
    W = 400.0
    s = (W * 0.86) / art_w
    margin_x = (W - art_w * s) / 2
    art = {k: moved(g, s, margin_x - minx * s, 12 - miny * s) for k, g in raw.items()}
    art_bottom = 12 + art_h * s
    cap = 1.0
    cap = (art_w * s * 0.80) / text_width(cap)  # text width scales linearly with cap height
    baseline = art_bottom + cap * 0.95 + cap
    H = baseline + 12
    for name, pal in PALETTES.items():
        x0 = (W - text_width(cap)) / 2
        text, _ = word_runs("INDIA TOUR", FONT, WEIGHT, cap, TRACKING, x0, baseline, [pal["text"]] * 2)
        suffix = "" if name == "color" else f"-{name}"
        (out / f"india-tour-logo{suffix}.svg").write_text(svg(W, round(H, 1), art_paths(art, pal) + text))

    # ---- Horizontal (website header / mobile nav): art left, text right, vertically centred.
    Hh = 100.0
    hs = Hh / art_h
    hart = {k: moved(g, hs, -minx * hs, -miny * hs) for k, g in raw.items()}
    hcap = Hh * 0.27
    hx0 = art_w * hs + hcap * 0.75
    hbase = Hh * 0.60 + hcap / 2  # optical centre sits a little low, on the monuments' mass
    for name in ("color", "reversed", "mono", "white"):
        pal = PALETTES[name]
        text, end = word_runs("INDIA TOUR", FONT, WEIGHT, hcap, 0.16, hx0, hbase, [pal["text"]] * 2)
        suffix = "" if name == "color" else f"-{name}"
        (out / f"india-tour-logo-horizontal{suffix}.svg").write_text(svg(round(end + 1, 1), Hh, art_paths(hart, pal) + text))

    # ---- App icon / social avatar: the full skyline on a white rounded tile.
    t = 74 / art_w
    tart = {k: moved(g, t, 50 - (minx + art_w / 2) * t, 50 - (miny + art_h / 2) * t) for k, g in raw.items()}
    tile = '<rect width="100" height="100" rx="22" fill="#FFFFFF"/>' + art_paths(tart, PALETTES["color"])
    (out / "india-tour-app-icon.svg").write_text(svg(100, 100, tile, "India Tour"))
    square = '<rect width="100" height="100" fill="#FFFFFF"/>' + art_paths(tart, PALETTES["color"])
    (out / "india-tour-app-icon-square.svg").write_text(svg(100, 100, square, "India Tour"))

    # ---- Favicon: the Taj Mahal alone, white on emerald (three monuments blur at 16 px).
    taj = taj_mahal()
    tx0, ty0, tx1, ty1 = taj.bounds
    fs = 72 / max(tx1 - tx0, ty1 - ty0)
    ftaj = moved(taj, fs, 50 - (tx0 + tx1) / 2 * fs, 52 - (ty0 + ty1) / 2 * fs)
    fav = f'<rect width="100" height="100" rx="22" fill="{EMERALD}"/><path fill="#FFFFFF" fill-rule="evenodd" d="{d_of(ftaj)}"/>'
    (out / "india-tour-favicon.svg").write_text(svg(100, 100, fav, "India Tour"))

    for f in sorted(out.glob("*.svg")):
        print(f"{f.name:<44} {f.stat().st_size:>6} bytes")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "out2")
