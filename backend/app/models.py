from typing import List

from pydantic import BaseModel


class Place(BaseModel):
    name: str
    city: str
    category: str
    description: str


class PlaceWithState(Place):
    state_id: str
    state_name: str


class StateSummary(BaseModel):
    id: str
    name: str
    type: str
    capital: str
    region: str
    place_count: int


class State(BaseModel):
    id: str
    name: str
    type: str
    capital: str
    region: str
    languages: List[str]
    best_time: str
    description: str
    places: List[Place]


class Stats(BaseModel):
    states: int
    union_territories: int
    places: int
    regions: List[str]
    categories: List[str]
