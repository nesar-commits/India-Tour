# India Tour

Browse all 28 states and 8 union territories of India and their tourist places.

- **backend/**: FastAPI REST API (data in `backend/app/data/states.json`)
- **frontend/**: React + Vite single-page app

## Run it

### 1. Backend (port 8000)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Interactive API docs: http://localhost:8000/docs

### 2. Frontend (port 5173)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The Vite dev server proxies `/api` to the backend.

## API

| Method | Endpoint | Query params | Description |
| --- | --- | --- | --- |
| GET | `/api/stats` | | Counts, regions and categories |
| GET | `/api/states` | `q`, `region`, `type` | List states/UTs (summary) |
| GET | `/api/states/{id}` | | Full state with its places |
| GET | `/api/places` | `q`, `category`, `state_id`, `region` | Search all tourist places |

## Adding data

Edit `backend/app/data/states.json`. Each place needs a `name`, `city`, `category` and `description`.
Restart the backend afterwards. New categories and regions show up as filters automatically.
