# 🎬 CineTrack

<<<<<<< HEAD
> A Netflix-style movie recommendation and tracking web application — built with FastAPI + React + TF-IDF cosine similarity.

![Stack](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)
![Stack](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=flat-square&logo=react)
![Stack](https://img.shields.io/badge/ML-TF--IDF%20%2B%20Cosine-E50914?style=flat-square)

---

## Quick Start

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
cd "\cinetrack-backend"

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
cd "\cinetrack-frontend"

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
=======
A production-ready Netflix-style movie recommendation web application built with **FastAPI**, **React (Vite)**, and **content-based machine learning**.

CineTrack helps users discover movies and series using an intelligent recommendation engine powered by **TF-IDF + Cosine Similarity**, while delivering a modern streaming-platform user experience.

---

## 🚀 Live Demo

🌐 **Website:** 
💻 **Frontend Repo:** *Add repo link here*
⚙️ **Backend API:** *Add backend link here*

---

## 📌 Features

### Smart Recommendation Engine

* Content-based filtering using:

  * Genres
  * Descriptions
  * Metadata similarity
* TF-IDF vectorization
* Cosine similarity scoring
* Re-ranking using popularity + vote count

###  Netflix-Style Frontend

* Hero banner
* Horizontal movie rows
* Smooth hover animations
* Responsive UI
* Dark streaming-platform theme

###  Search & Discovery

* Real-time search suggestions
* Movie detail pages
* Similar content recommendations
* Personalized discovery rows

###  User Tracking System

Track content in three categories:

* Watched
* Watching
* Want to Watch

###  Analytics Dashboard

* Taste profile by genres
* Watch statistics
* Year trends
* Country popularity map

###  Team Credits Section

Interactive team cards with hover glow animations.

---

## 🛠️ Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* Framer Motion
* Axios
* Chart.js
* React Simple Maps
MADE WITG ANTIGRAVITY
### Backend

* FastAPI
* Python
* Pandas
* NumPy
* Scikit-learn
* Uvicorn
MADE WITH ANTU GRAVITY 

### Machine Learning

*MATPLOTLIB FOR VISUALIZATION 
*PLOTY X FOR VISUALIZATION
*SKLEARN FOR ML
*NUMPY PANDAS FOR EDA 
---

##  Recommendation Logic

The recommendation system uses content similarity between titles.

### Final Score Formula

```python
final_score =
0.7 * similarity +
0.2 * popularity +
0.1 * vote_count
```

### Why This Approach?

* Fast and lightweight
* Explainable recommendations
* No heavy GPU or deep learning required
* Scalable for web deployment

---

## 📂 Project Structure

```bash
cinetrack/
│
├── cinetrack-backend/
│   ├── app.py
│   ├── recommender.py
│   ├── routes/
│   ├── data/
│   └── requirements.txt
│
└── cinetrack-frontend/
    ├── src/
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

---

## ⚙️ Installation

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/cinetrack.git
cd cinetrack
```

---

### 2️⃣ Backend Setup

```bash
cd cinetrack-backend
pip install -r requirements.txt
uvicorn app:app --reload
```

Backend runs on:

```bash
http://localhost:8000
```

API docs:

```bash
http://localhost:8000/docs
```

---

### 3️⃣ Frontend Setup

```bash
cd cinetrack-frontend
npm install
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
>>>>>>> f6fe06321be400160a2957ca324d49c09078772a
```

---

<<<<<<< HEAD
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
=======
## 🔐 Environment Variables

Create `.env` inside backend folder:

```env
TMDB_API_KEY=your_tmdb_api_key_here
```

Get free API key from TMDB.

---

## 📡 API Endpoints

### Recommendation

```http
GET /recommend?movie=Inception
```

### Search

```http
GET /search?q=bat
```

### Update User List

```http
POST /user/update
```

### Dashboard

```http
GET /dashboard
```

### Country Analytics

```http
GET /country-analytics
>>>>>>> f6fe06321be400160a2957ca324d49c09078772a
```

---

<<<<<<< HEAD
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
=======
## 📈 Performance Optimizations

* On-the-fly cosine similarity (memory efficient)
* Cached recommendation responses
* Lazy loaded images
* Debounced search
* Optimized React rendering

---

## 🎥 Screenshots

*Add screenshots here*

* Home Page
* Recommendation Section
* Dashboard
* Search
* My List

---

## 👨‍💻 Team

| Name        | Role               |
| ----------- | ------------------ |
| Ganesh Nair | ML / Data engineering      |
| Raghu       | ML       |
| arjit       | AI / webdev |

---

## 🌟 Future Improvements

* User authentication
* Ratings & reviews
* Collaborative filtering
* Watch history sync
* Multi-platform recommendations

---

## 🤝 Contributing

Pull requests and suggestions are welcome.

---

## 📜 License

MIT License

---

## ⭐ Support

If this project helped or inspired you, consider giving it a **star** on GitHub.

---

## 💡 Tagline

> CineTrack — Discover What to Watch Next.
>>>>>>> f6fe06321be400160a2957ca324d49c09078772a
