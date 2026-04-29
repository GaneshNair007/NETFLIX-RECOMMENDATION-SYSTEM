import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
} from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import { scaleSequential } from 'd3-scale'
import { interpolateReds } from 'd3-scale-chromatic'
import { getDashboard, getCountryAnalytics } from '../api/api'
import { useUserList } from '../context/UserListContext'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

const PAGE = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
}

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

// Animated number counter hook
function useCounter(target, duration = 1200) {
    const [count, setCount] = useState(0)
    const frame = useRef(null)
    useEffect(() => {
        let start = null
        const step = (ts) => {
            if (!start) start = ts
            const progress = Math.min((ts - start) / duration, 1)
            setCount(Math.floor(progress * target))
            if (progress < 1) frame.current = requestAnimationFrame(step)
        }
        frame.current = requestAnimationFrame(step)
        return () => cancelAnimationFrame(frame.current)
    }, [target, duration])
    return count
}

function StatCard({ label, value, suffix = '', color = '#E50914', icon }) {
    const count = useCounter(typeof value === 'number' ? value : parseInt(value) || 0)
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="stat-card flex flex-col gap-2"
        >
            <p className="text-3xl md:text-4xl font-black" style={{ color }}>
                {icon}{count}{suffix}
            </p>
            <p className="text-netflix-gray-light text-sm">{label}</p>
        </motion.div>
    )
}

