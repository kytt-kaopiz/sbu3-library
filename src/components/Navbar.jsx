import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import clsx from 'clsx'

export default function Navbar() {
  const { user, logout } = useStore()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [dropOpen, setDropOpen] = useState(false)
  const dropRef = useRef(null)

  const GOOGLE_URL = `https://accounts.google.com/o/oauth2/v2/auth?` + new URLSearchParams({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    redirect_uri: `${window.location.origin}/api/auth/google`,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
  })

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const navLink = (to, label) => (
    <Link to={to} className={clsx(
      'px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all',
      pathname === to ? 'bg-primary-50 text-primary-600 font-semibold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    )}>{label}</Link>
  )

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-lg shadow-sm">📖</div>
          <div>
            <div className="text-base font-extrabold text-gray-900 leading-none">
              <span className="text-primary-500">SBU</span><sup className="text-[10px]">3</sup> Library
            </div>
            <div className="text-[9px] text-gray-400 tracking-widest font-medium">KAOPIZ</div>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLink('/', '🏠 Trang chủ')}
          {navLink('/catalog', '💻 Online')}
          {navLink('/physical', '📚 Vật lý SBU3')}
          {user && navLink('/dashboard', '📊 Dashboard')}
        </div>

        <div className="flex items-center gap-2.5">
          {user ? (
            <div className="relative" ref={dropRef}>
              <button onClick={() => setDropOpen(o => !o)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-all">
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border-2 border-primary-200 shadow-sm" />
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-semibold text-gray-800 leading-none">{user.name.split(' ').slice(-2).join(' ')}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{user.role === 'admin' ? '🔴 Admin' : '👤 Thành viên'}</div>
                </div>
                <svg className={clsx('w-4 h-4 text-gray-400 transition-transform', dropOpen && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              {dropOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-gray-200 shadow-xl animate-fade-up py-1.5 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border-2 border-primary-100" />
                      <div>
                        <div className="font-semibold text-sm text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-400 truncate">{user.email}</div>
                      </div>
                    </div>
                  </div>
                  <div className="py-1">
                    <button onClick={() => { navigate('/dashboard'); setDropOpen(false) }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5">
                      <span>📊</span> Dashboard
                    </button>
                    <button onClick={() => { navigate('/physical'); setDropOpen(false) }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5">
                      <span>📚</span> Sách vật lý SBU3
                    </button>
                    <button onClick={() => { navigate('/catalog'); setDropOpen(false) }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5">
                      <span>💻</span> Sách online
                    </button>
                  </div>
                  <div className="border-t border-gray-100 py-1">
                    <button onClick={() => { logout(); navigate('/'); setDropOpen(false) }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2.5">
                      <span>🚪</span> Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <a href={GOOGLE_URL} className="btn btn-primary btn-sm gap-2 shadow-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Đăng nhập
            </a>
          )}
        </div>
      </div>
    </nav>
  )
}
