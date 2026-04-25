# 🎬 CineTrack

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
```

---

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
```

---

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
