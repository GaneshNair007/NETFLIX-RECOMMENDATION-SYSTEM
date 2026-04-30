from fastapi import APIRouter, Query
from typing import Optional
from recommender import Recommender

router = APIRouter()
_rec: Optional[Recommender] = None


def set_recommender(rec: Recommender):
    global _rec
    _rec = rec


@router.get("/search")
async def search(q: str = Query(..., min_length=1)):
    results = _rec.search(q, top_n=20)
    return {"query": q, "results": results, "count": len(results)}
