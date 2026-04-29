import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserList } from '../context/UserListContext'
import { getMetadata } from '../api/api'

const LIST_OPTIONS = [
    { label: '✓ Watched', value: 'watched' },
    { label: '▶ Watching', value: 'watching' },
    { label: '+ Want to Watch', value: 'want' },
]

// Deterministic gradient so every card always shows a unique colour from the start
const GRADIENTS = [
    ['#7f1d1d', '#b91c1c'], // red
    ['#1e1b4b', '#4338ca'], // indigo
    ['#064e3b', '#059669'], // emerald
    ['#78350f', '#d97706'], // amber
    ['#4a044e', '#a21caf'], // purple
    ['#831843', '#db2777'], // pink
    ['#164e63', '#0891b2'], // cyan
    ['#431407', '#ea580c'], // orange
]

function gradientFor(title) {
    let h = 0
    for (let i = 0; i < title.length; i++) h = title.charCodeAt(i) + ((h << 5) - h)
    return GRADIENTS[Math.abs(h) % GRADIENTS.length]
}

// Module-level poster cache — persists across renders, prevents duplicate fetches
const _posterCache = {}

export default function MovieCard({ movie, index = 0 }) {
    const navigate = useNavigate()
    const { addToList, getState } = useUserList()
    const [hovered, setHovered] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [poster, setPoster] = useState(() => _posterCache[movie.title] ?? null)
    const [posterFailed, setPosterFailed] = useState(false)
    const [trailerKey, setTrailerKey] = useState(null)
    const [showTrailer, setShowTrailer] = useState(false)
    const hoverTimer = useRef(null)
    const didFetch = useRef(_posterCache[movie.title] !== undefined)
    const state = getState(movie.title)
    const [from, to] = gradientFor(movie.title)

    // ── Load poster LAZILY — only on first hover, never on mount ────────────
    // Fixes: 75+ simultaneous TMDB API calls that froze the home page.
    const handleMouseEnter = () => {
        setHovered(true)
        hoverTimer.current = setTimeout(() => setShowTrailer(true), 1500)

        if (didFetch.current) return   // already fetched or cached
        didFetch.current = true
        getMetadata(movie.title)
            .then((meta) => {
                const url = meta?.poster_url?.includes('image.tmdb.org') ? meta.poster_url : null
                _posterCache[movie.title] = url
                setPoster(url)
                if (meta?.trailer_key) setTrailerKey(meta.trailer_key)
            })
            .catch(() => { _posterCache[movie.title] = null })
    }

    const handleMouseLeave = () => {
        setHovered(false)
        setShowTrailer(false)
        setMenuOpen(false)
        clearTimeout(hoverTimer.current)
    }

    const stateColors = { watched: 'text-green-400', watching: 'text-yellow-400', want: 'text-blue-400' }
    const hasPoster = poster && !posterFailed

    return (
        <motion.div
            className="relative flex-shrink-0 w-40 md:w-48 cursor-pointer select-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
            whileHover={{ scale: 1.08, zIndex: 20 }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => navigate(`/movie/${encodeURIComponent(movie.title)}`)}
            style={{ transformOrigin: 'center bottom' }}
        >
            {/* Card face */}
            <div className="relative rounded-lg overflow-hidden aspect-[2/3] shadow-2xl">

                {/* ── YouTube trailer (1.5 s hover delay) ── */}
                {showTrailer && trailerKey && (
                    <iframe
                        src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerKey}&modestbranding=1`}
                        className="absolute inset-0 w-full h-full"
                        allow="autoplay"
                        title="Trailer"
                    />
                )}

                {/* ── Real TMDB poster ── */}
                {hasPoster && !showTrailer && (
                    <img
                        src={poster}
                        alt={movie.title}
                        loading="lazy"
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${hovered ? 'brightness-110 scale-105' : 'brightness-90'}`}
                        onError={() => setPosterFailed(true)}
                    />
                )}

                {/* ── CSS gradient fallback (always present, hidden behind poster) ── */}
                {!hasPoster && !showTrailer && (
                    <div
                        className={`absolute inset-0 flex flex-col items-center justify-center p-3 transition-all duration-500 ${hovered ? 'brightness-125' : 'brightness-90'}`}
                        style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                    >
                        {/* Film reel icon */}
                        <svg className="w-10 h-10 mb-3 opacity-30" fill="white" viewBox="0 0 24 24">
                            <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z" />
                        </svg>
                        <p className="text-white font-bold text-[11px] text-center leading-tight line-clamp-3 drop-shadow">
                            {movie.title}
                        </p>
                        {movie.genres && (
                            <p className="text-white/50 text-[9px] text-center mt-1 line-clamp-1">
                                {movie.genres.split(',')[0].trim()}
                            </p>
                        )}
                        {movie.release_year && (
                            <p className="text-white/40 text-[9px] mt-0.5">{movie.release_year}</p>
                        )}
                    </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                {/* State badge */}
                {state && (
                    <span className={`absolute top-2 left-2 text-[10px] font-bold ${stateColors[state]}`}>
                        {state === 'watched' ? '✓' : state === 'watching' ? '▶' : '+'}
                    </span>
                )}

                {/* Year chip */}
                {hasPoster && movie.release_year && (
                    <span className="absolute top-2 right-2 text-[10px] text-white/70 bg-black/60 px-1.5 py-0.5 rounded">
                        {movie.release_year}
                    </span>
                )}
            </div>

            {/* Title below card */}
            <p className="text-white/60 text-[11px] font-medium truncate mt-1.5 px-0.5">{movie.title}</p>

            {/* Hover popup */}
            <AnimatePresence>
                {hovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.18 }}
                        className="absolute top-full left-0 right-0 z-30 bg-[#1f1f1f] border border-white/10 rounded-b-lg p-3 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <p className="text-white font-semibold text-xs truncate mb-1">{movie.title}</p>
                        <p className="text-netflix-gray-light text-[10px] truncate mb-2">{movie.genres}</p>
                        <div className="flex gap-1">
                            <button
                                className="btn-red text-[10px] px-2 py-1 flex-1"
                                onClick={() => navigate(`/movie/${encodeURIComponent(movie.title)}`)}
                            >
                                Details
                            </button>
                            <div className="relative">
                                <button
                                    className="btn-ghost text-[10px] px-2 py-1"
                                    onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v) }}
                                >
                                    + List
                                </button>
                                <AnimatePresence>
                                    {menuOpen && (
                                        <motion.ul
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="absolute bottom-full right-0 mb-1 bg-[#2a2a2a] border border-white/10 rounded shadow-xl z-50 min-w-[130px]"
                                        >
                                            {LIST_OPTIONS.map((opt) => (
                                                <li
                                                    key={opt.value}
                                                    className={`px-3 py-2 text-[11px] cursor-pointer hover:bg-netflix-red/20 transition-colors ${state === opt.value ? 'text-netflix-red' : 'text-white'}`}
                                                    onClick={() => { addToList(movie.title, opt.value); setMenuOpen(false) }}
                                                >
                                                    {opt.label}
                                                </li>
                                            ))}
                                        </motion.ul>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
