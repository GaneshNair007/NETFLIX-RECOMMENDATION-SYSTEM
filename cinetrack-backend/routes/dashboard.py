from fastapi import APIRouter
from typing import Optional
from recommender import Recommender
import json, os

router = APIRouter()
_rec: Optional[Recommender] = None

USER_DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "user_data.json")


def set_recommender(rec: Recommender):
    global _rec
    _rec = rec


def _load_user() -> dict:
    if os.path.exists(USER_DATA_PATH):
        with open(USER_DATA_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"watched": [], "watching": [], "want": []}


@router.get("/dashboard")
async def dashboard():
    user = _load_user()
    watched = user.get("watched", [])
    watching = user.get("watching", [])
    want = user.get("want", [])

    df = _rec.get_all_movies()

    # ── Taste Profile ──────────────────────────────────────────────────────────
    genre_counts: dict[str, int] = {}
    year_counts: dict[int, int] = {}
    total_popularity = 0.0
    valid_watched = 0

    for title in watched:
        rows = df[df["title"].str.lower() == title.strip().lower()]
        if rows.empty:
            continue
        row = rows.iloc[0]
        valid_watched += 1
        total_popularity += float(row.get("popularity", 0))
        year = int(row.get("release_year", 0))
        year_counts[year] = year_counts.get(year, 0) + 1
        for g in str(row.get("genres", "")).split(","):
            g = g.strip()
            if g:
                genre_counts[g] = genre_counts.get(g, 0) + 1

    top_genres = sorted(genre_counts.items(), key=lambda x: x[1], reverse=True)[:6]
    avg_popularity = round(total_popularity / valid_watched, 2) if valid_watched else 0

    # ── Personalized Recommendations (from watched list) ──────────────────────
    personal_recs = []
    if watched:
        recs = _rec.get_recommendations(watched[-1], top_n=6)
        personal_recs = [r["title"] for r in recs]

    # ── Year trend (recent 8 years) ────────────────────────────────────────────
    year_trend = [{"year": y, "count": c} for y, c in sorted(year_counts.items())]

    return {
        "taste_profile": {
            "top_genres": [{"genre": g, "count": c} for g, c in top_genres],
            "total_watched": len(watched),
            "total_watching": len(watching),
            "total_want": len(want),
            "avg_popularity": avg_popularity,
        },
        "analytics": {
            "year_trend": year_trend,
            "genre_distribution": [{"genre": g, "count": c} for g, c in top_genres],
        },
        "personalized_recommendations": personal_recs,
        "user_lists": user,
    }
