import json
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .models import PlaceWithState, State, StateSummary, Stats

DATA_FILE = Path(__file__).parent / "data" / "states.json"

with DATA_FILE.open(encoding="utf-8") as f:
    STATES: List[State] = [State(**s) for s in json.load(f)]

STATES_BY_ID = {s.id: s for s in STATES}
REGIONS = sorted({s.region for s in STATES})
CATEGORIES = sorted({p.category for s in STATES for p in s.places})

app = FastAPI(
    title="India Tour API",
    description="States and union territories of India with their tourist places.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


def _matches(text: str, q: Optional[str]) -> bool:
    return not q or q.lower() in text.lower()


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/stats", response_model=Stats)
def stats():
    return Stats(
        states=sum(1 for s in STATES if s.type == "State"),
        union_territories=sum(1 for s in STATES if s.type == "Union Territory"),
        places=sum(len(s.places) for s in STATES),
        regions=REGIONS,
        categories=CATEGORIES,
    )


@app.get("/api/states", response_model=List[StateSummary])
def list_states(
    q: Optional[str] = Query(None, description="Search by state, capital or place name"),
    region: Optional[str] = None,
    type: Optional[str] = Query(None, description="'State' or 'Union Territory'"),
):
    results = []
    for s in STATES:
        if region and s.region.lower() != region.lower():
            continue
        if type and s.type.lower() != type.lower():
            continue
        haystack = " ".join([s.name, s.capital] + [p.name for p in s.places])
        if not _matches(haystack, q):
            continue
        results.append(
            StateSummary(
                id=s.id,
                name=s.name,
                type=s.type,
                capital=s.capital,
                region=s.region,
                place_count=len(s.places),
            )
        )
    return results


@app.get("/api/states/{state_id}", response_model=State)
def get_state(state_id: str):
    state = STATES_BY_ID.get(state_id)
    if not state:
        raise HTTPException(status_code=404, detail="State not found")
    return state


@app.get("/api/places", response_model=List[PlaceWithState])
def list_places(
    q: Optional[str] = Query(None, description="Search by place name, city or description"),
    category: Optional[str] = None,
    state_id: Optional[str] = None,
    region: Optional[str] = None,
):
    results = []
    for s in STATES:
        if state_id and s.id != state_id:
            continue
        if region and s.region.lower() != region.lower():
            continue
        for p in s.places:
            if category and p.category.lower() != category.lower():
                continue
            if not _matches(f"{p.name} {p.city} {p.description} {s.name}", q):
                continue
            results.append(PlaceWithState(**p.model_dump(), state_id=s.id, state_name=s.name))
    return results