export default function DashboardPage() {
    const [dash, setDash] = useState(null)
    const [countries, setCountries] = useState([])
    const [tooltip, setTooltip] = useState(null)
    const [loading, setLoading] = useState(true)
    const { lists } = useUserList()

    useEffect(() => {
        Promise.all([getDashboard(), getCountryAnalytics()])
            .then(([dashData, countryData]) => {
                setDash(dashData)
                setCountries(countryData.countries || [])
            })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [lists.watched])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-24">
                <div className="w-10 h-10 border-4 border-netflix-red border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    const profile = dash?.taste_profile || {}
    const analytics = dash?.analytics || {}
    const topGenres = analytics.genre_distribution || []
    const yearTrend = analytics.year_trend || []

    const maxPop = Math.max(...countries.map((c) => c.avg_popularity), 1)
    const colorScale = scaleSequential().domain([0, maxPop]).interpolator(interpolateReds)

    const countryMap = Object.fromEntries(countries.map((c) => [c.country?.toLowerCase(), c.avg_popularity]))

    // Doughnut chart
    const donutData = {
        labels: topGenres.map((g) => g.genre),
        datasets: [{
            data: topGenres.map((g) => g.count),
            backgroundColor: ['#E50914', '#ff6b6b', '#6366f1', '#10b981', '#f59e0b', '#3b82f6'],
            borderWidth: 0,
            hoverOffset: 8,
        }],
    }

    // Bar chart
    const barData = {
        labels: yearTrend.map((y) => String(y.year)),
        datasets: [{
            label: 'Movies Watched',
            data: yearTrend.map((y) => y.count),
            backgroundColor: '#E50914bb',
            borderRadius: 4,
        }],
    }

    const chartOptions = {
        responsive: true,
        plugins: { legend: { labels: { color: '#b3b3b3', font: { size: 11 } } } },
    }

    return (
        <motion.div {...PAGE} className="min-h-screen pt-24 pb-20 px-[5%]">
            <h1 className="text-3xl md:text-4xl font-black text-white mb-1">Dashboard</h1>
            <p className="text-netflix-gray-light text-sm mb-10">Your personalized cinema analytics</p>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                <StatCard label="Total Watched" value={profile.total_watched || 0} icon="🎬 " color="#E50914" />
                <StatCard label="Currently Watching" value={profile.total_watching || 0} icon="▶ " color="#f59e0b" />
                <StatCard label="Want to Watch" value={profile.total_want || 0} icon="+ " color="#6366f1" />
                <StatCard label="Avg Popularity" value={Math.round(profile.avg_popularity || 0)} suffix="%" icon="🔥 " color="#10b981" />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                {/* Genre donut */}
                <div className="glass p-6 rounded-2xl">
                    <h2 className="text-white font-bold text-lg mb-4">🎭 Genre Distribution</h2>
                    {topGenres.length > 0 ? (
                        <div className="max-w-xs mx-auto">
                            <Doughnut data={donutData} options={{ ...chartOptions, cutout: '65%' }} />
                        </div>
                    ) : (
                        <div className="text-center py-12 text-white/30 text-sm">
                            Add movies to your Watched list to see genre distribution
                        </div>
                    )}
                </div>

                {/* Year trend bar */}
                <div className="glass p-6 rounded-2xl">
                    <h2 className="text-white font-bold text-lg mb-4">📅 Watched by Year</h2>
                    {yearTrend.length > 0 ? (
                        <Bar
                            data={barData}
                            options={{
                                ...chartOptions,
                                scales: {
                                    x: { ticks: { color: '#b3b3b3', font: { size: 10 } }, grid: { color: '#2a2a2a' } },
                                    y: { ticks: { color: '#b3b3b3', font: { size: 10 } }, grid: { color: '#2a2a2a' } },
                                },
                            }}
                        />
                    ) : (
                        <div className="text-center py-12 text-white/30 text-sm">
                            Watch some movies to see year trends
                        </div>
                    )}
                </div>
            </div>

            {/* Taste profile */}
            {topGenres.length > 0 && (
                <div className="glass p-6 rounded-2xl mb-10">
                    <h2 className="text-white font-bold text-lg mb-4">🎯 Taste Profile</h2>
                    <div className="flex flex-wrap gap-3">
                        {topGenres.map((g, i) => {
                            const total = topGenres.reduce((a, b) => a + b.count, 0)
                            const pct = total ? Math.round((g.count / total) * 100) : 0
                            const colors = ['bg-netflix-red', 'bg-indigo-600', 'bg-emerald-600', 'bg-yellow-600', 'bg-blue-600', 'bg-pink-600']
                            return (
                                <div key={g.genre} className="flex flex-col items-center gap-1">
                                    <div className={`${colors[i % colors.length]} rounded-full px-4 py-1.5 text-white text-xs font-semibold`}>
                                        {g.genre}
                                    </div>
                                    <span className="text-white/50 text-[10px]">{pct}%</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Choropleth map */}
            <div className="glass p-6 rounded-2xl">
                <h2 className="text-white font-bold text-lg mb-4">🌍 Popularity by Country</h2>
                <div className="relative">
                    <ComposableMap projectionConfig={{ scale: 147 }} style={{ width: '100%' }}>
                        <ZoomableGroup>
                            <Geographies geography={GEO_URL}>
                                {({ geographies }) =>
                                    geographies.map((geo) => {
                                        const name = geo.properties?.name?.toLowerCase() || ''
                                        const pop = countryMap[name] || 0
                                        return (
                                            <Geography
                                                key={geo.rsmKey}
                                                geography={geo}
                                                fill={pop > 0 ? colorScale(pop) : '#2a2a2a'}
                                                stroke="#141414"
                                                strokeWidth={0.5}
                                                style={{
                                                    default: { outline: 'none', transition: 'fill 0.2s' },
                                                    hover: { fill: '#E50914', outline: 'none', cursor: 'pointer' },
                                                }}
                                                onMouseEnter={() => setTooltip({ name: geo.properties?.name, pop })}
                                                onMouseLeave={() => setTooltip(null)}
                                            />
                                        )
                                    })
                                }
                            </Geographies>
                        </ZoomableGroup>
                    </ComposableMap>
                    {tooltip && (
                        <div className="map-tooltip absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-10">
                            {tooltip.name}: {tooltip.pop > 0 ? `avg pop ${tooltip.pop.toFixed(1)}` : 'no data'}
                        </div>
                    )}
                </div>
                <p className="text-white/20 text-xs text-center mt-3">Hover countries to see average popularity score</p>
            </div>
        </motion.div>
    )
}
