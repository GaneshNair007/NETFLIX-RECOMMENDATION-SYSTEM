from fastapi import APIRouter
from typing import Optional
from recommender import Recommender

router = APIRouter()
_rec: Optional[Recommender] = None


def set_recommender(rec: Recommender):
    global _rec
    _rec = rec


@router.get("/country-analytics")
async def country_analytics():
    data = _rec.get_country_analytics()
    return {"countries": data, "count": len(data)}
