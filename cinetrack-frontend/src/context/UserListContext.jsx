import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { getUserLists, updateUserList, removeFromList, rateMovie as apiRate, getUserProfile, submitOnboarding } from '../api/api'

const UserListContext = createContext(null)

export function UserListProvider({ children }) {
    const [lists, setLists] = useState({ watched: [], watching: [], want: [] })
    const [ratings, setRatings] = useState({})
    const [recentlyAdded, setRecentlyAdded] = useState([])
    const [lastAdded, setLastAdded] = useState(null)       // triggers drawer
    const [tasteProfile, setTasteProfile] = useState(null)
    const [isOnboarded, setIsOnboarded] = useState(false)
    const [loading, setLoading] = useState(false)
    const drawerTimer = useRef(null)

    const refresh = useCallback(async () => {
        try {
            const data = await getUserLists()
            setLists({ watched: data.watched || [], watching: data.watching || [], want: data.want || [] })
            setRatings(data.ratings || {})
            setRecentlyAdded(data.recently_added || [])
            setIsOnboarded(data.onboarded || false)
        } catch {
            const saved = localStorage.getItem('cinetrack_lists')
            if (saved) {
                const parsed = JSON.parse(saved)
                setLists({ watched: parsed.watched || [], watching: parsed.watching || [], want: parsed.want || [] })
                setRatings(parsed.ratings || {})
                setRecentlyAdded(parsed.recently_added || [])
                setIsOnboarded(parsed.onboarded || false)
            }
        }
    }, [])

    const refreshProfile = useCallback(async () => {
        try {
            const profile = await getUserProfile()
            setTasteProfile(profile)
        } catch { /* backend offline */ }
    }, [])

    useEffect(() => { refresh() }, [refresh])

    // Persist to localStorage as fallback
    useEffect(() => {
        localStorage.setItem('cinetrack_lists', JSON.stringify({
            ...lists, ratings, recently_added: recentlyAdded, onboarded: isOnboarded
        }))
    }, [lists, ratings, recentlyAdded, isOnboarded])

    const addToList = async (movie, state) => {
        setLoading(true)

        // Optimistic update
        setLists((prev) => {
            const next = {
                watched: prev.watched.filter((m) => m !== movie),
                watching: prev.watching.filter((m) => m !== movie),
                want: prev.want.filter((m) => m !== movie),
            }
            next[state] = [...(next[state] || []), movie]
            return next
        })

        // Update recently added
        setRecentlyAdded((prev) => {
            const filtered = prev.filter((m) => m !== movie)
            return [...filtered, movie].slice(-10)
        })

        // Trigger recommendation drawer (debounced — 500ms)
        if (drawerTimer.current) clearTimeout(drawerTimer.current)
        drawerTimer.current = setTimeout(() => {
            setLastAdded(movie)
        }, 500)

        try {
            await updateUserList(movie, state)
            await refreshProfile()
        } catch { /* backend offline — localStorage already updated */ }
        setLoading(false)
    }

    const removeMovie = async (movie) => {
        setLists((prev) => ({
            watched: prev.watched.filter((m) => m !== movie),
            watching: prev.watching.filter((m) => m !== movie),
            want: prev.want.filter((m) => m !== movie),
        }))
        try {
            await removeFromList(movie)
        } catch { /* offline */ }
    }

    const rateMovie = async (movie, rating) => {
        setRatings((prev) => ({ ...prev, [movie]: rating }))
        try {
            await apiRate(movie, rating)
            await refreshProfile()
        } catch { /* offline — localStorage already updated */ }
    }

    const completeOnboarding = async (picks, picksRatings) => {
        try {
            await submitOnboarding(picks, picksRatings)
            await refresh()
            await refreshProfile()
            setIsOnboarded(true)
        } catch {
            // Fallback: store locally
            setLists((prev) => ({ ...prev, watched: [...new Set([...prev.watched, ...picks])] }))
            setRatings((prev) => ({ ...prev, ...picksRatings }))
            setIsOnboarded(true)
            localStorage.setItem('cinetrack_lists', JSON.stringify({
                watched: [...new Set([...lists.watched, ...picks])],
                watching: lists.watching, want: lists.want,
                ratings: { ...ratings, ...picksRatings },
                recently_added: picks.slice(-10),
                onboarded: true
            }))
        }
    }

    const dismissDrawer = () => setLastAdded(null)

    const getState = (movie) => {
        if (lists.watched.includes(movie)) return 'watched'
        if (lists.watching.includes(movie)) return 'watching'
        if (lists.want.includes(movie)) return 'want'
        return null
    }

    const getProfile = () => ({
        watched: lists.watched,
        watching: lists.watching,
        want: lists.want,
        ratings,
        recently_added: recentlyAdded,
    })

    return (
        <UserListContext.Provider value={{
            lists, addToList, removeMovie, getState, refresh, loading,
            ratings, rateMovie,
            recentlyAdded, lastAdded, dismissDrawer,
            tasteProfile, refreshProfile,
            isOnboarded, completeOnboarding,
            getProfile,
        }}>
            {children}
        </UserListContext.Provider>
    )
}

export function useUserList() {
    const ctx = useContext(UserListContext)
    if (!ctx) throw new Error('useUserList must be inside UserListProvider')
    return ctx
}
