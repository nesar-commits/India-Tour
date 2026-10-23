
## Images

Every place has a free-licensed photo from **Wikimedia Commons**, credited on each card
(author and license link back to the file page). Image data lives in each place's `image` field.

To fetch images for new places (or refetch all with `--force`):

```bash
cd backend
.venv/bin/python scripts/fetch_images.py
```

If the script picks the wrong photo, set `wiki_title` (exact Wikipedia article) or
`wiki_file` (exact Commons file name) on the place, delete its `image`, and rerun.

## Authentication (frontend ready, backend pending)

`/login` and `/signup` are fully built: validation, loading/error states, and keyboard and
mobile support. **The backend has no auth endpoints yet**, so submitting a valid form shows
"Accounts aren't available yet". Nothing is faked or stored.

To make it live, add these to the FastAPI app (the client is in `frontend/src/auth/authApi.js`):

| Endpoint | Body | Success | Errors the UI handles |
| --- | --- | --- | --- |
| `POST /api/auth/register` | `{ name, email, password }` | `201 { user }` | `409` email taken, `422` invalid |
| `POST /api/auth/login` | `{ email, password, remember }` | `200 { user }` + session cookie | `401` wrong credentials, `429` rate limited |

Backend requirements: hash passwords (bcrypt/argon2), keep the session in an `httpOnly`,
`Secure`, `SameSite=Lax` cookie (longer-lived when `remember` is true), and allow `POST` in CORS
if the frontend is served from a different origin. Password reset, Google sign-in, and the
real Terms/Privacy text (`/terms` and `/privacy` are placeholders) are also still to do.

## Homepage slideshow

The homepage hero cycles through 10 destination photos (5 s each, 1.2 s crossfade). They are
local WebP files in `frontend/public/hero/` (1280/1920/2560 px), downloaded from Wikimedia
Commons with their author and license recorded in `frontend/src/data/heroSlides.json` and
credited on screen. To change the photos, edit `SLIDES` in
`frontend/scripts/fetch_hero_images.py` and run (needs `brew install webp`):

```bash
cd frontend && python3 scripts/fetch_hero_images.py
```

Timing lives in `frontend/src/components/HeroSlideshow.jsx` (`DISPLAY_MS`, `FADE_MS`); keep
`--hero-fade` in `index.css` equal to `FADE_MS`.

## State page slideshows

Every state/UT page (`/states/<id>`) has a background slideshow of **that state's own places
only**, using the same timing as the homepage.

- Mapping: `frontend/src/data/stateSlides.json` (state id → slides with credits), read through
  `frontend/src/data/stateSlides.js` (`getStateSlides`, `resolveStateId`, `normalizeStateSlug`).
- Images: `frontend/public/images/states/<state-id>/<place>-{960,1600}.webp`.
- Component: `frontend/src/components/StateBackgroundSlideshow.jsx` (keyed per state, so
  switching states fully resets it), built on `BackgroundSlideshow.jsx`.

The mapping is generated from the backend's place list, so a state can only get photos of its
own places. To rebuild (needs `brew install webp`):

```bash
cd frontend
python3 scripts/fetch_state_images.py              # all states
python3 scripts/fetch_state_images.py --only goa   # one state
```

Photos narrower than 1200px or not landscape are skipped; to use a better photo of a place,
add its Commons file name to `OVERRIDES` in the script.
