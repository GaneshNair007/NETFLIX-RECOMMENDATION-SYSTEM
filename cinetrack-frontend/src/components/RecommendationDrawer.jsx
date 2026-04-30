import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getPersonalized } from '../api/api'
import { useUserList } from '../context/UserListContext'

export default function RecommendationDrawer() {
    const { lastAdded, dismissDrawer, getProfile, ratings } = useUserList()
    const [picks, setPicks] = useState([])
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        if (!lastAdded) return
        setLoading(true)
        setPicks([])
        const profile = getProfile()
        getPersonalized(profile, {}, 6)
            .then((data) => setPicks(data.picks || []))
            .catch(() => setPicks([]))
            .finally(() => setLoading(false))
    }, [lastAdded])

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') dismissDrawer() }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [dismissDrawer])

    const matchColor = (score) => {
        if (score >= 80) return '#4ade80'
        if (score >= 60) return '#facc15'
        return '#fb923c'
    }

    return (
        <AnimatePresence>
            {lastAdded && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={dismissDrawer}
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        key="drawer"
                        initial={{ y: '100%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl"
                        style={{
                            background: 'linear-gradient(to top, #0d0d0d, #1a1a1a)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            maxHeight: '85vh',
                            overflowY: 'auto',
                        }}
                    >
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-10 h-1 rounded-full bg-white/20" />
                        </div>

                        <div className="px-5 pb-8 pt-2">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-5">
                                <div>
                                    <p className="text-xs text-[#E50914] font-bold uppercase tracking-widest mb-1">
                                        ✨ Personalized For You
                                    </p>
                                    <h2 className="text-white font-black text-xl leading-tight">
                                        Because you added
                                    </h2>
                                    <h3 className="text-[#E50914] font-black text-xl leading-tight truncate max-w-[260px]">
                                        {lastAdded}
                                    </h3>
                                </div>
                                <button
                                    onClick={dismissDrawer}
                                    className="text-white/40 hover:text-white text-2xl leading-none mt-1"
                                >×</button>
                            </div>

                            {/* Picks grid */}
                            {loading ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="h-28 rounded-xl skeleton" />
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {picks.map((pick, i) => (
                                        <motion.div
                                            key={pick.title}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.07 }}
                                            onClick={() => { navigate(`/movie/${encodeURIComponent(pick.title)}`); dismissDrawer() }}
                                            className="relative rounded-xl overflow-hidden cursor-pointer group"
                                            style={{
                                                background: 'linear-gradient(135deg, #1f1f1f, #2a2a2a)',
                                                border: '1px solid rgba(255,255,255,0.06)',
                                                padding: '0.85rem',
                                                minHeight: '7rem',
                                            }}
                                        >
                                            {/* Match badge */}
                                            <span
                                                className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                                style={{
                                                    background: matchColor(pick.match_score) + '22',
                                                    color: matchColor(pick.match_score),
                                                    border: `1px solid ${matchColor(pick.match_score)}44`,
                                                }}
                                            >
                                                {pick.match_score}%
                                            </span>

                                            {pick.is_diverse && (
                                                <span className="absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                                    🔮
                                                </span>
                                            )}

                                            <p className="text-white font-semibold text-xs leading-tight pr-8 mb-1.5 group-hover:text-[#E50914] transition line-clamp-2">
                                                {pick.title}
                                            </p>
                                            <p className="text-white/40 text-[10px] line-clamp-1 mb-2">
                                                {pick.genres?.split(',')[0]?.trim()} · {pick.release_year}
                                            </p>
                                            {pick.why_list?.[0] && (
                                                <p className="text-white/30 text-[9px] italic line-clamp-2">
                                                    {pick.why_list[0]}
                                                </p>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {/* CTA */}
                            <Link
                                to="/for-you"
                                onClick={dismissDrawer}
                                className="flex items-center justify-center gap-2 mt-5 w-full py-3 rounded-xl font-bold text-sm transition-all"
                                style={{
                                    background: 'linear-gradient(135deg, #E50914, #b20710)',
                                    color: '#fff',
                                }}
                            >
                                See all your personalized picks
                                <span>→</span>
                            </Link>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
