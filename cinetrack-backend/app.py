"""
CineTrack — FastAPI Backend
Run:  uvicorn app:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import Optional

from recommender import Recommender
from routes import recommend, search, user, dashboard, country, metadata, personalized

# ── Shared recommender instance ────────────────────────────────────────────────
_recommender: Optional[Recommender] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _recommender
    print("[CineTrack] Loading recommender model…")
    _recommender = Recommender()
    # Inject into all routes that need it
    recommend.set_recommender(_recommender)
    search.set_recommender(_recommender)
    dashboard.set_recommender(_recommender)
    country.set_recommender(_recommender)
    personalized.set_recommender(_recommender)
    print("[CineTrack] Ready ✓")
    yield
    print("[CineTrack] Shutting down…")


app = FastAPI(
    title="CineTrack API",
    description="Netflix-style movie recommendation engine",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS — allow Vite/React dev server ────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Vercel + localhost — tighten after first deploy if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register routes ────────────────────────────────────────────────────────────
app.include_router(recommend.router)
app.include_router(search.router)
app.include_router(user.router)
app.include_router(dashboard.router)
app.include_router(country.router)
app.include_router(metadata.router)
app.include_router(personalized.router)


@app.get("/")
async def root():
    return {
        "app": "CineTrack API",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": [
            "GET  /recommend?movie=Inception",
            "GET  /search?q=inc",
            "POST /user/update",
            "POST /user/remove",
            "GET  /user/lists",
            "GET  /dashboard",
            "GET  /country-analytics",
            "GET  /metadata?title=Inception",
        ],
    }


@app.get("/trending")
async def trending():
    return {"trending": _recommender.get_trending(top_n=20)}


@app.get("/genre/{genre}")
async def by_genre(genre: str):
    return {"genre": genre, "movies": _recommender.get_by_genre(genre, top_n=20)}
