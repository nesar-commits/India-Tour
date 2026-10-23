"""Download the homepage hero photos from Wikimedia Commons and convert them to local WebP files.

Every photo is free-licensed (Commons only hosts free media). The script records each
photo's author and license in src/data/heroSlides.json so the slideshow can credit it.

Requires `cwebp` (brew install webp). Run from frontend/:
    python3 scripts/fetch_hero_images.py

To add or swap a photo, edit SLIDES (exact Commons file title) and rerun.
"""

import html
import json
import re
import subprocess
import tempfile
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "hero"
DATA_FILE = ROOT / "src" / "data" / "heroSlides.json"
API = "https://commons.wikimedia.org/w/api.php"
USER_AGENT = "IndiaTourApp/1.0 (local educational project) python-urllib"
WIDTHS = [1280, 1920, 2560]
QUALITY = 72

# focus: CSS object-position on wide screens; focus_portrait: on tall/narrow screens.
SLIDES = [
    {"id": "taj-mahal", "place": "Taj Mahal", "location": "Agra, Uttar Pradesh",
     "file": "Taj Mahal Agra India 2025 12.jpg", "focus": "50% 45%", "focus_portrait": "58% 50%"},
    {"id": "kerala-backwaters", "place": "Kerala Backwaters", "location": "Alappuzha, Kerala",
     "file": "Nedumudy - Houseboat.jpg", "focus": "50% 55%", "focus_portrait": "35% 50%"},
    {"id": "pangong-tso", "place": "Pangong Tso", "location": "Ladakh",
     "file": "Pangong Lake, Ladakh valley.jpg", "focus": "50% 50%", "focus_portrait": "55% 50%"},
    {"id": "hawa-mahal", "place": "Hawa Mahal", "location": "Jaipur, Rajasthan",
     "file": "20191218 Pałac Wiatrów w Jaipurze 1129 9124.jpg", "focus": "50% 40%", "focus_portrait": "50% 40%"},
    {"id": "palolem-goa", "place": "Palolem Beach", "location": "South Goa",
     "file": "Rock formation, Palolem Beach.jpg", "focus": "50% 50%", "focus_portrait": "70% 50%"},
    {"id": "varanasi-ghats", "place": "Ganges at Varanasi", "location": "Varanasi, Uttar Pradesh",
     "file": "Boats at sunrise Ganges River Varanasi Uttar Pradesh Schwiki.jpg", "focus": "50% 60%", "focus_portrait": "62% 50%"},
    {"id": "kanchenjunga", "place": "Kanchenjunga Range", "location": "Darjeeling, West Bengal",
     "file": "Kanchenjunga range viewed from Zoological Park (51939904768).jpg", "focus": "50% 35%", "focus_portrait": "55% 40%"},
    {"id": "nohkalikai-falls", "place": "Nohkalikai Falls", "location": "Cherrapunji, Meghalaya",
     "file": "Nohkalikai falls,shillong,meghalaya.jpeg", "focus": "55% 50%", "focus_portrait": "56% 50%"},
    {"id": "hampi", "place": "Virupaksha Temple", "location": "Hampi, Karnataka",
     "file": "Wide angle of Galigopuram of Virupaksha Temple, Hampi (03).jpg", "focus": "55% 50%", "focus_portrait": "60% 50%"},
    {"id": "radhanagar-beach", "place": "Radhanagar Beach", "location": "Swaraj Dweep, Andaman Islands",
     "file": "Havelock Island, Radhanagar Beach, Andaman Islands.jpg", "focus": "50% 50%", "focus_portrait": "62% 50%"},
]


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


def file_info(title):
    params = dict(action="query", format="json", formatversion="2", titles=f"File:{title}",
                  prop="imageinfo", iiprop="url|size|extmetadata", iiurlwidth=max(WIDTHS),
                  iiextmetadatafilter="Artist|LicenseShortName|LicenseUrl")
    data = json.loads(fetch(f"{API}?{urllib.parse.urlencode(params)}"))
    info = data["query"]["pages"][0]["imageinfo"][0]
    meta = info.get("extmetadata") or {}
    author = html.unescape(re.sub(r"<[^>]+>", "", meta.get("Artist", {}).get("value", ""))).strip()
    return info, {
        "author": author or "Wikimedia Commons",
        "license": meta.get("LicenseShortName", {}).get("value", ""),
        "license_url": meta.get("LicenseUrl", {}).get("value", ""),
        "file_page": info["descriptionurl"],
    }


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    slides = []
    for slide in SLIDES:
        info, credit = file_info(slide["file"])
        if not credit["license"]:
            raise SystemExit(f"No license metadata for {slide['file']}; pick another photo.")
        # Largest thumbnail Commons will render (falls back to the original if smaller).
        source = fetch(info.get("thumburl") or info["url"])
        with tempfile.NamedTemporaryFile(suffix=Path(slide["file"]).suffix) as tmp:
            tmp.write(source)
            tmp.flush()
            for width in WIDTHS:
                out = OUT_DIR / f"{slide['id']}-{width}.webp"
                subprocess.run(["cwebp", "-quiet", "-q", str(QUALITY), "-m", "6", "-metadata", "none",
                                "-resize", str(width), "0", tmp.name, "-o", str(out)], check=True)
        sizes = {w: (OUT_DIR / f"{slide['id']}-{w}.webp").stat().st_size // 1024 for w in WIDTHS}
        print(f"{slide['id']:<20} {credit['license']:<14} {sizes} KB")
        slides.append({k: v for k, v in slide.items() if k != "file"} | {"credit": credit})
        time.sleep(1)

    DATA_FILE.write_text(json.dumps({"widths": WIDTHS, "slides": slides}, indent=2, ensure_ascii=False) + "\n")
    print(f"\nWrote {len(slides)} slides to {DATA_FILE.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
