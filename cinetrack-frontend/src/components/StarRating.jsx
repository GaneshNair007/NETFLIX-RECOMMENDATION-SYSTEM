import { useState } from 'react'
import { motion } from 'framer-motion'

export default function StarRating({ movie, initialRating = 0, onRate, size = 'md' }) {
    const [hover, setHover] = useState(0)
    const [selected, setSelected] = useState(initialRating)

    const sizeClass = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-2xl'
    const labels = ['', 'Hated it', 'Didn\'t like it', 'It was ok', 'Liked it', 'Loved it!']

    const handleRate = (rating) => {
        setSelected(rating)
        onRate?.(movie, rating)
    }

    return (
        <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                        key={star}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        onClick={() => handleRate(star)}
                        className={`${sizeClass} transition-all duration-150 cursor-pointer`}
                        style={{
                            color: star <= (hover || selected)
                                ? `hsl(${30 + (star * 10)}, 100%, 60%)`
                                : '#444',
                            filter: star <= (hover || selected) ? 'drop-shadow(0 0 6px rgba(255,180,0,0.6))' : 'none',
                        }}
                        aria-label={`Rate ${star} stars`}
                    >
                        ★
                    </motion.button>
                ))}
            </div>
            {(hover || selected) > 0 && (
                <span className="text-xs text-white/50 transition-all">
                    {labels[hover || selected]}
                </span>
            )}
        </div>
    )
}
