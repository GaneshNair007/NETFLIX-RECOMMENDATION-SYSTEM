import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserList } from '../context/UserListContext'

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [query, setQuery] = useState('')
    const navigate = useNavigate()
    const location = useLocation()
    const { lists } = useUserList()
    const inputRef = useRef(null)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        if (searchOpen) inputRef.current?.focus()
    }, [searchOpen])

    const handleSearch = (e) => {
        e.preventDefault()
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query.trim())}`)
            setSearchOpen(false)
            setQuery('')
        }
    }

    const totalWatched = lists.watched?.length || 0
    const hasHistory = totalWatched + (lists.watching?.length || 0) + (lists.want?.length || 0) > 0

    const navLinks = [
        { label: 'Home', to: '/' },
        { label: 'Search', action: () => setSearchOpen((v) => !v) },
        { label: 'My List', to: '/my-list' },
        { label: 'Dashboard', to: '/dashboard' },
    ]

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-netflix-black shadow-2xl' : 'bg-gradient-to-b from-black/80 to-transparent'}`}
        >
            <div className="flex items-center justify-between px-4 md:px-12 py-3">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 select-none">
                    <span className="text-netflix-red font-black text-2xl md:text-3xl tracking-tight">
                        CINE<span className="text-white">TRACK</span>
                    </span>
                </Link>

                {/* Nav links */}
                <div className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) =>
                        link.to ? (
                            <Link
                                key={link.label}
                                to={link.to}
                                className={`text-sm font-medium transition-colors hover:text-white ${location.pathname === link.to ? 'text-white' : 'text-netflix-gray-light'}`}
                            >
                                {link.label}
                            </Link>
                        ) : (
                            <button
                                key={link.label}
                                onClick={link.action}
                                className="text-sm font-medium text-netflix-gray-light hover:text-white transition-colors"
                            >
                                {link.label}
                            </button>
                        )
                    )}

                    {/* For You — special link with pulse dot */}
                    <Link
                        to="/for-you"
                        className={`relative text-sm font-bold transition-colors flex items-center gap-1.5 ${location.pathname === '/for-you' ? 'text-[#E50914]' : 'text-white/70 hover:text-white'}`}
                    >
                        ✨ For You
                        {hasHistory && location.pathname !== '/for-you' && (
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E50914] opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E50914]" />
                            </span>
                        )}
                    </Link>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3">
                    {/* Search bar */}
                    <AnimatePresence>
                        {searchOpen && (
                            <motion.form
                                onSubmit={handleSearch}
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 220, opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden"
                            >
                                <input
                                    ref={inputRef}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search movies…"
                                    className="w-full bg-black/70 border border-white/20 text-white text-sm px-3 py-1.5 rounded outline-none focus:border-netflix-red placeholder-gray-500"
                                />
                            </motion.form>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={() => setSearchOpen((v) => !v)}
                        aria-label="Toggle search"
                        className="text-white hover:text-netflix-red transition-colors p-1"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>

                    {/* My List badge */}
                    <Link to="/my-list" className="relative p-1">
                        <svg className="w-5 h-5 text-white hover:text-netflix-red transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        {totalWatched > 0 && (
                            <span className="absolute -top-1 -right-1 bg-netflix-red text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                {totalWatched > 9 ? '9+' : totalWatched}
                            </span>
                        )}
                    </Link>

                    {/* Profile */}
                    <Link to="/dashboard" className="w-8 h-8 rounded bg-netflix-red flex items-center justify-center text-white font-bold text-sm">
                        C
                    </Link>
                </div>
            </div>
        </nav>
    )
}
