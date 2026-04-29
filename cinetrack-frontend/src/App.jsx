import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { UserListProvider } from './context/UserListContext'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import MovieDetailPage from './pages/MovieDetailPage'
import MyListPage from './pages/MyListPage'
import DashboardPage from './pages/DashboardPage'
import SearchPage from './pages/SearchPage'

function AnimatedRoutes() {
    const location = useLocation()
    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<HomePage />} />
                <Route path="/movie/:title" element={<MovieDetailPage />} />
                <Route path="/my-list" element={<MyListPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/search" element={<SearchPage />} />
            </Routes>
        </AnimatePresence>
    )
}

export default function App() {
    return (
        <BrowserRouter>
            <UserListProvider>
                <div className="min-h-screen bg-netflix-black">
                    <Navbar />
                    <AnimatedRoutes />
                </div>
            </UserListProvider>
        </BrowserRouter>
    )
}
