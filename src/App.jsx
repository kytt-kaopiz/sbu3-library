import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useStore } from './store'
import Navbar from './components/Navbar'
import Toast from './components/Toast'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Reader from './pages/Reader'
import Dashboard from './pages/Dashboard'
import AuthCallback from './pages/AuthCallback'

export default function App() {
  const { token, fetchMe, fetchBooks } = useStore()

  useEffect(() => {
    fetchBooks()
    if (token) fetchMe()
  }, [token])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Toast />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/reader/:id" element={<Reader />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  )
}
