import axios from 'axios'

// In production (Vercel), set VITE_API_URL to your Render backend URL.
// In local dev, falls back to '/api' which vite.config.js proxies to localhost:8000
const BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({ baseURL: BASE, timeout: 15000 })

export const getRecommendations = (movie) =>
    api.get('/recommend', { params: { movie } }).then((r) => r.data)

export const searchMovies = (q) =>
    api.get('/search', { params: { q } }).then((r) => r.data)

export const updateUserList = (movie, state) =>
    api.post('/user/update', { movie, state }).then((r) => r.data)

export const removeFromList = (movie) =>
    api.post('/user/remove', { movie }).then((r) => r.data)

export const getUserLists = () =>
    api.get('/user/lists').then((r) => r.data)

export const getDashboard = () =>
    api.get('/dashboard').then((r) => r.data)

export const getCountryAnalytics = () =>
    api.get('/country-analytics').then((r) => r.data)

export const getMetadata = (title) =>
    api.get('/metadata', { params: { title } }).then((r) => r.data)

export const getTrending = () =>
    api.get('/trending').then((r) => r.data)

export const getByGenre = (genre) =>
    api.get(`/genre/${encodeURIComponent(genre)}`).then((r) => r.data)

// ── Personalization ────────────────────────────────────────────────────────────

export const getPersonalized = (profile, filters = {}, top_n = 30) =>
    api.post('/personalized', { profile, filters, top_n }).then((r) => r.data)

export const rateMovie = (movie, rating) =>
    api.post('/user/rate', { movie, rating }).then((r) => r.data)

export const getUserProfile = () =>
    api.get('/user/profile').then((r) => r.data)

export const submitOnboarding = (picks, ratings = {}) =>
    api.post('/user/onboard', { picks, ratings }).then((r) => r.data)

export const getOnboardingMovies = () =>
    api.get('/onboarding-movies').then((r) => r.data)

export default api
