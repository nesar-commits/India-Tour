
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
