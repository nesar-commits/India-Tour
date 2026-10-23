"""Build the per-state background slideshow images and the state-to-image mapping.

Source of truth is the backend's place list (backend/app/data/states.json, read only): every
slide is a photo of one of *that state's own* places, so a state can never pick up another
state's images. Each place's existing Commons photo is used when it is wide and large enough
for a full-width background; OVERRIDES swap in a wider Commons photo of the same place.

Outputs:
  public/images/states/<state-id>/<place-slug>-<width>.webp
  src/data/stateSlides.json   (the centralized mapping, with credits)

Requires `cwebp` (brew install webp). Run from frontend/:
    python3 scripts/fetch_state_images.py                 # all states
    python3 scripts/fetch_state_images.py --only goa      # rebuild one state, keep the rest
"""

import html
import sys
import json
import re
import shutil
import subprocess
import tempfile
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PLACES_FILE = ROOT.parent / "backend" / "app" / "data" / "states.json"
OUT_DIR = ROOT / "public" / "images" / "states"
MAPPING_FILE = ROOT / "src" / "data" / "stateSlides.json"
API = "https://commons.wikimedia.org/w/api.php"
USER_AGENT = "IndiaTourApp/1.0 (local educational project) python-urllib"
WIDTHS = [960, 1600]
QUALITY = 72
MIN_WIDTH = 1200  # smaller photos look soft as a full-width background
MIN_ASPECT = 1.3  # portrait and square photos crop badly in a wide hero

# (state id, place name) -> wider Commons photo of the same place.
OVERRIDES = {
    ("goa", "Fort Aguada"): "Goa Aguada Fort, Goa.jpg",
    ("karnataka", "Jog Falls"): "PXL 20260104 110429494.MP Jog Falls, Karnataka 577435 05.jpg",
    ("karnataka", "Gokarna"): "PXL 20260103 054657562.MP Paradise beach gokarna Paradise Beach Trail, Gokarna, Karnataka 581326 15.jpg",
    ("kerala", "Alleppey Backwaters"): "Nedumudy - Houseboat.jpg",
    ("maharashtra", "Gateway of India"): "Gateway Of India.jpg",
    ("gujarat", "Statue of Unity"): "Statue of Unity 2.jpg",
    ("gujarat", "Somnath Temple"): "Somnath temple Gujarat India.jpg",
    ("meghalaya", "Cherrapunji (Sohra)"): "Nohkalikai falls,shillong,meghalaya.jpeg",
    # Dzukou straddles the border; Manipur keeps the border photo, Nagaland gets one from Viswema.
    ("nagaland", "Dzukou Valley"): "Dzükou Valley, Viswema, Nagaland 12.jpg",
    ("mizoram", "Vantawng Falls"): "Vantawng waterfall, Mizoram,India.JPG",
    ("delhi", "India Gate"): "India Gate - Delhi (37282946605).jpg",
    ("delhi", "Lotus Temple"): "Lotus Temple in New Delhi 03-2016.jpg",
    ("telangana", "Charminar"): "Charminar in April 2024 p1.jpg",
    ("rajasthan", "Amber Fort"): "Jaipur 03-2016 05 Amber Fort.jpg",
    ("sikkim", "Yumthang Valley"): "Yumthang Valley at North Sikkim, India 36.jpg",
}


def fetch(url, retries=6):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=60) as res:
                return res.read()
        except Exception as e:
            if attempt == retries - 1:
                raise
            wait = 5 * 2 ** attempt
            print(f"  {e}; retrying in {wait}s")
            time.sleep(wait)


def slugify(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower().replace("&", "and")).strip("-")


def commons_title(place):
    return urllib.parse.unquote(place["image"]["file_page"].split("/wiki/File:")[1]).replace("_", " ")


