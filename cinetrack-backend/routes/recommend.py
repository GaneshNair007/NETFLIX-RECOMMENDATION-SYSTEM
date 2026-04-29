from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from recommender import Recommender

router = APIRouter()
_rec: Optional[Recommender] = None


def set_recommender(rec: Recommender):
    global _rec
    _rec = rec


@router.get("/recommend")
async def recommend(movie: str = Query(..., description="Movie title to base recommendations on")):
    if not movie.strip():
        raise HTTPException(status_code=400, detail="movie param is required")

    results = _rec.get_recommendations(movie, top_n=10)
    if not results:
        raise HTTPException(status_code=404, detail=f"'{movie}' not found in dataset")

    return {
        "input_movie": movie,
        "recommendations": [r["title"] for r in results[:5]],
        "detailed": results[:10],
        "reason": results[0]["reason"] if results else "Similar genre + description",
    }
