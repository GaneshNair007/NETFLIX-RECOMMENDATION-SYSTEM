import { useEffect, useRef, useState } from 'react'
import MovieCard from './MovieCard'
import { motion } from 'framer-motion'

export default function MovieRow({ title, movies = [], icon = '' }) {
    const rowRef = useRef(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(true)

    const checkScroll = () => {
        const el = rowRef.current
        if (!el) return
        setCanScrollLeft(el.scrollLeft > 0)
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10)
    }

    useEffect(() => {
        const el = rowRef.current
        if (!el) return
        el.addEventListener('scroll', checkScroll)
        checkScroll()
        return () => el.removeEventListener('scroll', checkScroll)
    }, [movies])

    const scroll = (dir) => {
        rowRef.current?.scrollBy({ left: dir * 480, behavior: 'smooth' })
    }

    if (!movies.length) return null

    return (
        <section className="mb-8 relative">
            <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="text-white font-bold text-xl md:text-2xl px-[4%] mb-3 flex items-center gap-2"
            >
                {icon && <span>{icon}</span>}
                {title}
            </motion.h2>

            <div className="relative group">
                {/* Left arrow */}
                {canScrollLeft && (
                    <button
                        onClick={() => scroll(-1)}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-full gradient-left flex items-center justify-start pl-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Scroll left"
                    >
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                )}

                {/* Right arrow */}
                {canScrollRight && (
                    <button
                        onClick={() => scroll(1)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-full flex items-center justify-end pr-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: 'linear-gradient(to left, #141414, transparent)' }}
                        aria-label="Scroll right"
                    >
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                )}

                {/* Scrollable row */}
                <div ref={rowRef} className="row-scroll pb-10">
                    {movies.map((movie, i) => (
                        <MovieCard key={movie.title || i} movie={movie} index={i} />
                    ))}
                </div>
            </div>
        </section>
    )
}
