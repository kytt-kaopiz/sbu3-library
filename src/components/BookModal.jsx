import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'

export default function BookModal({ book, onClose }) {
  const navigate = useNavigate()
  const { user, borrows, requests, borrowBook, reserveBook, toast } = useStore()
  if (!book) return null

  const activeBorrow = borrows.find(b => b.bookId === book.id && !b.returnDate)
  const myBorrows = borrows.filter(b => b.userId === user?.id && !b.returnDate).length
  const myReservation = requests.find(r => r.bookId === book.id && r.userId === user?.id && r.status === 'waiting')

  const handleBorrow = async () => {
    try {
      await borrowBook(book.id)
      toast(`Đã mượn "${book.title}" — hạn trả 14 ngày 📚`)
      onClose()
    } catch (e) { toast(e.error || 'Lỗi', 'error') }
  }

  const handleReserve = async () => {
    try {
      await reserveBook(book.id)
      toast(`Đã đặt trước "${book.title}" 📬`)
      onClose()
    } catch (e) { toast(e.error || 'Lỗi', 'error') }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-fade-up overflow-hidden">
        {/* Cover */}
        <div className="h-48 bg-gradient-to-br from-primary-50 to-primary-100 relative overflow-hidden">
          {book.coverUrl && (
            <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
          )}
          <button onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-gray-500 hover:bg-white transition-all">✕</button>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-1">{book.title}</h2>
              <p className="text-sm text-gray-400">{book.author} · {book.year}</p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-lg font-bold text-amber-500">★ {book.rating}</div>
              <span className="badge badge-blue mt-1">{book.genre}</span>
            </div>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed border-l-4 border-primary-300 pl-3 mb-5">{book.desc}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[['📅 Năm XB', book.year], ['★ Rating', book.rating], ['📊 Trạng thái', book.isBorrowed ? 'Đang mượn' : 'Có sẵn']].map(([l,v]) => (
              <div key={l} className="bg-gray-50 rounded-xl p-2.5 text-center">
                <div className="text-xs text-gray-400 mb-0.5">{l}</div>
                <div className="text-sm font-bold text-gray-800">{v}</div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            {!user ? (
              <a href={`https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({ client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID||'', redirect_uri: `${window.location.origin}/api/auth/google`, response_type:'code', scope:'openid email profile' })}`}
                className="btn btn-primary flex-1">Đăng nhập để mượn</a>
            ) : (
              <>
                {book.hasOnline && (
                  <button className="btn btn-outline flex-1" onClick={() => { onClose(); navigate(`/reader/${book.id}`) }}>
                    📖 Đọc online
                  </button>
                )}
                {book.isBorrowed ? (
                  myReservation
                    ? <button className="btn btn-subtle flex-1" disabled>✓ Đã đặt trước</button>
                    : <button className="btn btn-primary flex-1" onClick={handleReserve}>📬 Đặt trước</button>
                ) : (
                  <button className="btn btn-primary flex-1" onClick={handleBorrow} disabled={myBorrows >= 3}>
                    📥 Mượn sách
                  </button>
                )}
              </>
            )}
          </div>
          {user && myBorrows >= 3 && !book.isBorrowed && (
            <p className="text-xs text-sbu-red mt-2 text-center">Bạn đang mượn tối đa 3 cuốn</p>
          )}
        </div>
      </div>
    </div>
  )
}
