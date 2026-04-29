import { motion } from 'framer-motion'

const TEAM = [
    {
        name: 'Ganesh',
        role: 'ML / Data enginnering',
        color: '#E50914',
        description: 'Redbull drinker ',
        gradient: 'from-red-900/40 to-red-600/20',
        image: '/team/ganesh.jpg.png',
    },
    {
        name: 'Raghu',
        role: 'ML',
        color: '#6366f1',
        description: ' cold drinker ',
        gradient: 'from-indigo-900/40 to-indigo-600/20',
        image: '/team/raghu.jpg.png',
    },
    {
        name: 'Arjit Ujjawal',
        role: 'AI / Web Dev',
        color: '#10b981',
        description: 'coffee drinker',
        gradient: 'from-emerald-900/40 to-emerald-600/20',
        image: '/team/arjit.jpg.png',
    },
]

function TeamCard({ member, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            whileHover={{ y: -8, scale: 1.04 }}
            className="team-card relative group flex flex-col items-center text-center p-8 rounded-2xl bg-[#1a1a1a] border border-white/5 overflow-hidden cursor-default"
            style={{ '--glow': member.color }}
        >
            {/* Glow ring */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                    boxShadow: `inset 0 0 60px 0 ${member.color}30`,
                    border: `1px solid ${member.color}40`,
                    borderRadius: '1rem',
                }}
            />

            {/* Avatar — shows real photo if provided, else emoji */}
            <div
                className="relative w-24 h-24 md:w-32 md:h-32 rounded-full mb-5 flex items-center justify-center text-5xl md:text-6xl transition-all duration-500 group-hover:brightness-125 group-hover:scale-110 overflow-hidden"
                style={{ background: `radial-gradient(circle at 30% 30%, ${member.color}40, #1a1a1a)` }}
            >
                {member.image ? (
                    <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                    />
                ) : null}
                <span
                    className="w-full h-full flex items-center justify-center text-5xl md:text-6xl"
                    style={{ display: member.image ? 'none' : 'flex' }}
                >
                    {member.emoji}
                </span>
                {/* Outer ring animation on hover */}
                <div
                    className="absolute inset-0 rounded-full border-2 opacity-0 group-hover:opacity-100 transition-all duration-500"
                    style={{ borderColor: member.color, transform: 'scale(1.15)' }}
                />
            </div>

            {/* Name */}
            <h3 className="text-white font-bold text-xl md:text-2xl mb-1">{member.name}</h3>

            {/* Role — slides up on hover */}
            <motion.p
                className="font-semibold text-sm mb-3 transition-colors"
                style={{ color: member.color }}
            >
                {member.role}
            </motion.p>

            {/* Description — appears on hover */}
            <p className="text-netflix-gray-light text-xs md:text-sm opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-400 max-w-xs">
                {member.description}
            </p>

            {/* Bottom accent line */}
            <div
                className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `linear-gradient(to right, transparent, ${member.color}, transparent)` }}
            />
        </motion.div>
    )
}

export default function TeamCredits() {
    return (
        <section className="py-20 px-[5%] bg-gradient-to-b from-netflix-black to-[#0a0a0a]">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-14"
            >
                <p className="text-netflix-red font-semibold text-sm uppercase tracking-widest mb-3">The Team</p>
                <h2 className="text-white font-black text-3xl md:text-5xl mb-4">Built with passion</h2>
                <p className="text-netflix-gray-light text-sm md:text-base max-w-lg mx-auto">
                    CineTrack was crafted by a team of engineers who love movies as much as they love great software.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {TEAM.map((member, i) => (
                    <TeamCard key={member.name} member={member} index={i} />
                ))}
            </div>

            {/* GitHub Source Link */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="flex justify-center mt-12"
            >
                <a
                    href="https://github.com/GaneshNair007/NETFLIX-RECOMMENDATION-SYSTEM/tree/main"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full border border-white/10 bg-white/5 text-white/70 text-sm font-medium hover:bg-white/10 hover:border-white/30 hover:text-white transition-all duration-300 group"
                >
                    {/* GitHub icon */}
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                    </svg>
                    View Source Code on GitHub
                    <svg className="w-3.5 h-3.5 opacity-50 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </a>
            </motion.div>

            {/* Footer */}
            <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 }}
                className="text-center text-white/20 text-xs mt-6"
            >
                © 2026 CineTrack · Powered by TF-IDF + Cosine Similarity · Built with React &amp; FastAPI
            </motion.p>
        </section>
    )
}
