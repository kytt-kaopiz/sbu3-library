import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import BookCard from '../components/BookCard'
import BookModal from '../components/BookModal'

const GOOGLE_AUTH = () => `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
  client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  redirect_uri: `${window.location.origin}/api/auth/google`,
  response_type: 'code',
  scope: 'openid email profile',
})}`

const GENRES = [
  { name: 'Classic',      emoji: '📜', color: 'from-amber-50 to-orange-50',    border: 'border-amber-200' },
  { name: 'Mystery',      emoji: '🔍', color: 'from-purple-50 to-violet-50',   border: 'border-purple-200' },
  { name: 'Adventure',    emoji: '⚔️', color: 'from-green-50 to-emerald-50',   border: 'border-green-200' },
  { name: 'Horror',       emoji: '👻', color: 'from-gray-50 to-slate-100',     border: 'border-gray-200' },
  { name: 'Philosophy',   emoji: '🧠', color: 'from-blue-50 to-cyan-50',       border: 'border-blue-200' },
  { name: 'Historical',   emoji: '🏛️', color: 'from-rose-50 to-pink-50',       border: 'border-rose-200' },
  { name: 'Fantasy',      emoji: '✨', color: 'from-indigo-50 to-purple-50',   border: 'border-indigo-200' },
  { name: 'Psychological',emoji: '🪞', color: 'from-teal-50 to-cyan-50',       border: 'border-teal-200' },
]

