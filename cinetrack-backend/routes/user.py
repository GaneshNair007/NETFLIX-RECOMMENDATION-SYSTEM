import json
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

USER_DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "user_data.json")
VALID_STATES = {"watched", "watching", "want"}

# ── Persistence helpers ────────────────────────────────────────────────────────

def _load() -> dict:
    if os.path.exists(USER_DATA_PATH):
        with open(USER_DATA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"watched": [], "watching": [], "want": []}


def _save(data: dict):
    os.makedirs(os.path.dirname(USER_DATA_PATH), exist_ok=True)
    with open(USER_DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


# ── Models ─────────────────────────────────────────────────────────────────────

class UserUpdate(BaseModel):
    movie: str
    state: str  # "watched" | "watching" | "want"


class RemoveRequest(BaseModel):
    movie: str


# ── Routes ─────────────────────────────────────────────────────────────────────

@router.post("/user/update")
async def update_user(body: UserUpdate):
    if body.state not in VALID_STATES:
        raise HTTPException(status_code=400, detail=f"Invalid state. Choose from: {VALID_STATES}")

    data = _load()

    # Remove from all lists first (prevents duplicates)
    for state in VALID_STATES:
        if body.movie in data.get(state, []):
            data[state].remove(body.movie)

    data.setdefault(body.state, []).append(body.movie)
    _save(data)
    return {"status": "ok", "movie": body.movie, "state": body.state, "lists": data}


@router.post("/user/remove")
async def remove_user(body: RemoveRequest):
    data = _load()
    removed = False
    for state in VALID_STATES:
        if body.movie in data.get(state, []):
            data[state].remove(body.movie)
            removed = True
    _save(data)
    return {"status": "ok", "removed": removed, "lists": data}


@router.get("/user/lists")
async def get_lists():
    return _load()
