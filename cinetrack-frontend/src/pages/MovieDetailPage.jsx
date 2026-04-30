import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getRecommendations, getMetadata } from '../api/api'
import { useUserList } from '../context/UserListContext'
import MovieRow from '../components/MovieRow'
import StarRating from '../components/StarRating'

const PAGE = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.45 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
}

export default function MovieDetailPage() {
    const { title } = useParams()
    const navigate = useNavigate()
    const { addToList, getState, rateMovie, ratings } = useUserList()
    const [recs, setRecs] = useState(null)
    const [meta, setMeta] = useState(null)
    const [loading, setLoading] = useState(true)
    const decodedTitle = decodeURIComponent(title)
    const state = getState(decodedTitle)
    const userRating = ratings[decodedTitle] || 0

    useEffect(() => {
        setLoading(true)
        Promise.all([
            getRecommendations(decodedTitle).catch(() => null),
            getMetadata(decodedTitle).catch(() => null),
        ]).then(([recData, metaData]) => {
            setRecs(recData)
            setMeta(metaData)
            setLoading(false)
        })
    }, [decodedTitle])

    const stateLabel = { watched: '✓ Watched', watching: '▶ Watching', want: '+ Wanted' }
    const stateColors = { watched: 'text-green-400', watching: 'text-yellow-400', want: 'text-blue-400' }

    if (loading) {
        return (
            <motion.div {...PAGE} className="min-h-screen flex items-center justify-center pt-20">
                <div className="w-10 h-10 border-4 border-netflix-red border-t-transparent rounded-full animate-spin" />
            </motion.div>
        )
    }

    const movie = recs || {}
    const backdrop = meta?.backdrop_url
    const poster = meta?.poster_url

    return (
        <motion.div {...PAGE} className="min-h-screen pt-16">
            {/* Backdrop */}
            <div className="relative h-72 md:h-96 w-full overflow-hidden">
                {backdrop ? (
                    <img src={backdrop} alt="" className="w-full h-full object-cover object-center opacity-40" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-netflix-red/20 to-netflix-black" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-netflix-black/60 to-transparent" />
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-6 left-6 glass px-4 py-2 text-sm text-white rounded-full flex items-center gap-2 hover:bg-white/10 transition"
                >
                    ← Back
                </button>
            </div>

            {/* Main content */}
            <div className="px-[5%] -mt-32 relative z-10 flex flex-col md:flex-row gap-8 items-start">
                {/* Poster */}
                <div className="flex-shrink-0 w-40 md:w-56 rounded-xl overflow-hidden shadow-2xl border border-white/10">
                    <img
                        src={poster || `https://via.placeholder.com/300x450/141414/E50914?text=${encodeURIComponent(decodedTitle)}`}
                        alt={decodedTitle}
                        className="w-full h-auto object-cover"
                    />
                </div>

                {/* Info */}
                <div className="flex-1 pt-4 md:pt-20">
                    <h1 className="text-3xl md:text-5xl font-black text-white mb-3">{decodedTitle}</h1>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        {meta?.tmdb_rating > 0 && (
                            <span className="flex items-center gap-1 text-yellow-400 font-semibold text-sm">
                                ⭐ {Number(meta.tmdb_rating).toFixed(1)}
                            </span>
                        )}
                        {state && (
                            <span className={`text-sm font-semibold ${stateColors[state]}`}>
                                {stateLabel[state]}
                            </span>
                        )}
                    </div>

                    {/* Genre chips */}
                    {movie.detailed?.[0]?.genres &&
                        movie.detailed[0].genres.split(',').map((g) => (
                            <span key={g} className="genre-chip mr-2 mb-2 inline-block">{g.trim()}</span>
                        ))}

                    {/* Description */}
                    <p className="text-netflix-gray-light text-sm md:text-base mt-4 max-w-2xl leading-relaxed">
                        {meta?.overview || movie.detailed?.[0]?.description || 'No description available.'}
                    </p>

                    {/* Add to list buttons */}
                    <div className="flex flex-wrap gap-3 mt-6">
                        {[
                            { label: '✓ Watched', value: 'watched', color: 'bg-green-700 hover:bg-green-600' },
                            { label: '▶ Watching', value: 'watching', color: 'bg-yellow-700 hover:bg-yellow-600' },
                            { label: '+ Want', value: 'want', color: 'bg-blue-700 hover:bg-blue-600' },
                        ].map((opt) => (
                            <motion.button
                                key={opt.value}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => addToList(decodedTitle, opt.value)}
                                className={`px-4 py-2 rounded text-white text-sm font-semibold transition ${opt.color} ${state === opt.value ? 'ring-2 ring-white' : ''}`}
                            >
                                {opt.label}
                            </motion.button>
                        ))}
                    </div>

                    {/* Star Rating */}
                    <div className="mt-5">
                        <p className="text-white/40 text-xs mb-2 uppercase tracking-wider font-semibold">Rate this movie</p>
                        <StarRating
                            movie={decodedTitle}
                            initialRating={userRating}
                            onRate={rateMovie}
                            size="lg"
                        />
                        {userRating > 0 && (
                            <p className="text-white/30 text-xs mt-2">
                                Your rating influences your personalized recommendations
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Personalized Picks */}
            {movie.detailed?.length > 1 && (
                <div className="mt-12 pb-16">
                    <MovieRow title="🎯 You Might Also Like" movies={movie.detailed.slice(1)} />
                </div>
            )}
        </motion.div>
    )
}
