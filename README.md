# 🎬 CineTrack

> A Netflix-style movie recommendation and tracking web application — built with FastAPI + React + TF-IDF cosine similarity.

![Stack](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)
![Stack](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=flat-square&logo=react)
![Stack](https://img.shields.io/badge/ML-TF--IDF%20%2B%20Cosine-E50914?style=flat-square)

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Python | 3.9+ | https://python.org/downloads |
| Node.js | 18+ | https://nodejs.org |

> ⚠️ After installing Python, **restart your terminal/VSCode** so `python` is in your PATH.

---

### Step 1 — Run the Backend

Open a terminal and run:

```powershell
cd "C:\Users\Ganesh Nair\OneDrive\Desktop\New folder\cinetrack-backend"

# Install Python packages
python -m pip install -r requirements.txt

# Generate the dataset (creates data/final_df.csv)
python generate_dataset.py

# Start the API server
python -m uvicorn app:app --reload --port 8000
```

✅ Backend is running at → **http://localhost:8000**  
📖 Interactive API docs → **http://localhost:8000/docs**

---

### Step 2 — Run the Frontend

Open a **second terminal**:

```powershell
cd "C:\Users\Ganesh Nair\OneDrive\Desktop\New folder\cinetrack-frontend"

# Install npm packages (first time only)
npm install

# Start the dev server
npm run dev
```

✅ App is running at → **http://localhost:5173**

---

### One-Click Scripts (Windows)

Double-click or run in PowerShell:

```powershell
# Terminal 1: Backend
.\cinetrack-backend\start.bat

# Terminal 2: Frontend
.\cinetrack-frontend\start.bat
```

---

## 🔑 TMDB API Key (Optional — for real posters)

1. Sign up at https://www.themoviedb.org/settings/api (free)
2. Copy `.env.example` → `.env` inside `cinetrack-backend/`
3. Replace `your_tmdb_api_key_here` with your key
4. Restart the backend

Without the key, the app shows styled placeholder images — everything still works.

---

## 📁 Project Structure

```
New folder/
├── cinetrack-backend/          ← FastAPI + ML engine
│   ├── app.py                  ← Main entrypoint + CORS
│   ├── recommender.py          ← TF-IDF + on-the-fly cosine similarity
│   ├── generate_dataset.py     ← Creates data/final_df.csv
│   ├── requirements.txt
│   ├── .env.example            ← Copy to .env and add TMDB key
│   ├── start.bat
│   └── routes/
│       ├── recommend.py        ← GET /recommend?movie=Inception
│       ├── search.py           ← GET /search?q=inc
│       ├── user.py             ← POST /user/update  GET /user/lists
│       ├── dashboard.py        ← GET /dashboard
│       ├── country.py          ← GET /country-analytics
│       └── metadata.py         ← GET /metadata?title=Inception (TMDB proxy)
│
└── cinetrack-frontend/         ← React + Vite + Tailwind
    ├── src/
    │   ├── App.jsx             ← Router + Framer Motion transitions
    │   ├── api/api.js          ← Axios wrappers for all endpoints
    │   ├── context/
    │   │   └── UserListContext.jsx ← Global list state + localStorage
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── HeroBanner.jsx
    │   │   ├── MovieCard.jsx   ← Hover trailer + add-to-list
    │   │   ├── MovieRow.jsx    ← Horizontal scroll row
    │   │   └── TeamCredits.jsx ← Ganesh / Raghu / Avik cards
    │   └── pages/
    │       ├── HomePage.jsx
    │       ├── MovieDetailPage.jsx
    │       ├── MyListPage.jsx
    │       ├── DashboardPage.jsx
    │       └── SearchPage.jsx
    └── start.bat
```

---

## 🌐 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/recommend?movie=Inception` | Top 10 similar movies |
| `GET` | `/search?q=inc` | Title search (top 10) |
| `POST` | `/user/update` | `{ "movie": "...", "state": "watched" }` |
| `POST` | `/user/remove` | `{ "movie": "..." }` |
| `GET` | `/user/lists` | Get all watched/watching/want |
| `GET` | `/dashboard` | Taste profile + analytics |
| `GET` | `/country-analytics` | Avg popularity per country |
| `GET` | `/metadata?title=Inception` | TMDB poster + backdrop |
| `GET` | `/trending` | Top 20 by popularity |
| `GET` | `/genre/{genre}` | Top 20 in a genre |

Test all at → **http://localhost:8000/docs**

---

## 🤖 Recommendation Algorithm

```
final_score = 0.7 × cosine_similarity + 0.2 × popularity_norm + 0.1 × vote_count_norm
```

- **TF-IDF** on `genres + description`
- **On-the-fly** computation (no `O(N²)` matrix — memory safe)
- TF-IDF matrix **cached** to `data/tfidf_cache.pkl` after first build
- User list **persisted** to `data/user_data.json` (survives restarts)

---

## 📺 Features

| Feature | Details |
|---------|---------|
| 🏠 Home Page | Hero banner + 5 movie rows |
| 🎬 Movie Detail | Poster, backdrop, "Why Recommended", similar movies |
| 📚 My List | 3 tabs (Watched / Watching / Want) with move/remove |
| 📊 Dashboard | Genre donut chart + year bar chart + world choropleth map |
| 🔍 Search | Debounced autocomplete + results grid |
| 🎥 Hover Preview | YouTube trailer after 1.5s hover (muted) |
| ⚡ Animations | Framer Motion: page fade, card scale, hero entrance, counters |
| 🌍 Map | react-simple-maps choropleth coloured by avg popularity |
| 👥 Team Credits | Ganesh / Raghu / Avik — glow hover cards |

---

## 👥 Team

| Name | Role |
|------|------|
| **Ganesh** | ML / Backend — TF-IDF engine, FastAPI |
| **Raghu** | Frontend — React UI, animations |
| **Avik** | Data / Integration — pipeline, TMDB, charts |

---

## ⚠️ Troubleshooting

**`python` not found**
```powershell
# Try:
py -m pip install -r requirements.txt
py -m uvicorn app:app --reload --port 8000
```

**`npm` not found**  
Install Node.js from https://nodejs.org then restart your terminal.

**CORS errors in browser**  
Make sure the backend is running on port 8000 **before** opening the frontend.

**Map not loading**  
The choropleth fetches topology data from a CDN (`cdn.jsdelivr.net`) — ensure you have internet access.

**Poster images are grey boxes**  
Add your TMDB API key to `cinetrack-backend/.env` (see TMDB section above).
