import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import clsx from 'clsx'

export default function Navbar() {
  const { user, logout } = useStore()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const GOOGLE_URL = `https://accounts.google.com/o/oauth2/v2/auth?` + new URLSearchParams({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    redirect_uri: `${window.location.origin}/api/auth/google`,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
  })

  const navLink = (to, label) => (
    <Link to={to} className={clsx(
      'px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all',
      pathname === to ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-100'
    )}>{label}</Link>
  )

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-lg">📖</div>
          <div>
            <div className="text-base font-extrabold text-gray-900 leading-none">
              <span className="text-primary-500">SBU</span><sup className="text-xs">3</sup> Library
            </div>
            <div className="text-[10px] text-gray-400 tracking-widest">KAOPIZ</div>
          </div>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLink('/', '🏠 Trang chủ')}
          {navLink('/catalog', '📚 Tủ sách')}
          {user && navLink('/dashboard', '📊 Dashboard')}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2.5">
          {user ? (
            <>
              {user.role === 'admin' && <span className="badge badge-red">ADMIN</span>}
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border-2 border-primary-200" />
              <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.name.split(' ').pop()}</span>
              <button className="btn btn-subtle btn-sm" onClick={() => { logout(); navigate('/') }}>Đăng xuất</button>
            </>
          ) : (
            <a href={GOOGLE_URL} className="btn btn-primary btn-sm gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Đăng nhập với Google
            </a>
          )}
        </div>
      </div>
    </nav>
  )
}