def file_infos(titles):
    """Size, thumbnail URL and credit for many Commons files (50 per request)."""
    infos = {}
    titles = sorted(set(titles))
    for i in range(0, len(titles), 50):
        params = dict(action="query", format="json", formatversion="2",
                      titles="|".join(f"File:{t}" for t in titles[i:i + 50]), prop="imageinfo",
                      iiprop="url|size|extmetadata", iiurlwidth=max(WIDTHS),
                      iiextmetadatafilter="Artist|LicenseShortName|LicenseUrl")
        data = json.loads(fetch(f"{API}?{urllib.parse.urlencode(params)}"))
        norm = {n["to"]: n["from"] for n in data["query"].get("normalized", [])}
        for page in data["query"]["pages"]:
            if not page.get("imageinfo"):
                continue
            info = page["imageinfo"][0]
            meta = info.get("extmetadata") or {}
            author = html.unescape(re.sub(r"<[^>]+>", "", meta.get("Artist", {}).get("value", ""))).strip()
            infos[norm.get(page["title"], page["title"]).removeprefix("File:")] = {
                "width": info["width"],
                "height": info["height"],
                "download": info.get("thumburl") or info["url"],
                "credit": {
                    "author": author or "Wikimedia Commons",
                    "license": meta.get("LicenseShortName", {}).get("value", ""),
                    "license_url": meta.get("LicenseUrl", {}).get("value", ""),
                    "file_page": info["descriptionurl"],
                },
            }
        time.sleep(1)
    return infos


def main():
    states = json.loads(PLACES_FILE.read_text(encoding="utf-8"))
    chosen = {(s["id"], p["name"]): OVERRIDES.get((s["id"], p["name"])) or commons_title(p)
              for s in states for p in s["places"]}
    unknown = set(OVERRIDES) - set(chosen)
    if unknown:
        raise SystemExit(f"OVERRIDES name places that don't exist: {unknown}")

    only = sys.argv[sys.argv.index("--only") + 1] if "--only" in sys.argv else None
    if only and only not in {s["id"] for s in states}:
        raise SystemExit(f"Unknown state id: {only}")
    previous = json.loads(MAPPING_FILE.read_text(encoding="utf-8")) if only and MAPPING_FILE.exists() else {}
    infos = file_infos(t for (sid, _), t in chosen.items() if not only or sid == only)

    mapping, report = {}, []
    for state in states:
        sid = state["id"]
        if only and sid != only:
            mapping[sid] = previous[sid]  # keep the order of the app's state list
            continue
        state_dir = OUT_DIR / sid
        shutil.rmtree(state_dir, ignore_errors=True)  # never leave stale files behind
        slides = []
        for place in state["places"]:
            title = chosen[(sid, place["name"])]
            info = infos.get(title)
            if not info or not info["credit"]["license"]:
                report.append(f"{sid}: skipped {place['name']} (no license metadata)")
                continue
            if info["width"] < MIN_WIDTH or info["width"] / info["height"] < MIN_ASPECT:
                report.append(f"{sid}: skipped {place['name']} ({info['width']}x{info['height']})")
                continue

            state_dir.mkdir(parents=True, exist_ok=True)
            slug = slugify(place["name"])
            widths = sorted({min(w, info["width"]) for w in WIDTHS})  # never upscale
            source = fetch(info["download"])
            with tempfile.NamedTemporaryFile(suffix=Path(title).suffix) as tmp:
                tmp.write(source)
                tmp.flush()
                for w in widths:
                    subprocess.run(["cwebp", "-quiet", "-q", str(QUALITY), "-m", "6", "-metadata", "none",
                                    "-resize", str(w), "0", tmp.name,
                                    "-o", str(state_dir / f"{slug}-{w}.webp")], check=True)
            slides.append({"id": slug, "place": place["name"], "city": place["city"],
                           "widths": widths, "credit": info["credit"]})
            time.sleep(0.4)

        mapping[sid] = {"name": state["name"], "slides": slides}
        print(f"{state['name']:<42} {len(slides)} slides: {', '.join(s['place'] for s in slides)}")

    MAPPING_FILE.parent.mkdir(parents=True, exist_ok=True)
    MAPPING_FILE.write_text(json.dumps(mapping, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("\n" + "\n".join(report))
    print(f"\nWrote {sum(len(m['slides']) for m in mapping.values())} slides for {len(mapping)} states to "
          f"{MAPPING_FILE.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
