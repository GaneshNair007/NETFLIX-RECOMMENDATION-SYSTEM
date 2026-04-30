import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getOnboardingMovies } from '../api/api'
import { useUserList } from '../context/UserListContext'

const STEPS = ['welcome', 'pick', 'rate', 'done']

export default function OnboardingFlow() {
    const { isOnboarded, completeOnboarding } = useUserList()
    const [step, setStep] = useState('welcome')
    const [movies, setMovies] = useState([])
    const [picked, setPicked] = useState([])    // titles selected
    const [pickedRatings, setPickedRatings] = useState({})
    const [loadingMovies, setLoadingMovies] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const alreadyOnboarded = isOnboarded || localStorage.getItem('cinetrack_onboarded') === 'true'

    useEffect(() => {
        if (!alreadyOnboarded && step === 'pick') {
            setLoadingMovies(true)
            getOnboardingMovies()
                .then((d) => setMovies(d.movies || []))
                .catch(() => setMovies([]))
                .finally(() => setLoadingMovies(false))
        }
    }, [step, alreadyOnboarded])

    if (alreadyOnboarded) return null

    const togglePick = (title) => {
        setPicked((prev) =>
            prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
        )
    }

    const handleFinish = async () => {
        setSubmitting(true)
        await completeOnboarding(picked, pickedRatings)
        localStorage.setItem('cinetrack_onboarded', 'true')
        setStep('done')
        setTimeout(() => { /* done step auto-dismisses */ }, 2500)
    }

    const genreColor = (genres = '') => {
        const g = genres.toLowerCase()
        if (g.includes('action')) return 'from-red-900 to-orange-900'
        if (g.includes('sci-fi')) return 'from-blue-900 to-cyan-900'
        if (g.includes('horror')) return 'from-gray-900 to-red-950'
        if (g.includes('comedy')) return 'from-yellow-900 to-orange-800'
        if (g.includes('drama')) return 'from-purple-900 to-indigo-900'
        if (g.includes('romance')) return 'from-pink-900 to-rose-900'
        return 'from-gray-800 to-gray-900'
    }

    return (
        <AnimatePresence>
            {step !== 'done' && (
                <motion.div
                    key="onboarding"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center"
                    style={{ background: 'rgba(8,8,8,0.97)', backdropFilter: 'blur(20px)' }}
                >
                    {/* ── Welcome ── */}
                    {step === 'welcome' && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center px-6 max-w-lg"
                        >
                            <div className="text-7xl mb-6">🎬</div>
                            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                                Welcome to <span className="text-[#E50914]">CineTrack</span>
                            </h1>
                            <p className="text-white/60 text-lg mb-2">
                                Let's build your taste profile in <strong className="text-white">60 seconds</strong>.
                            </p>
                            <p className="text-white/40 text-sm mb-10">
                                Pick movies you've loved → we'll tailor every recommendation to you.
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setStep('pick')}
                                className="px-10 py-4 rounded-2xl font-black text-lg text-white"
                                style={{ background: 'linear-gradient(135deg, #E50914, #b20710)' }}
                            >
                                Build My Taste Profile →
                            </motion.button>
                            <button
                                onClick={() => {
                                    localStorage.setItem('cinetrack_onboarded', 'true')
                                    completeOnboarding([], {})
                                }}
                                className="block mx-auto mt-4 text-white/30 hover:text-white/60 text-sm transition"
                            >
                                Skip for now
                            </button>
                        </motion.div>
                    )}

                    {/* ── Pick Movies ── */}
                    {step === 'pick' && (
                        <div className="w-full max-w-5xl px-4 py-6 max-h-screen flex flex-col">
                            <div className="text-center mb-6 flex-shrink-0">
                                <p className="text-[#E50914] font-bold text-xs uppercase tracking-widest mb-2">Step 1 of 2</p>
                                <h2 className="text-white font-black text-2xl md:text-3xl">
                                    Pick movies you've <span className="text-[#E50914]">loved</span>
                                </h2>
                                <p className="text-white/40 text-sm mt-1">
                                    Select at least 3 · {picked.length} selected
                                </p>
                            </div>

                            {loadingMovies ? (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 overflow-y-auto flex-1">
                                    {[...Array(20)].map((_, i) => (
                                        <div key={i} className="h-28 rounded-xl skeleton" />
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 overflow-y-auto flex-1 pb-2">
                                    {movies.slice(0, 40).map((m) => {
                                        const sel = picked.includes(m.title)
                                        return (
                                            <motion.button
                                                key={m.title}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => togglePick(m.title)}
                                                className={`relative rounded-xl p-3 text-left transition-all bg-gradient-to-br ${genreColor(m.listed_in)}`}
                                                style={{
                                                    border: sel ? '2px solid #E50914' : '1px solid rgba(255,255,255,0.06)',
                                                    boxShadow: sel ? '0 0 20px rgba(229,9,20,0.3)' : 'none',
                                                    minHeight: '7rem',
                                                }}
                                            >
                                                {sel && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#E50914] flex items-center justify-center text-white text-xs font-bold"
                                                    >✓</motion.div>
                                                )}
                                                <p className="text-white font-bold text-xs leading-tight line-clamp-2 pr-6">
                                                    {m.title}
                                                </p>
                                                <p className="text-white/40 text-[10px] mt-1">
                                                    {m.release_year}
                                                </p>
                                                <p className="text-white/30 text-[9px] line-clamp-1 mt-0.5">
                                                    {m.listed_in?.split(',')[0]?.trim()}
                                                </p>
                                            </motion.button>
                                        )
                                    })}
                                </div>
                            )}

                            <div className="flex justify-between items-center mt-4 flex-shrink-0">
                                <button onClick={() => setStep('welcome')} className="text-white/40 hover:text-white text-sm transition">
                                    ← Back
                                </button>
                                <motion.button
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setStep('rate')}
                                    disabled={picked.length < 1}
                                    className="px-8 py-3 rounded-xl font-bold text-white text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                                    style={{ background: picked.length >= 1 ? 'linear-gradient(135deg, #E50914, #b20710)' : '#333' }}
                                >
                                    Rate My Picks →
                                </motion.button>
                            </div>
                        </div>
                    )}

                    {/* ── Rate Picks ── */}
                    {step === 'rate' && (
                        <div className="w-full max-w-lg px-6 max-h-screen flex flex-col">
                            <div className="text-center mb-6 flex-shrink-0">
                                <p className="text-[#E50914] font-bold text-xs uppercase tracking-widest mb-2">Step 2 of 2</p>
                                <h2 className="text-white font-black text-2xl md:text-3xl">
                                    Rate each pick
                                </h2>
                                <p className="text-white/40 text-sm mt-1">
                                    ★1 = hated it · ★5 = loved it. This powers your recommendations.
                                </p>
                            </div>

                            <div className="overflow-y-auto flex-1 space-y-3 pb-2">
                                {picked.map((title) => (
                                    <div key={title}
                                        className="flex items-center justify-between gap-4 p-4 rounded-xl"
                                        style={{ background: '#1f1f1f', border: '1px solid rgba(255,255,255,0.06)' }}
                                    >
                                        <p className="text-white font-semibold text-sm flex-1 truncate">{title}</p>
                                        <div className="flex gap-1 flex-shrink-0">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <button
                                                    key={s}
                                                    onClick={() => setPickedRatings((prev) => ({ ...prev, [title]: s }))}
                                                    className="text-xl transition-all"
                                                    style={{
                                                        color: s <= (pickedRatings[title] || 0) ? '#facc15' : '#444',
                                                        filter: s <= (pickedRatings[title] || 0) ? 'drop-shadow(0 0 4px rgba(250,204,21,0.5))' : 'none',
                                                    }}
                                                >★</button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between items-center mt-4 flex-shrink-0">
                                <button onClick={() => setStep('pick')} className="text-white/40 hover:text-white text-sm transition">
                                    ← Back
                                </button>
                                <motion.button
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleFinish}
                                    disabled={submitting}
                                    className="px-8 py-3 rounded-xl font-bold text-white text-sm"
                                    style={{ background: 'linear-gradient(135deg, #E50914, #b20710)' }}
                                >
                                    {submitting ? 'Building your profile…' : '🚀 See My Picks'}
                                </motion.button>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    )
}
