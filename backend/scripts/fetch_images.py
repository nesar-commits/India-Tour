"""Fetch a free-licensed photo for every tourist place from Wikipedia / Wikimedia Commons.

For each place we find its Wikipedia article (via the optional "wiki_title" field, or a search
for "<place name> <state>"), take the article's lead image restricted to free licenses, then look
up the image's author and license on Commons. Results are written back into states.json as
`place.image`.

Usage (from backend/):
    python scripts/fetch_images.py           # only places without an image
    python scripts/fetch_images.py --force   # refetch everything
"""

import html
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

DATA_FILE = Path(__file__).resolve().parent.parent / "app" / "data" / "states.json"
API = "https://en.wikipedia.org/w/api.php"
USER_AGENT = "IndiaTourApp/1.0 (local educational project) python-urllib/3.9"
THUMB_WIDTH = 800


def api_get(**params):
    params.update(format="json", formatversion="2")
    url = f"{API}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    attempts = 6
    for attempt in range(attempts):
        try:
            with urllib.request.urlopen(req, timeout=20) as res:
                return json.load(res)
        except Exception as e:  # network hiccup or rate limit: back off and retry
            if attempt == attempts - 1:
                raise
            retry_after = getattr(e, "headers", None) and e.headers.get("Retry-After")
            wait = int(retry_after) if retry_after and retry_after.isdigit() else 5 * 2 ** attempt
            print(f"  {e}; waiting {wait}s")
            time.sleep(wait)


def find_article(place, state_name):
    """Return (article_title, image_file_name) or (None, None)."""
    if place.get("wiki_file"):  # an exact Commons file pinned by hand
        return place.get("wiki_title"), place["wiki_file"].removeprefix("File:")
    common = dict(action="query", prop="pageimages", piprop="name", pilicense="free", redirects=1)
    if place.get("wiki_title"):
        data = api_get(titles=place["wiki_title"], **common)
    else:
        data = api_get(
            generator="search",
            gsrsearch=f"{place['name']} {state_name}",
            gsrlimit=5,
            **common,
        )
    pages = sorted(data.get("query", {}).get("pages", []), key=lambda p: p.get("index", 0))
    for page in pages:
        if page.get("pageimage"):
            return page["title"], page["pageimage"]
    return None, None


def strip_html(text):
    return html.unescape(re.sub(r"<[^>]+>", "", text or "")).strip()


def image_info(file_names):
    """Batch lookup of thumbnail URL, file page, author and license for up to 50 files."""
    data = api_get(
        action="query",
        titles="|".join(f"File:{n}" for n in file_names),
        prop="imageinfo",
        iiprop="url|extmetadata",
        iiurlwidth=THUMB_WIDTH,
        iiextmetadatafilter="Artist|LicenseShortName|LicenseUrl",
    )
    norm = {n["to"]: n["from"] for n in data["query"].get("normalized", [])}
    out = {}
    for page in data["query"]["pages"]:
        if not page.get("imageinfo"):
            continue
        info = page["imageinfo"][0]
        meta = info.get("extmetadata") or {}
        name = norm.get(page["title"], page["title"]).removeprefix("File:")
        out[name.replace(" ", "_")] = {
            "url": info.get("thumburl") or info["url"],
            "file_page": info["descriptionurl"],
            "author": strip_html(meta.get("Artist", {}).get("value")) or "Unknown",
            "license": meta.get("LicenseShortName", {}).get("value", ""),
            "license_url": meta.get("LicenseUrl", {}).get("value", ""),
        }
    return out


def main():
    force = "--force" in sys.argv
    states = json.loads(DATA_FILE.read_text(encoding="utf-8"))

    for state in states:
        pending = []  # (place, article_title, file_name)
        for place in state["places"]:
            if place.get("image") and not force:
                continue
            title, file_name = find_article(place, state["name"])
            print(f"{state['name']:<28} {place['name']:<45} -> {title or file_name or 'NO IMAGE'}")
            if file_name:
                pending.append((place, title, file_name))
            time.sleep(1)
        if not pending:
            continue

        infos = image_info([f for _, _, f in pending])
        for place, title, file_name in pending:
            info = infos.get(file_name.replace(" ", "_"))
            if not info:
                print(f"  no imageinfo for {file_name}")
                continue
            place["image"] = {
                **info,
                "source_page": (
                    "https://en.wikipedia.org/wiki/" + urllib.parse.quote(title.replace(" ", "_"))
                    if title
                    else ""
                ),
            }
        # Save after every state so an interrupted run can resume.
        DATA_FILE.write_text(json.dumps(states, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    total = sum(len(s["places"]) for s in states)
    with_img = sum(1 for s in states for p in s["places"] if p.get("image"))
    print(f"\n{with_img}/{total} places have images.")


if __name__ == "__main__":
    main()
