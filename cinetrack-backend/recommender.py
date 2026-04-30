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

    # ── Personalized recommendations ───────────────────────────────────────────

    def get_personalized(self, profile: dict, filters: dict = None, top_n: int = 30) -> dict:
        """6-layer personalized engine: rating-weighted blending, recency decay,
        genre affinity re-ranking, mood filter, anti-bubble diversity injection."""
        if filters is None:
            filters = {}

        watched   = profile.get("watched", [])
        watching  = profile.get("watching", [])
        want      = profile.get("want", [])
        ratings   = profile.get("ratings", {})
        recently  = profile.get("recently_added", [])
        all_seen  = set(m.lower() for m in watched + watching + want)

        # Fall back to trending when no history
        if not (watched or watching or want):
            trending = self.get_trending(top_n)
            return {
                "picks": [{**m, "match_score": 50, "why_list": ["Trending now"], "is_diverse": False} for m in trending],
                "taste_summary": {"genres": [], "countries": [], "total_movies": 0, "genre_affinity": {}},
                "total": len(trending),
            }

        n = len(self.df)
        blended = np.zeros(n)
        rw = {5: 2.0, 4: 1.5, 3: 1.0, 2: 0.3, 1: -0.5}

        # Recency boost (last 5 added)
        for rank, movie in enumerate(reversed(recently[:5])):
            idx = self._find_idx(movie)
            if idx is not None:
                sim = cosine_similarity(self.tfidf_matrix[idx], self.tfidf_matrix).flatten()
                blended += sim * (0.3 * (5 - rank) / 5)

        for movie in watched:
            idx = self._find_idx(movie)
            if idx is None:
                continue
            sim = cosine_similarity(self.tfidf_matrix[idx], self.tfidf_matrix).flatten()
            blended += sim * rw.get(int(ratings.get(movie, 3)), 1.0)

        for movie in watching:
            idx = self._find_idx(movie)
            if idx is None:
                continue
            sim = cosine_similarity(self.tfidf_matrix[idx], self.tfidf_matrix).flatten()
            blended += sim * 0.8

        for movie in want:
            idx = self._find_idx(movie)
            if idx is None:
                continue
            sim = cosine_similarity(self.tfidf_matrix[idx], self.tfidf_matrix).flatten()
            blended += sim * 0.5

        # Genre affinity boost
        genre_affinity = self._compute_genre_affinity(watched, ratings)
        aff_boost = np.zeros(n)
        for i in range(n):
            gs = [g.strip() for g in str(self.df.iloc[i].get("listed_in", "")).split(",")]
            aff_boost[i] = sum(genre_affinity.get(g, 0) for g in gs)
        aff_max = aff_boost.max() or 1
        aff_boost = np.clip(aff_boost / aff_max, 0, 1)

        blended_norm = blended / (np.abs(blended).max() or 1)
        final = (0.65 * blended_norm + 0.20 * self.df["pop_norm"].values
                 + 0.10 * aff_boost + 0.05 * self.df["vote_norm"].values)

        # Zero out user's own movies
        for movie in all_seen:
            idx = self._find_idx(movie)
            if idx is not None:
                final[idx] = -999.0

        # Filters
        mask = np.ones(n, dtype=bool)
        fg = [g.lower() for g in filters.get("genres", [])]
        if fg:
            mask &= self.df["listed_in"].str.lower().apply(lambda x: any(g in x for g in fg)).values
        fc = [c.lower() for c in filters.get("countries", [])]
        if fc:
            mask &= self.df["country"].str.lower().apply(lambda x: any(c in x for c in fc)).values
        if filters.get("year_from"):
            mask &= self.df["release_year"].values >= int(filters["year_from"])
        if filters.get("year_to"):
            mask &= self.df["release_year"].values <= int(filters["year_to"])

        mood_map = {
            "action": ["action", "adventure"], "mind-bending": ["thriller", "sci-fi", "mystery"],
            "emotional": ["drama", "romance"], "comedy": ["comedy"],
            "horror": ["horror"], "world": [], "classic": [], "surprise": [],
        }
        mood = filters.get("mood", "").lower()
        if mood in mood_map and mood_map[mood]:
            mg = mood_map[mood]
            mask &= self.df["listed_in"].str.lower().apply(lambda x: any(m in x for m in mg)).values

        filtered = final.copy()
        filtered[~mask] = -999.0

        main_n = max(1, int(top_n * 0.8))
        top_idx = np.argsort(filtered)[::-1][:main_n]
        top_set = set(top_idx.tolist())

        # Diversity picks (20%)
        diverse_n = top_n - main_n
        div_idx = []
        top_genres = list(genre_affinity.keys())[:3]
        if top_genres and diverse_n > 0 and mood != "surprise":
            def outside(gs_str):
                gs = [g.strip().lower() for g in str(gs_str).split(",")]
                return not any(tg.lower() in g for tg in top_genres for g in gs)
            dm = mask.copy()
            dm &= self.df["listed_in"].apply(outside).values
            for m in all_seen:
                i = self._find_idx(m)
                if i is not None:
                    dm[i] = False
            for i in top_set:
                if i < len(dm):
                    dm[i] = False
            ds = self.df["pop_norm"].values.copy()
            ds[~dm] = -999.0
            div_idx = np.argsort(ds)[::-1][:diverse_n].tolist()
        elif mood == "surprise":
            sm = mask.copy()
            for m in all_seen:
                i = self._find_idx(m)
                if i is not None:
                    sm[i] = False
            valid = np.where(sm)[0]
            if len(valid) >= diverse_n:
                div_idx = np.random.choice(valid, diverse_n, replace=False).tolist()

        max_score = max((filtered[filtered > -900].max() if (filtered > -900).any() else 1), 1e-6)
        results, seen_set = [], set()

        for i in top_idx:
            i = int(i)
            if i in seen_set or i >= n:
                continue
            seen_set.add(i)
            row = self.df.iloc[i]
            why = self._build_why(row, watched, ratings, genre_affinity)
            results.append({
                "title": row["title"], "genres": row["listed_in"],
                "description": str(row.get("description", "")),
                "release_year": int(row["release_year"]), "popularity": float(row["popularity"]),
                "country": row["country"],
                "match_score": min(99, max(10, round(float(final[i]) / max_score * 100))),
                "why_list": why, "is_diverse": False,
            })

        for i in div_idx:
            i = int(i)
            if i in seen_set or i >= n:
                continue
            seen_set.add(i)
            row = self.df.iloc[i]
            results.append({
                "title": row["title"], "genres": row["listed_in"],
                "description": str(row.get("description", "")),
                "release_year": int(row["release_year"]), "popularity": float(row["popularity"]),
                "country": row["country"],
                "match_score": max(20, int(float(self.df["pop_norm"].iloc[i]) * 55)),
                "why_list": ["Outside your usual taste — you might love it!"],
                "is_diverse": True,
            })

        taste_summary = {
            "genres": list(genre_affinity.keys())[:5],
            "countries": self._compute_country_affinity(watched, ratings),
            "total_movies": len(watched) + len(watching) + len(want),
            "genre_affinity": dict(list(genre_affinity.items())[:10]),
        }
        return {"picks": results, "taste_summary": taste_summary, "total": len(results)}

    # ── Private helpers ────────────────────────────────────────────────────────

    def _find_idx(self, title: str) -> Optional[int]:
        m = self.df[self.df["title"].str.lower() == title.strip().lower()]
        return int(m.index[0]) if not m.empty else None

    def _compute_genre_affinity(self, watched: list, ratings: dict) -> dict:
        scores: dict = {}
        total = 0.0
        rw = {5: 2.0, 4: 1.5, 3: 1.0, 2: 0.3, 1: -0.5}
        for movie in watched:
            idx = self._find_idx(movie)
            if idx is None:
                continue
            gs = [g.strip() for g in str(self.df.iloc[idx].get("listed_in", "")).split(",") if g.strip()]
            w = rw.get(int(ratings.get(movie, 3)), 1.0)
            for g in gs:
                scores[g] = scores.get(g, 0.0) + w
            total += abs(w)
        if total == 0:
            return {}
        aff = {g: round(max(0.0, s / total), 3) for g, s in scores.items()}
        return dict(sorted(aff.items(), key=lambda x: -x[1])[:20])

    def _compute_country_affinity(self, watched: list, ratings: dict) -> list:
        scores: dict = {}
        rw = {5: 2.0, 4: 1.5, 3: 1.0, 2: 0.3, 1: 0.0}
        for movie in watched:
            idx = self._find_idx(movie)
            if idx is None:
                continue
            cs = [c.strip() for c in str(self.df.iloc[idx].get("country", "")).split(",") if c.strip() and c.strip() != "Unknown"]
            w = rw.get(int(ratings.get(movie, 3)), 1.0)
            for c in cs:
                scores[c] = scores.get(c, 0.0) + w
        return sorted(scores.keys(), key=lambda c: -scores[c])[:5]

    def _build_why(self, row, watched: list, ratings: dict, genre_affinity: dict) -> list:
        why = []
        row_genres = set(g.strip() for g in str(row.get("listed_in", "")).split(","))
        best_match, best_rating = None, 0
        for movie in watched:
            idx = self._find_idx(movie)
            if idx is None:
                continue
            m_genres = set(g.strip() for g in str(self.df.iloc[idx].get("listed_in", "")).split(","))
            if row_genres & m_genres:
                r = int(ratings.get(movie, 3))
                if r > best_rating:
                    best_rating, best_match = r, movie
        if best_match:
            shared = row_genres & set(g.strip() for g in str(self.df.iloc[self._find_idx(best_match)].get("listed_in", "")).split(","))
            stars = "★" * best_rating
            why.append(f"Based on {best_match} ({stars}) · {', '.join(list(shared)[:2])}")
        top_g = next((g for g in genre_affinity if g in row_genres), None)
        if top_g:
            pct = int(genre_affinity[top_g] * 100)
            why.append(f"Matches your {top_g} taste ({pct}% affinity)")
        if not why:
            why.append("Matches your overall taste profile")
        return why

    def get_top_movies_for_onboarding(self, n: int = 50) -> List[dict]:
        """Return top-N most popular movies for the onboarding flow."""
        top = self.df.nlargest(n, "popularity")
        return top[["title", "listed_in", "release_year", "popularity", "country", "description"]].to_dict(orient="records")
