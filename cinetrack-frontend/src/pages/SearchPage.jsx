import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { searchMovies } from '../api/api'
import { useUserList } from '../context/UserListContext'
import MovieCard from '../components/MovieCard'

const PAGE = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
}

export default function SearchPage() {
    const [params] = useSearchParams()
    const navigate = useNavigate()
    const [query, setQuery] = useState(params.get('q') || '')
    const [results, setResults] = useState([])
    const [suggestions, setSuggestions] = useState([])
    const [loading, setLoading] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const debounceRef = useRef(null)
    const inputRef = useRef(null)

    const doSearch = useCallback(async (q) => {
        if (!q.trim()) { setResults([]); setSuggestions([]); return }
        setLoading(true)
        try {
            const data = await searchMovies(q)
            setResults(data.results || [])
            setSuggestions((data.results || []).slice(0, 6))
        } catch { setResults([]) }
        finally { setLoading(false) }
    }, [])

    // Debounce for suggestions
    useEffect(() => {
        clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => doSearch(query), 280)
        return () => clearTimeout(debounceRef.current)
    }, [query, doSearch])

    // Run search from URL param on mount
    useEffect(() => {
        const q = params.get('q')
        if (q) { setQuery(q); doSearch(q) }
    }, []) // eslint-disable-line

    const handleSubmit = (e) => {
        e.preventDefault()
        setShowSuggestions(false)
        navigate(`/search?q=${encodeURIComponent(query)}`)
        doSearch(query)
    }

    return (
        <motion.div {...PAGE} className="min-h-screen pt-24 pb-20 px-[5%]">
            <h1 className="text-3xl md:text-4xl font-black text-white mb-8">Search</h1>

            {/* Search bar */}
            <div className="relative max-w-2xl mb-10">
                <form onSubmit={handleSubmit} className="flex gap-3">
                    <div className="relative flex-1">
                        <input
                            ref={inputRef}
                            value={query}
                            onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true) }}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                            onFocus={() => results.length > 0 && setShowSuggestions(true)}
                            placeholder="Search movies, genres…"
                            className="w-full bg-[#1f1f1f] border border-white/10 focus:border-netflix-red text-white px-5 py-3.5 rounded-xl text-sm outline-none transition placeholder-white/30"
                        />
                        {/* Suggestions dropdown */}
                        <AnimatePresence>
                            {showSuggestions && suggestions.length > 0 && (
                                <motion.ul
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    className="absolute top-full left-0 right-0 mt-1 bg-[#1f1f1f] border border-white/10 rounded-xl shadow-2xl z-30 overflow-hidden"
                                >
                                    {suggestions.map((movie) => (
                                        <li
                                            key={movie.title}
                                            onMouseDown={() => {
                                                setQuery(movie.title)
                                                setShowSuggestions(false)
                                                navigate(`/movie/${encodeURIComponent(movie.title)}`)
                                            }}
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-netflix-red/15 cursor-pointer border-b border-white/5 last:border-0 transition"
                                        >
                                            <span className="text-netflix-red text-sm">🎬</span>
                                            <div>
                                                <p className="text-white text-sm font-medium">{movie.title}</p>
                                                <p className="text-white/40 text-xs">{movie.genres} · {movie.release_year}</p>
                                            </div>
                                        </li>
                                    ))}
                                </motion.ul>
                            )}
                        </AnimatePresence>
                    </div>
                    <button type="submit" className="btn-red px-6">
                        Search
                    </button>
                </form>
            </div>

            {/* Results */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-netflix-red border-t-transparent rounded-full animate-spin" />
                </div>
            ) : results.length > 0 ? (
                <>
                    <p className="text-white/50 text-sm mb-5">{results.length} result{results.length !== 1 ? 's' : ''} for "{query}"</p>
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5"
                    >
                        {results.map((movie, i) => (
                            <MovieCard key={movie.title} movie={movie} index={i} />
                        ))}
                    </motion.div>
                </>
            ) : query ? (
                <div className="text-center py-24">
                    <div className="text-6xl mb-4">🔍</div>
                    <p className="text-white/40 text-sm">No results for "{query}"</p>
                    <p className="text-white/20 text-xs mt-2">Try a different title or genre</p>
                </div>
            ) : (
                <div className="text-center py-24">
                    <div className="text-6xl mb-4">🎬</div>
                    <p className="text-white/40 text-sm">Start typing to discover movies</p>
                </div>
            )}
        </motion.div>
    )
}
