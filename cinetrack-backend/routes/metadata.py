import os
import httpx
from fastapi import APIRouter, Query
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
TMDB_API_KEY = os.getenv("TMDB_API_KEY", "")
TMDB_BASE = "https://api.themoviedb.org/3"
TMDB_IMG = "https://image.tmdb.org/t/p"

# Simple in-memory cache — avoids hammering TMDB for the same title twice
_cache: dict = {}


@router.get("/metadata")
async def get_metadata(title: str = Query(...)):
    """
    TMDB proxy — keeps the API key on the backend.
    Returns poster_url, backdrop_url, tmdb_rating, tmdb_id, overview.
    Results are cached in-memory so repeated calls for the same title are instant.
    """
    # Return cached result immediately if available
    if title in _cache:
        return _cache[title]

    if not TMDB_API_KEY or TMDB_API_KEY == "your_tmdb_api_key_here":
        result = _placeholder(title)
        _cache[title] = result
        return result

    async with httpx.AsyncClient(timeout=8.0) as client:
        resp = await client.get(
            f"{TMDB_BASE}/search/movie",
            params={"api_key": TMDB_API_KEY, "query": title, "page": 1},
        )

    if resp.status_code != 200:
        return _placeholder(title)

    results = resp.json().get("results", [])
    if not results:
        # Try TV search
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(
                f"{TMDB_BASE}/search/tv",
                params={"api_key": TMDB_API_KEY, "query": title, "page": 1},
            )
        results = resp.json().get("results", []) if resp.status_code == 200 else []

    if not results:
        return _placeholder(title)

    hit = results[0]
    poster = f"{TMDB_IMG}/w500{hit.get('poster_path', '')}" if hit.get("poster_path") else None
    backdrop = f"{TMDB_IMG}/original{hit.get('backdrop_path', '')}" if hit.get("backdrop_path") else None

    result = {
        "title": title,
        "tmdb_id": hit.get("id"),
        "poster_url": poster or f"https://via.placeholder.com/300x450?text={title.replace(' ', '+')}",
        "backdrop_url": backdrop or f"https://via.placeholder.com/1280x720?text={title.replace(' ', '+')}",
        "tmdb_rating": hit.get("vote_average", 0),
        "overview": hit.get("overview") or hit.get("description", ""),
        "trailer_key": None,
    }
    _cache[title] = result   # cache for future requests
    return result


def _placeholder(title: str) -> dict:
    return {
        "title": title,
        "tmdb_id": None,
        "poster_url": f"https://via.placeholder.com/300x450/141414/E50914?text={title.replace(' ', '+')}",
        "backdrop_url": f"https://via.placeholder.com/1280x720/141414/E50914?text={title.replace(' ', '+')}",
        "tmdb_rating": 0,
        "overview": "",
        "trailer_key": None,
    }
