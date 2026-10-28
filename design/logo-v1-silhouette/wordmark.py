"""Outlined wordmark: shapes text with HarfBuzz (kerning) and converts glyphs to SVG paths."""
from pathlib import Path

import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

FONTS = Path(__file__).parent / "fonts"


def outline(text, font_file, wght, cap_height, tracking_em=0.1, x0=0.0, baseline=0.0):
    """Return (list of path d strings per word-run, total width) with caps `cap_height` tall."""
    path = FONTS / font_file
    tt = TTFont(path)
    upem = tt["head"].unitsPerEm
    cap = tt["OS/2"].sCapHeight or 0.7 * upem
    scale = cap_height / cap

    blob = hb.Blob.from_file_path(str(path))
    face = hb.Face(blob)
    font = hb.Font(face)
    if "fvar" in tt:
        font.set_variations({"wght": wght})
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(font, buf, {"kern": True, "liga": False})

    location = {"wght": wght} if "fvar" in tt else None
    glyph_set = tt.getGlyphSet(location=location)
    order = tt.getGlyphOrder()
    tracking = tracking_em * upem

    x = 0.0
    ds = []
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        name = order[info.codepoint]
        pen = SVGPathPen(glyph_set)
        # font units are y-up: flip, scale, and place on the baseline
        tpen = TransformPen(pen, (scale, 0, 0, -scale, x0 + (x + pos.x_offset) * scale, baseline - pos.y_offset * scale))
        glyph_set[name].draw(tpen)
        d = pen.getCommands()
        if d:
            ds.append(d)
        x += pos.x_advance + tracking
    width = (x - tracking) * scale  # no trailing tracking after the last letter
    return ds, width


def word_runs(text, font_file, wght, cap_height, tracking_em, x0, baseline, colors):
    """Each space-separated word in its own colour. Returns (svg <path> elements, end x)."""
    words = text.split(" ")
    space = outline("I I", font_file, wght, cap_height, tracking_em)[1] - 2 * outline("I", font_file, wght, cap_height, tracking_em)[1]
    out, x = [], x0
    for word, color in zip(words, colors):
        ds, w = outline(word, font_file, wght, cap_height, tracking_em, x, baseline)
        out.append(f'<path fill="{color}" d="{" ".join(ds)}"/>')
        x += w + space
    return "".join(out), x - space
