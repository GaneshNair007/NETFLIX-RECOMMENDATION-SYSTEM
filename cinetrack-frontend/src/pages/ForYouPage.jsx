import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getPersonalized } from '../api/api'
import { useUserList } from '../context/UserListContext'
import StarRating from '../components/StarRating'

const PAGE = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
}

const MOODS = [
    { key: '', label: '🎯 Best Match', desc: 'Perfectly tailored for you' },
    { key: 'action', label: '🔥 Action Night', desc: 'Adrenaline-pumping picks' },
    { key: 'mind-bending', label: '🧠 Mind-Bending', desc: 'Twist your perspective' },
    { key: 'emotional', label: '😢 Emotional', desc: 'Deep, meaningful stories' },
    { key: 'comedy', label: '😂 Comedy Binge', desc: 'Laugh out loud picks' },
    { key: 'horror', label: '💀 Horror', desc: 'Spine-chilling selections' },
    { key: 'world', label: '🌍 World Cinema', desc: 'Global hidden gems' },
    { key: 'surprise', label: '🔮 Surprise Me', desc: 'Shake up your comfort zone' },
]

const ALL_GENRES = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Thriller', 'Sci-Fi',
    'Horror', 'Romance', 'Mystery', 'Animation', 'Documentary', 'Crime',
]

const matchColor = (score) => {
    if (score >= 80) return '#4ade80'
    if (score >= 60) return '#facc15'
    return '#fb923c'
}

