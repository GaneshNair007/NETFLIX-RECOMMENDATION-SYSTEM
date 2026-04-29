import pandas as pd
import numpy as np
import os
import pickle
from typing import List, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "final_df.csv")
CACHE_PATH = os.path.join(os.path.dirname(__file__), "data", "tfidf_cache.pkl")


class Recommender:
    def __init__(self):
        self.df = None
        self.tfidf_matrix = None
        self.vectorizer = None
        self._load_data()

    def _load_data(self):
        """Load dataset and build (or restore cached) TF-IDF matrix."""
        self.df = pd.read_csv(DATA_PATH)

        # ── Column name normalisation ──────────────────────────────────────
        # PRD uses 'listed_in'; expose it also as 'genres' for convenience
        if "listed_in" in self.df.columns:
            self.df["genres"] = self.df["listed_in"]
        elif "genres" not in self.df.columns:
            self.df["genres"] = ""

        # Fill missing values
        self.df["genres"] = self.df["genres"].fillna("")
        self.df["description"] = self.df["description"].fillna("")
        self.df["country"] = self.df["country"].fillna("Unknown")
        self.df["popularity"] = pd.to_numeric(self.df["popularity"], errors="coerce").fillna(0)
        self.df["vote_count"] = pd.to_numeric(self.df["vote_count"], errors="coerce").fillna(0)
        self.df["release_year"] = pd.to_numeric(self.df["release_year"], errors="coerce").fillna(2000)

        # Normalise popularity & vote_count to [0, 1] for re-ranking
        pop_max = self.df["popularity"].max() or 1
        vote_max = self.df["vote_count"].max() or 1
        self.df["pop_norm"] = self.df["popularity"] / pop_max
        self.df["vote_norm"] = self.df["vote_count"] / vote_max

        # ── TF-IDF ────────────────────────────────────────────────────────
        if os.path.exists(CACHE_PATH):
            with open(CACHE_PATH, "rb") as f:
                cache = pickle.load(f)
            self.vectorizer = cache["vectorizer"]
            self.tfidf_matrix = cache["tfidf_matrix"]
            print("[Recommender] Loaded TF-IDF from cache.")
        else:
            self._build_tfidf()

    def _build_tfidf(self):
        """Build TF-IDF vectorizer and matrix; cache to disk."""
        self.df["combined"] = self.df["genres"] + " " + self.df["description"]
        self.vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
        self.tfidf_matrix = self.vectorizer.fit_transform(self.df["combined"])

        os.makedirs(os.path.dirname(CACHE_PATH), exist_ok=True)
        with open(CACHE_PATH, "wb") as f:
            pickle.dump({"vectorizer": self.vectorizer, "tfidf_matrix": self.tfidf_matrix}, f)
        print("[Recommender] Built and cached TF-IDF matrix.")

    # ──────────────────────────────────────────────────────────────────────
    # Public API
    # ──────────────────────────────────────────────────────────────────────

    def get_recommendations(self, movie_title: str, top_n: int = 10) -> List[dict]:
        """
        On-the-fly cosine similarity (O(N) not O(N²)).
        Re-ranks with:  score = 0.7*sim + 0.2*pop_norm + 0.1*vote_norm
        """
        title_lower = movie_title.strip().lower()
        matches = self.df[self.df["title"].str.lower() == title_lower]

        if matches.empty:
            # Try partial match as fallback
            matches = self.df[self.df["title"].str.lower().str.contains(title_lower, na=False)]

        if matches.empty:
            return []

        idx = matches.index[0]
        # ── ON-THE-FLY similarity (memory-safe) ───────────────────────────
        sim_scores = cosine_similarity(self.tfidf_matrix[idx], self.tfidf_matrix).flatten()

        # Exclude the movie itself
        sim_scores[idx] = 0.0

        # Re-ranking
        final_scores = (
            0.7 * sim_scores
            + 0.2 * self.df["pop_norm"].values
            + 0.1 * self.df["vote_norm"].values
        )

        top_indices = np.argsort(final_scores)[::-1][:top_n]
        results = []
        source_genres = set(self.df.loc[idx, "genres"].split(","))

        for i in top_indices:
            row = self.df.iloc[i]
            rec_genres = set(row["genres"].split(","))
            shared = [g.strip() for g in source_genres & rec_genres if g.strip()]
            reason_parts = []
            if shared:
                reason_parts.append(f"Shares genre: {', '.join(shared[:3])}")
            if sim_scores[i] > 0.3:
                reason_parts.append("Similar storyline / themes")
            reason = " · ".join(reason_parts) if reason_parts else "You may enjoy this"

            results.append({
                "title": row["title"],
                "genres": row["genres"],
                "description": row["description"],
                "release_year": int(row["release_year"]),
                "popularity": float(row["popularity"]),
                "vote_count": int(row["vote_count"]),
                "country": row["country"],
                "score": round(float(final_scores[i]), 4),
                "reason": reason,
            })

        return results

    def search(self, query: str, top_n: int = 10) -> List[dict]:
        """Case-insensitive partial title match."""
        q = query.strip().lower()
        mask = self.df["title"].str.lower().str.contains(q, na=False)
        hits = self.df[mask].head(top_n)
        return hits[["title", "genres", "release_year", "popularity", "country"]].to_dict(orient="records")

    def get_all_movies(self) -> pd.DataFrame:
        return self.df

    def get_movie(self, title: str) -> Optional[dict]:
        row = self.df[self.df["title"].str.lower() == title.strip().lower()]
        if row.empty:
            return None
        return row.iloc[0].to_dict()

    def get_trending(self, top_n: int = 20) -> List[dict]:
        top = self.df.nlargest(top_n, "popularity")
        return top[["title", "genres", "release_year", "popularity", "country", "description"]].to_dict(orient="records")

    def get_by_genre(self, genre: str, top_n: int = 20) -> List[dict]:
        mask = self.df["genres"].str.lower().str.contains(genre.lower(), na=False)
        hits = self.df[mask].nlargest(top_n, "popularity")
        return hits[["title", "genres", "release_year", "popularity", "country", "description"]].to_dict(orient="records")

    def get_country_analytics(self) -> List[dict]:
        grp = (
            self.df.groupby("country")["popularity"]
            .mean()
            .reset_index()
            .rename(columns={"popularity": "avg_popularity"})
            .sort_values("avg_popularity", ascending=False)
        )
        return grp.to_dict(orient="records")
