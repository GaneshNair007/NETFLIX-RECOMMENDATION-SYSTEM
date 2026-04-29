import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserList } from '../context/UserListContext'

const PAGE = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
}

const TABS = [
    { key: 'watched', label: '✓ Watched', color: 'text-green-400', border: 'border-green-400' },
    { key: 'watching', label: '▶ Watching', color: 'text-yellow-400', border: 'border-yellow-400' },
    { key: 'want', label: '+ Want to Watch', color: 'text-blue-400', border: 'border-blue-400' },
]

const MOVE_TARGETS = {
    watched: [{ label: '▶ Move to Watching', value: 'watching' }, { label: '+ Move to Want', value: 'want' }],
    watching: [{ label: '✓ Mark Watched', value: 'watched' }, { label: '+ Move to Want', value: 'want' }],
    want: [{ label: '✓ Mark Watched', value: 'watched' }, { label: '▶ Start Watching', value: 'watching' }],
}

function MovieListItem({ title, tab, onMove, onRemove }) {
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-center justify-between gap-3 p-4 rounded-xl bg-[#1f1f1f] border border-white/5 hover:border-white/10 transition group"
        >
            <button
                onClick={() => navigate(`/movie/${encodeURIComponent(title)}`)}
                className="flex-1 text-left text-white font-medium text-sm hover:text-netflix-red transition truncate"
            >
                {title}
            </button>

            <div className="flex items-center gap-2 flex-shrink-0">
                {/* Move dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setOpen((v) => !v)}
                        className="text-xs text-white/60 hover:text-white transition px-2 py-1 rounded border border-white/10 hover:border-white/30"
                    >
                        Move ▾
                    </button>
                    <AnimatePresence>
                        {open && (
                            <motion.ul
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute right-0 bottom-full mb-1 bg-[#2a2a2a] border border-white/10 rounded shadow-xl z-20 min-w-[160px]"
                            >
                                {MOVE_TARGETS[tab].map((t) => (
                                    <li
                                        key={t.value}
                                        onClick={() => { onMove(title, t.value); setOpen(false) }}
                                        className="px-4 py-2 text-xs text-white hover:bg-netflix-red/20 cursor-pointer transition"
                                    >
                                        {t.label}
                                    </li>
                                ))}
                            </motion.ul>
                        )}
                    </AnimatePresence>
                </div>

                {/* Remove */}
                <button
                    onClick={() => onRemove(title)}
                    className="text-white/30 hover:text-netflix-red transition text-lg leading-none"
                    aria-label="Remove"
                >
                    ×
                </button>
            </div>
        </motion.div>
    )
}

export default function MyListPage() {
    const [activeTab, setActiveTab] = useState('watched')
    const { lists, addToList, removeMovie } = useUserList()

    const movies = lists[activeTab] || []

    return (
        <motion.div {...PAGE} className="min-h-screen pt-24 pb-20 px-[5%]">
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2">My List</h1>
            <p className="text-netflix-gray-light text-sm mb-8">Your personal cinema tracker</p>

            {/* Tabs */}
            <div className="flex gap-1 mb-8 bg-[#1f1f1f] rounded-xl p-1 w-fit">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.key
                                ? `bg-[#2a2a2a] ${tab.color} border-b-2 ${tab.border}`
                                : 'text-white/40 hover:text-white/70'
                            }`}
                    >
                        {tab.label}
                        <span className="ml-2 text-xs opacity-60">({lists[tab.key]?.length || 0})</span>
                    </button>
                ))}
            </div>

            {/* Movie list */}
            <AnimatePresence mode="wait">
                {movies.length === 0 ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-24"
                    >
                        <div className="text-6xl mb-4">🎬</div>
                        <p className="text-white/50 text-sm">Nothing here yet. Start tracking movies!</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid gap-3 max-w-2xl"
                    >
                        <AnimatePresence>
                            {movies.map((title) => (
                                <MovieListItem
                                    key={title}
                                    title={title}
                                    tab={activeTab}
                                    onMove={addToList}
                                    onRemove={removeMovie}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
