
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
