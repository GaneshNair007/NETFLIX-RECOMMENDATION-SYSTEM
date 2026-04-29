import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getMetadata } from '../api/api'
import { useUserList } from '../context/UserListContext'

export default function HeroBanner({ movie }) {
    const navigate = useNavigate()
    const { addToList } = useUserList()
    const [backdrop, setBackdrop] = useState(null)
    const [visible, setVisible] = useState(true)

    useEffect(() => {
        if (!movie) return
        getMetadata(movie.title)
            .then((meta) => meta.backdrop_url && setBackdrop(meta.backdrop_url))
            .catch(() => { })
    }, [movie])

    // Cycle subtitle visibility
    useEffect(() => {
        const timer = setInterval(() => setVisible((v) => !v), 4000)
        return () => clearInterval(timer)
    }, [])

    if (!movie) return <div className="h-screen skeleton" />

    const bgStyle = backdrop
        ? { backgroundImage: `url(${backdrop})`, backgroundSize: 'cover', backgroundPosition: 'center top' }
        : { background: 'linear-gradient(135deg, #1a0000, #2a0005, #141414)' }

    return (
        <div className="relative h-[70vh] md:h-[85vh] w-full overflow-hidden" style={bgStyle}>
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-transparent to-black/30" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end pb-16 md:pb-24 px-[5%] max-w-2xl">
                {/* Genre chips */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex flex-wrap gap-2 mb-4"
                >
                    {(movie.genres || movie.listed_in || '').split(',').slice(0, 3).map((g) => (
                        <span key={g} className="genre-chip">{g.trim()}</span>
                    ))}
                </motion.div>

                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.35 }}
                    className="text-4xl md:text-6xl font-black text-white leading-tight mb-4 drop-shadow-2xl"
                >
                    {movie.title}
                </motion.h1>

                {/* Description */}
                <AnimatePresence mode="wait">
                    {visible && (
                        <motion.p
                            key="desc"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-netflix-gray-light text-sm md:text-base max-w-lg mb-6 line-clamp-3"
                        >
                            {movie.description}
                        </motion.p>
                    )}
                </AnimatePresence>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="flex flex-wrap gap-3"
                >
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="btn-red flex items-center gap-2 text-sm md:text-base px-6 py-2.5"
                        onClick={() => navigate(`/movie/${encodeURIComponent(movie.title)}`)}
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                        More Info
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="btn-ghost flex items-center gap-2 text-sm md:text-base px-6 py-2.5"
                        onClick={() => addToList(movie.title, 'want')}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add to List
                    </motion.button>
                </motion.div>

                {/* Popularity badge */}
                {movie.popularity > 0 && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-4 text-xs text-white/60"
                    >
                        🔥 Popularity score: <span className="text-netflix-red font-semibold">{Number(movie.popularity).toFixed(1)}</span>
                        {movie.country && <span className="ml-2">· 🌍 {movie.country}</span>}
                    </motion.p>
                )}
            </div>
        </div>
    )
}
