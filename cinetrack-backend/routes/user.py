import json
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

USER_DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "user_data.json")
VALID_STATES = {"watched", "watching", "want"}

# ── Persistence helpers ────────────────────────────────────────────────────────

def _load() -> dict:
    if os.path.exists(USER_DATA_PATH):
        with open(USER_DATA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"watched": [], "watching": [], "want": [], "ratings": {}, "recently_added": [], "onboarded": False}


def _save(data: dict):
    os.makedirs(os.path.dirname(USER_DATA_PATH), exist_ok=True)
    with open(USER_DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def _ensure_keys(data: dict) -> dict:
    """Ensure all required keys exist (migration safe)."""
    data.setdefault("watched", [])
    data.setdefault("watching", [])
    data.setdefault("want", [])
    data.setdefault("ratings", {})
    data.setdefault("recently_added", [])
    data.setdefault("onboarded", False)
    return data


# ── Models ─────────────────────────────────────────────────────────────────────

class UserUpdate(BaseModel):
    movie: str
    state: str  # "watched" | "watching" | "want"


class RemoveRequest(BaseModel):
    movie: str


class RateRequest(BaseModel):
    movie: str
    rating: int  # 1-5


class OnboardRequest(BaseModel):
    picks: list[str]
    ratings: dict[str, int] = {}


# ── Routes ─────────────────────────────────────────────────────────────────────

@router.post("/user/update")
async def update_user(body: UserUpdate):
    if body.state not in VALID_STATES:
        raise HTTPException(status_code=400, detail=f"Invalid state. Choose from: {VALID_STATES}")

    data = _ensure_keys(_load())

    # Remove from all lists first
    for state in VALID_STATES:
        if body.movie in data.get(state, []):
            data[state].remove(body.movie)

    data.setdefault(body.state, []).append(body.movie)

    # Track recently added (last 10)
    recently = data.get("recently_added", [])
    if body.movie in recently:
        recently.remove(body.movie)
    recently.append(body.movie)
    data["recently_added"] = recently[-10:]

    _save(data)
    return {"status": "ok", "movie": body.movie, "state": body.state, "lists": data}


@router.post("/user/remove")
async def remove_user(body: RemoveRequest):
    data = _ensure_keys(_load())
    removed = False
    for state in VALID_STATES:
        if body.movie in data.get(state, []):
            data[state].remove(body.movie)
            removed = True
    # Remove rating too
    data.get("ratings", {}).pop(body.movie, None)
    _save(data)
    return {"status": "ok", "removed": removed, "lists": data}


@router.get("/user/lists")
async def get_lists():
    return _ensure_keys(_load())


@router.post("/user/rate")
async def rate_movie(body: RateRequest):
    if not (1 <= body.rating <= 5):
        raise HTTPException(status_code=400, detail="Rating must be 1-5")
    data = _ensure_keys(_load())
    data["ratings"][body.movie] = body.rating
    _save(data)
    return {"status": "ok", "movie": body.movie, "rating": body.rating}


@router.get("/user/profile")
async def get_profile():
    data = _ensure_keys(_load())
    return data


@router.post("/user/onboard")
async def onboard(body: OnboardRequest):
    data = _ensure_keys(_load())
    for movie in body.picks:
        if movie not in data["watched"]:
            data["watched"].append(movie)
    for movie, rating in body.ratings.items():
        if 1 <= rating <= 5:
            data["ratings"][movie] = rating
    data["recently_added"] = list(body.picks)[-10:]
    data["onboarded"] = True
    _save(data)
    return {"status": "ok", "onboarded": True, "profile": data}