export default function Home() {
  const navigate = useNavigate()
  const { books, borrows, user } = useStore()
  const [selectedBook, setSelectedBook] = useState(null)
  const [activeGenre, setActiveGenre] = useState(null)

  const activeB = borrows.filter(b => !b.returnDate).length
  const topRated  = [...books].sort((a,b) => b.rating - a.rating).slice(0, 6)
  const onlineBooks = books.filter(b => b.hasOnline).slice(0, 6)
  const genreBooks  = activeGenre ? books.filter(b => b.genre === activeGenre) : []

  return (
    <div className="bg-gray-50">

      {/* ── HERO ── */}
      <section className="relative bg-gradient-to-br from-[#0A1628] via-[#0D2137] to-[#0A1628] overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-500/8 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary-400/6 rounded-full blur-[80px] animate-pulse" style={{animationDelay:'1.5s'}} />
          <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[60px]" />
        </div>
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',backgroundSize:'60px 60px'}} />

        <div className="relative max-w-6xl mx-auto px-6 py-28 flex flex-col lg:flex-row items-center gap-16">
          {/* Left */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-primary-500/10 text-primary-300 border border-primary-500/20 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest mb-7 uppercase">
              📖 Strategic Business Unit 3 · Kaopiz
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-5">
              Thư Viện<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-cyan-300">
                Tri Thức SBU3
              </span>
            </h1>
            <p className="text-lg text-white/55 mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Nơi lưu giữ và chia sẻ tri thức của đội ngũ Kaopiz.<br/>
              Mượn sách, đọc online full text — hoàn toàn miễn phí.
            </p>
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <button className="btn btn-primary btn-lg shadow-lg shadow-primary-500/25" onClick={() => navigate('/catalog')}>
                📚 Khám phá tủ sách
              </button>
              {!user && (
                <a href={GOOGLE_AUTH()} className="btn btn-white btn-lg gap-2 shadow-lg">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Đăng nhập với Google
                </a>
              )}
            </div>
          </div>

          {/* Right — floating book stack */}
          <div className="hidden lg:flex items-center justify-center relative w-72 h-72 shrink-0">
            {topRated.slice(0,4).map((b,i) => (
              <div key={b.id} className="absolute w-36 h-48 rounded-xl overflow-hidden shadow-2xl cursor-pointer hover:z-10 transition-all duration-300 hover:scale-105"
                style={{ transform:`rotate(${[-8,-3,3,8][i]}deg) translate(${[-60,-20,20,60][i]}px,${[20,-10,10,-20][i]}px)`, zIndex:i }}
                onClick={() => setSelectedBook(b)}>
                <img src={b.coverUrl} alt={b.title} className="w-full h-full object-cover" onError={e=>{e.target.style.display='none';e.target.parentNode.style.background='linear-gradient(135deg,#1A3A5C,#29ABE2)'}} />
              </div>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative border-t border-white/8">
          <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-3 gap-4 text-center">
            {[[books.length,'📚','Đầu sách'],[books.filter(b=>b.hasOnline).length,'💻','Đọc online'],[activeB,'📤','Đang mượn']].map(([n,icon,l])=>(
              <div key={l}>
                <div className="text-2xl font-extrabold text-white">{icon} {n}</div>
                <div className="text-xs text-white/35 mt-0.5 uppercase tracking-wide">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BROWSE BY GENRE ── */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="flex items-end justify-between mb-7">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">Khám phá theo thể loại</h2>
            <p className="text-gray-400 text-sm mt-1">Tìm đúng cuốn sách bạn đang tìm kiếm</p>
          </div>
          {activeGenre && <button className="btn btn-subtle btn-sm" onClick={()=>setActiveGenre(null)}>✕ Bỏ lọc</button>}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
          {GENRES.map(g => (
            <button key={g.name} onClick={()=>setActiveGenre(g.name===activeGenre?null:g.name)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                g.name===activeGenre ? 'border-primary-500 bg-primary-50 shadow-md' : `bg-gradient-to-br ${g.color} ${g.border} hover:border-primary-300`
              }`}>
              <span className="text-2xl">{g.emoji}</span>
              <span className="text-xs font-semibold text-gray-700 text-center leading-tight">{g.name}</span>
              <span className="text-[10px] text-gray-400">{books.filter(b=>b.genre===g.name).length} cuốn</span>
            </button>
          ))}
        </div>

        {/* Genre results */}
        {activeGenre && (
          <div className="animate-fade-up">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {GENRES.find(g=>g.name===activeGenre)?.emoji} {activeGenre} ({genreBooks.length} cuốn)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {genreBooks.map(b => (
                <div key={b.id} onClick={()=>setSelectedBook(b)}>
                  <BookCard book={b} />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── TOP RATED ── */}
      <section className="bg-white border-y border-gray-100 py-14">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-end justify-between mb-7">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">⭐ Được đánh giá cao nhất</h2>
              <p className="text-gray-400 text-sm mt-1">Những cuốn sách kinh điển không thể bỏ qua</p>
            </div>
            <button className="btn btn-outline btn-sm" onClick={()=>navigate('/catalog?sort=rating')}>Xem tất cả →</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {topRated.map((b,i) => (
              <div key={b.id} onClick={()=>setSelectedBook(b)} className="relative">
                {i < 3 && (
                  <div className="absolute -top-2 -left-2 z-10 w-7 h-7 rounded-full bg-amber-400 text-white text-xs font-extrabold flex items-center justify-center shadow-md">
                    {i+1}
                  </div>
                )}
                <BookCard book={b} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── READ ONLINE NOW ── */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="flex items-end justify-between mb-7">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">💻 Đọc online ngay — không cần mượn</h2>
            <p className="text-gray-400 text-sm mt-1">Full text từ Project Gutenberg · Miễn phí · Không giới hạn</p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={()=>navigate('/catalog')}>Xem tất cả →</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {onlineBooks.map(b => (
            <div key={b.id} onClick={()=>setSelectedBook(b)}
              className="flex gap-4 bg-white rounded-2xl border border-gray-200 p-4 cursor-pointer hover:shadow-md hover:border-primary-200 transition-all group">
              <div className="w-16 h-20 rounded-lg overflow-hidden shrink-0 bg-primary-50">
                <img src={b.coverUrl} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={e=>{e.target.style.display='none'}} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 mb-1">{b.title}</div>
                <div className="text-xs text-gray-400 mb-2">{b.author}</div>
                <div className="flex items-center gap-2">
                  <span className="badge badge-blue text-[10px]">📖 Đọc online</span>
                  <span className="text-xs text-amber-500 font-semibold">★ {b.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-gradient-to-br from-primary-50 to-white border-y border-primary-100 py-14">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-2">Cách sử dụng</h2>
          <p className="text-gray-400 text-center text-sm mb-10">Đơn giản — chỉ 3 bước</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              ['1','🔐','Đăng nhập','Đăng nhập bằng Google — không cần tạo tài khoản mới.'],
              ['2','📚','Chọn sách','Browse tủ sách, tìm kiếm, lọc theo thể loại yêu thích.'],
              ['3','📖','Đọc & Mượn','Đọc online ngay hoặc đăng ký mượn sách về đọc.'],
            ].map(([n,icon,title,desc])=>(
              <div key={n} className="bg-white rounded-2xl border border-primary-100 p-6 text-center shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-primary-500 text-white text-lg font-extrabold flex items-center justify-center mx-auto mb-4">{n}</div>
                <div className="text-3xl mb-3">{icon}</div>
                <div className="font-bold text-gray-900 mb-2">{title}</div>
                <div className="text-sm text-gray-500 leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      {!user && (
        <section className="bg-gradient-to-br from-[#0D2137] to-[#0A1628] py-16 text-center">
          <div className="max-w-xl mx-auto px-6">
            <div className="text-4xl mb-4">📖</div>
            <h2 className="text-3xl font-extrabold text-white mb-3">Sẵn sàng khám phá?</h2>
            <p className="text-white/50 mb-8">Đăng nhập để mượn sách, đọc online và theo dõi lịch sử đọc của bạn.</p>
            <a href={GOOGLE_AUTH()} className="btn btn-primary btn-lg shadow-lg shadow-primary-500/30 gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Bắt đầu với Google
            </a>
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 py-10 text-center">
        <div className="text-base font-bold text-white mb-1">📖 <span className="text-primary-400">SBU3</span> Library</div>
        <div className="text-sm text-white/30">Strategic Business Unit 3 · <span className="text-primary-400">Kaopiz</span> · Chia sẻ tri thức</div>
      </footer>

      {selectedBook && <BookModal book={selectedBook} onClose={()=>setSelectedBook(null)} />}
    </div>
  )
}
