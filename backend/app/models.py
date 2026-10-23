from typing import List, Optional

from pydantic import BaseModel


class Image(BaseModel):
    url: str
    file_page: str
    author: str
    license: str
    license_url: str = ""
    source_page: str = ""


class Place(BaseModel):
    name: str
    city: str
    category: str
    description: str
    wiki_title: Optional[str] = None
    wiki_file: Optional[str] = None
    image: Optional[Image] = None


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
    cover_image: Optional[Image] = None


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

    @property
    def cover_image(self) -> Optional[Image]:
        return next((p.image for p in self.places if p.image), None)


class Stats(BaseModel):
    states: int
    union_territories: int
    places: int
    regions: List[str]
    categories: List[str]
