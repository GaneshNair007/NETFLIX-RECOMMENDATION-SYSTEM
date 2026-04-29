import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import HeroBanner from '../components/HeroBanner'
import MovieRow from '../components/MovieRow'
import TeamCredits from '../components/TeamCredits'
import { getTrending, getRecommendations, getByGenre } from '../api/api'
import { useUserList } from '../context/UserListContext'

const PAGE = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.4 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
}

export default function HomePage() {
    const [trending, setTrending] = useState([])
    const [actionMovies, setActionMovies] = useState([])
    const [scifiMovies, setScifiMovies] = useState([])
    const [becauseYouWatched, setBecauseYouWatched] = useState([])
    const [loading, setLoading] = useState(true)
    const { lists } = useUserList()

    useEffect(() => {
        async function load() {
            try {
                const [trendData, actionData, scifiData] = await Promise.all([
                    getTrending(),
                    getByGenre('Action'),
                    getByGenre('Sci-Fi'),
                ])
                setTrending(trendData.trending || [])
                setActionMovies(actionData.movies || [])
                setScifiMovies(scifiData.movies || [])
            } catch (e) {
                console.error('Home load error', e)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    // Load personalised row from watched list
    useEffect(() => {
        const watched = lists.watched
        if (!watched?.length) return
        const last = watched[watched.length - 1]
        getRecommendations(last)
            .then((data) => setBecauseYouWatched(data.detailed || []))
            .catch(() => { })
    }, [lists.watched])

    const featured = trending[0] || null

    if (loading) {
        return (
            <motion.div {...PAGE} className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-netflix-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-netflix-gray-light text-sm">Loading CineTrack…</p>
                </div>
            </motion.div>
        )
    }

    return (
        <motion.div {...PAGE}>
            <HeroBanner movie={featured} />

            <div className="relative z-10 -mt-16">
                <MovieRow title="🔥 Trending Now" movies={trending} icon="" />
                {becauseYouWatched.length > 0 && (
                    <MovieRow title="🎯 Because You Watched" movies={becauseYouWatched} />
                )}
                <MovieRow title="💥 Action & Adventure" movies={actionMovies} />
                <MovieRow title="🚀 Sci-Fi & Fantasy" movies={scifiMovies} />
                <MovieRow title="🌍 Popular Worldwide" movies={[...trending].reverse().slice(0, 15)} />
            </div>

            <TeamCredits />
        </motion.div>
    )
}
