import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import BookCard from '../components/BookCard'

const GOOGLE_AUTH = () => `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
  client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  redirect_uri: `${window.location.origin}/api/auth/google`,
  response_type: 'code',
  scope: 'openid email profile',
})}`

export default function Home() {
  const navigate = useNavigate()
  const { books, borrows, user } = useStore()
  const topBooks = [...books].sort((a, b) => b.rating - a.rating).slice(0, 6)
  const activeB = borrows.filter(b => !b.returnDate).length

  return (
    <div>
      {/* HERO */}
      <section className="relative bg-gradient-to-br from-gray-900 via-[#1A3A5C] to-gray-900 py-24 px-6 overflow-hidden">
        {/* Animated blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 right-0 w-80 h-80 bg-primary-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay:'1s'}} />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary-500/15 text-primary-300 border border-primary-500/30 px-4 py-2 rounded-full text-xs font-semibold tracking-widest mb-8">
            📖 SBU3 · STRATEGIC BUSINESS UNIT 3 · KAOPIZ
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-5">
            Thư Viện<br /><span className="text-primary-400">Tri Thức SBU3</span>
          </h1>
          <p className="text-lg text-white/60 mb-10 leading-relaxed">
            Nơi lưu giữ và chia sẻ tri thức của đội ngũ Kaopiz.<br />
            Mượn sách vật lý, đọc online full text — miễn phí hoàn toàn.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/catalog')}>
              📚 Khám phá tủ sách
            </button>
            {!user && (
              <a href={GOOGLE_AUTH()} className="btn btn-white btn-lg gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Đăng nhập với Google
              </a>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-12 mt-16 pt-10 border-t border-white/10">
            {[
              [books.length, 'Đầu sách'],
              [books.filter(b => b.hasOnline).length, 'Đọc online'],
              [activeB, 'Đang mượn'],
            ].map(([n, l]) => (
              <div key={l}>
                <div className="text-3xl font-extrabold text-white">{n}</div>
                <div className="text-sm text-white/40 mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-5">
          {[
            ['📥', 'Mượn sách vật lý', 'Đăng ký mượn tại văn phòng, tối đa 3 cuốn, hạn 14 ngày.'],
            ['📖', 'Đọc online full text', 'Đọc toàn bộ nội dung ngay trên trình duyệt — không giới hạn.'],
            ['🔖', 'Bookmark & Highlight', 'Đánh dấu trang, tô màu đoạn yêu thích, ghi chú khi đọc.'],
          ].map(([icon, title, desc]) => (
            <div key={title} className="card p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-2xl mb-4">{icon}</div>
              <div className="font-bold text-gray-900 mb-2">{title}</div>
              <div className="text-sm text-gray-500 leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TOP BOOKS */}
      <section className="bg-white border-y border-gray-200 py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">Sách nổi bật</h2>
              <p className="text-gray-400 text-sm mt-1">Được đánh giá cao nhất</p>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/catalog')}>Xem tất cả →</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {topBooks.map(book => <BookCard key={book.id} book={book} />)}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white/40 text-center py-10 text-sm">
        <div className="text-base font-bold text-white mb-1">📖 <span className="text-primary-400">SBU3</span> Library</div>
        Xây dựng bởi <span className="text-primary-400">Strategic Business Unit 3 · Kaopiz</span>
      </footer>
    </div>
  )
}
