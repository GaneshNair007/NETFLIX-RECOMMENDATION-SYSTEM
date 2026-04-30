from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from recommender import Recommender

router = APIRouter()
_rec: Optional[Recommender] = None


def set_recommender(rec: Recommender):
    global _rec
    _rec = rec


class PersonalizedRequest(BaseModel):
    profile: Dict[str, Any] = {}
    filters: Dict[str, Any] = {}
    top_n: int = 30


@router.post("/personalized")
async def get_personalized(body: PersonalizedRequest):
    result = _rec.get_personalized(body.profile, body.filters, body.top_n)
    return result


@router.get("/onboarding-movies")
async def onboarding_movies():
    movies = _rec.get_top_movies_for_onboarding(n=60)
    return {"movies": movies}