function PickCard({ pick, onAdd, onRate, userRating }) {
    const navigate = useNavigate()
    const [showWhy, setShowWhy] = useState(false)

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-2xl overflow-hidden group cursor-pointer flex flex-col"
            style={{
                background: 'linear-gradient(145deg, #1a1a1a, #222)',
                border: pick.is_diverse
                    ? '1px solid rgba(168,85,247,0.3)'
                    : '1px solid rgba(255,255,255,0.06)',
                boxShadow: pick.is_diverse ? '0 0 20px rgba(168,85,247,0.08)' : 'none',
            }}
            onClick={() => navigate(`/movie/${encodeURIComponent(pick.title)}`)}
        >
            {/* Gradient top band */}
            <div
                className="h-2 w-full flex-shrink-0"
                style={{
                    background: pick.is_diverse
                        ? 'linear-gradient(90deg, #7c3aed, #a855f7)'
                        : `linear-gradient(90deg, ${matchColor(pick.match_score)}, transparent)`,
                }}
            />

            <div className="p-4 flex flex-col flex-1">
                {/* Badges row */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span
                        className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                            background: matchColor(pick.match_score) + '22',
                            color: matchColor(pick.match_score),
                            border: `1px solid ${matchColor(pick.match_score)}44`,
                        }}
                    >
                        {pick.match_score}% Match
                    </span>
                    {pick.is_diverse && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                            🔮 Expand Taste
                        </span>
                    )}
                </div>

                {/* Title */}
                <h3 className="text-white font-bold text-sm leading-tight mb-1 group-hover:text-[#E50914] transition line-clamp-2">
                    {pick.title}
                </h3>

                {/* Meta */}
                <p className="text-white/40 text-xs mb-2">
                    {pick.release_year} · {pick.country?.split(',')[0]?.trim()}
                </p>

                {/* Genre chips */}
                <div className="flex flex-wrap gap-1 mb-3">
                    {pick.genres?.split(',').slice(0, 2).map((g) => (
                        <span key={g} className="genre-chip text-[10px] px-2 py-0.5">
                            {g.trim()}
                        </span>
                    ))}
                </div>

                {/* Why recommended */}
                <button
                    onClick={(e) => { e.stopPropagation(); setShowWhy((v) => !v) }}
                    className="text-[10px] text-white/30 hover:text-[#E50914] transition text-left mb-2"
                >
                    {showWhy ? '▲ Hide reason' : '▼ Why this pick?'}
                </button>
                <AnimatePresence>
                    {showWhy && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mb-2"
                        >
                            {pick.why_list?.map((w, i) => (
                                <p key={i} className="text-white/50 text-[10px] italic border-l-2 border-[#E50914]/40 pl-2 mb-1">
                                    {w}
                                </p>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-auto pt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
                    {/* Star rating */}
                    <StarRating
                        movie={pick.title}
                        initialRating={userRating || 0}
                        onRate={onRate}
                        size="sm"
                    />
                    {/* Quick add */}
                    <div className="flex gap-1.5">
                        {[
                            { label: '✓', value: 'watched', color: '#16a34a' },
                            { label: '▶', value: 'watching', color: '#ca8a04' },
                            { label: '+', value: 'want', color: '#2563eb' },
                        ].map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => onAdd(pick.title, opt.value)}
                                className="flex-1 py-1.5 rounded-lg text-white text-xs font-bold transition-all hover:opacity-90"
                                style={{ background: opt.color + '33', border: `1px solid ${opt.color}55`, color: opt.color }}
                                title={opt.value}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default function ForYouPage() {
    const { lists, addToList, rateMovie, ratings, getProfile, getState } = useUserList()
    const [picks, setPicks] = useState([])
    const [tasteSummary, setTasteSummary] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeMood, setActiveMood] = useState('')
    const [filterGenres, setFilterGenres] = useState([])
    const [filterYear, setFilterYear] = useState([1980, 2024])
    const [showFilters, setShowFilters] = useState(false)
    const [sortBy, setSortBy] = useState('match')

    const hasHistory = lists.watched.length + lists.watching.length + lists.want.length > 0

    const fetchPicks = useCallback(async () => {
        setLoading(true)
        try {
            const profile = getProfile()
            const filters = {
                mood: activeMood,
                genres: filterGenres,
                year_from: filterYear[0],
                year_to: filterYear[1],
            }
            const data = await getPersonalized(profile, filters, 36)
            setPicks(data.picks || [])
            setTasteSummary(data.taste_summary || null)
        } catch (e) {
            console.error('ForYou fetch error', e)
        } finally {
            setLoading(false)
        }
    }, [activeMood, filterGenres, filterYear, lists, ratings])

    useEffect(() => { fetchPicks() }, [fetchPicks])

    const sortedPicks = [...picks].sort((a, b) => {
        if (sortBy === 'match') return b.match_score - a.match_score
        if (sortBy === 'year') return b.release_year - a.release_year
        if (sortBy === 'popular') return b.popularity - a.popularity
        return 0
    })

    const toggleGenre = (g) => {
        setFilterGenres((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g])
    }

    const affinityWidth = (g) => {
        if (!tasteSummary?.genre_affinity) return 0
        return Math.round((tasteSummary.genre_affinity[g] || 0) * 100)
    }

    return (
        <motion.div {...PAGE} className="min-h-screen pt-20 pb-20">
            {/* ── Header: Taste DNA ─────────────────────────── */}
            <div
                className="mx-[4%] mb-6 rounded-3xl p-6 md:p-8 relative overflow-hidden"
                style={{
                    background: 'linear-gradient(135deg, #1a0a0a 0%, #0d0d1a 50%, #0a1a0a 100%)',
                    border: '1px solid rgba(229,9,20,0.15)',
                }}
            >
                <div className="absolute inset-0 opacity-5"
                    style={{ background: 'radial-gradient(circle at 20% 50%, #E50914 0%, transparent 60%), radial-gradient(circle at 80% 50%, #7c3aed 0%, transparent 60%)' }} />

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                        <div>
                            <p className="text-[#E50914] font-bold text-xs uppercase tracking-widest mb-1">✨ Personalized For You</p>
                            <h1 className="text-white font-black text-3xl md:text-4xl">Your Taste DNA</h1>
                            {tasteSummary && (
                                <p className="text-white/40 text-sm mt-1">
                                    Based on {tasteSummary.total_movies} movies you've tracked
                                </p>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-white/5 border border-white/10 text-white/70 text-xs rounded-lg px-3 py-2 outline-none"
                            >
                                <option value="match">Sort: Best Match</option>
                                <option value="popular">Sort: Most Popular</option>
                                <option value="year">Sort: Newest</option>
                            </select>
                            <button
                                onClick={() => setShowFilters((v) => !v)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${showFilters ? 'bg-[#E50914] text-white' : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'}`}
                            >
                                {showFilters ? '✕ Filters' : '⚙ Filters'}
                            </button>
                        </div>
                    </div>

                    {/* Genre affinity pills */}
                    {tasteSummary?.genres?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {tasteSummary.genres.map((g) => (
                                <div key={g} className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                                    style={{ background: 'rgba(229,9,20,0.12)', border: '1px solid rgba(229,9,20,0.25)' }}>
                                    <span className="text-[#E50914] font-semibold text-xs">{g}</span>
                                    {affinityWidth(g) > 0 && (
                                        <span className="text-white/40 text-[10px]">{affinityWidth(g)}%</span>
                                    )}
                                </div>
                            ))}
                            {tasteSummary.countries?.map((c) => (
                                <div key={c} className="px-3 py-1.5 rounded-full"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <span className="text-white/60 text-xs">🌍 {c}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-white/30 text-sm">Add some movies to reveal your taste DNA →</p>
                    )}
                </div>
            </div>

            {/* ── Filter Panel ─────────────────────────────── */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mx-[4%] mb-5 overflow-hidden"
                    >
                        <div className="rounded-2xl p-5"
                            style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Genre filter */}
                                <div>
                                    <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-3">Genres</p>
                                    <div className="flex flex-wrap gap-2">
                                        {ALL_GENRES.map((g) => (
                                            <button
                                                key={g}
                                                onClick={() => toggleGenre(g)}
                                                className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                                                style={{
                                                    background: filterGenres.includes(g) ? 'rgba(229,9,20,0.2)' : 'rgba(255,255,255,0.05)',
                                                    border: filterGenres.includes(g) ? '1px solid #E50914' : '1px solid rgba(255,255,255,0.1)',
                                                    color: filterGenres.includes(g) ? '#E50914' : 'rgba(255,255,255,0.6)',
                                                }}
                                            >
                                                {g}
                                                {affinityWidth(g) > 0 && <span className="ml-1 opacity-50">{affinityWidth(g)}%</span>}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Year range */}
                                <div>
                                    <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-3">
                                        Year: {filterYear[0]} – {filterYear[1]}
                                    </p>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-white/40 text-xs w-8">From</span>
                                            <input type="range" min="1950" max="2024" value={filterYear[0]}
                                                onChange={(e) => setFilterYear([+e.target.value, filterYear[1]])}
                                                className="flex-1 accent-[#E50914]" />
                                            <span className="text-white/60 text-xs w-10">{filterYear[0]}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-white/40 text-xs w-8">To</span>
                                            <input type="range" min="1950" max="2024" value={filterYear[1]}
                                                onChange={(e) => setFilterYear([filterYear[0], +e.target.value])}
                                                className="flex-1 accent-[#E50914]" />
                                            <span className="text-white/60 text-xs w-10">{filterYear[1]}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { setFilterGenres([]); setFilterYear([1980, 2024]) }}
                                        className="mt-3 text-xs text-white/30 hover:text-[#E50914] transition"
                                    >
                                        Reset filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Mood Selector ────────────────────────────── */}
            <div className="px-[4%] mb-6">
                <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                    {MOODS.map((m) => (
                        <button
                            key={m.key}
                            onClick={() => setActiveMood(m.key)}
                            className="flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap"
                            style={{
                                background: activeMood === m.key
                                    ? 'linear-gradient(135deg, #E50914, #b20710)'
                                    : 'rgba(255,255,255,0.05)',
                                border: activeMood === m.key
                                    ? '1px solid #E50914'
                                    : '1px solid rgba(255,255,255,0.08)',
                                color: activeMood === m.key ? '#fff' : 'rgba(255,255,255,0.6)',
                                boxShadow: activeMood === m.key ? '0 0 20px rgba(229,9,20,0.25)' : 'none',
                            }}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>
                {activeMood && (
                    <p className="text-white/30 text-xs mt-2 pl-1">
                        {MOODS.find((m) => m.key === activeMood)?.desc}
                    </p>
                )}
            </div>

            {/* ── Main Grid ────────────────────────────────── */}
            <div className="px-[4%]">
                {!hasHistory && !loading ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-24"
                    >
                        <div className="text-6xl mb-4">🎬</div>
                        <h2 className="text-white font-black text-2xl mb-2">Your profile is empty</h2>
                        <p className="text-white/40 text-sm mb-6">
                            Add movies to your Watched / Watching / Want lists to unlock personalized picks.
                        </p>
                        <a href="/search"
                            className="inline-block px-8 py-3 rounded-xl font-bold text-white text-sm"
                            style={{ background: 'linear-gradient(135deg, #E50914, #b20710)' }}>
                            Search & Add Movies →
                        </a>
                    </motion.div>
                ) : loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {[...Array(18)].map((_, i) => (
                            <div key={i} className="h-72 rounded-2xl skeleton" />
                        ))}
                    </div>
                ) : (
                    <>
                        <p className="text-white/30 text-xs mb-4">
                            {sortedPicks.length} picks · {sortedPicks.filter(p => p.is_diverse).length} diversity picks
                        </p>
                        <motion.div
                            layout
                            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
                        >
                            <AnimatePresence>
                                {sortedPicks.map((pick) => (
                                    <PickCard
                                        key={pick.title}
                                        pick={pick}
                                        onAdd={addToList}
                                        onRate={rateMovie}
                                        userRating={ratings[pick.title] || 0}
                                    />
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    </>
                )}
            </div>
        </motion.div>
    )
}
