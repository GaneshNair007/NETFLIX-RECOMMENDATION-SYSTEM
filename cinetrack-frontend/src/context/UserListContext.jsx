import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getUserLists, updateUserList, removeFromList } from '../api/api'

const UserListContext = createContext(null)

export function UserListProvider({ children }) {
    const [lists, setLists] = useState({ watched: [], watching: [], want: [] })
    const [loading, setLoading] = useState(false)

    const refresh = useCallback(async () => {
        try {
            const data = await getUserLists()
            setLists(data)
        } catch {
            // Fallback to localStorage when backend is offline
            const saved = localStorage.getItem('cinetrack_lists')
            if (saved) setLists(JSON.parse(saved))
        }
    }, [])

    useEffect(() => { refresh() }, [refresh])

    // Persist to localStorage as fallback
    useEffect(() => {
        localStorage.setItem('cinetrack_lists', JSON.stringify(lists))
    }, [lists])

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
        try {
            await updateUserList(movie, state)
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

    const getState = (movie) => {
        if (lists.watched.includes(movie)) return 'watched'
        if (lists.watching.includes(movie)) return 'watching'
        if (lists.want.includes(movie)) return 'want'
        return null
    }

    return (
        <UserListContext.Provider value={{ lists, addToList, removeMovie, getState, refresh, loading }}>
            {children}
        </UserListContext.Provider>
    )
}

export function useUserList() {
    const ctx = useContext(UserListContext)
    if (!ctx) throw new Error('useUserList must be inside UserListProvider')
    return ctx
}
