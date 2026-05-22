import { useState, useEffect } from 'react'
import { useStore } from '../store'
import api from '../lib/api'
import clsx from 'clsx'

const GENRES = ['Tất cả', 'Kỹ năng', 'Tư duy', 'Lịch sử', 'Cảm hứng']
const GENRE_EMOJI = { 'Kỹ năng': '🛠️', 'Tư duy': '🧠', 'Lịch sử': '📜', 'Cảm hứng': '✨' }

const STATUS_MAP = {
  pending:          { label: 'Chờ duyệt',     cls: 'badge-amber' },
  approved:         { label: 'Đang mượn',      cls: 'badge-blue'  },
  return_requested: { label: 'Chờ xác nhận trả', cls: 'badge-amber' },
  returned:         { label: 'Đã trả',         cls: 'badge-green' },
  rejected:         { label: 'Từ chối',        cls: 'badge-red'   },
}

const isOverdue = (due) => due && new Date(due) < new Date(new Date().toDateString())
const daysLeft  = (due) => Math.ceil((new Date(due) - new Date()) / 86400000)

export default function Physical() {
  const { user, toast } = useStore()
  const [books, setBooks]   = useState([])
  const [borrows, setBorrows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [genre, setGenre]     = useState('Tất cả')
  const [filter, setFilter]   = useState('all') // all | available | borrowed
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [noteInput, setNoteInput] = useState('')
  const [tab, setTab] = useState('catalog') // catalog | my | admin

  const load = async () => {
    setLoading(true)
    try {
      const [b, br] = await Promise.all([
        api.get('/physical'),
        user ? api.get('/physical/borrow') : Promise.resolve([]),
      ])
      setBooks(b)
      setBorrows(br || [])
    } catch (e) { toast('Lỗi tải dữ liệu', 'error') }
    setLoading(false)
  }

  useEffect(() => { load() }, [user])

  const filtered = books
    .filter(b => {
      const q = search.toLowerCase()
      const mq = b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
      const mg = genre === 'Tất cả' || b.genre === genre
      const mf = filter === 'all' || (filter === 'available' && b.status === 'available') || (filter === 'borrowed' && b.status === 'borrowed')
      return mq && mg && mf
    })

  const handleBorrow = async (book) => {
    if (!user) { toast('Vui lòng đăng nhập để đăng ký mượn sách', 'error'); return }
    try {
      await api.post('/physical/borrow', { bookId: book.id, note: noteInput })
      toast(`Đã đăng ký mượn "${book.title}" — chờ admin duyệt 📬`)
      setSelected(null); setNoteInput('')
      load()
    } catch (e) { toast(e.error || 'Lỗi', 'error') }
  }

  const handleReturn = async (borrowId) => {
    try {
      await api.put('/physical/borrow', { id: borrowId, action: 'return' })
      toast('Đã gửi yêu cầu trả sách — chờ admin xác nhận ✅')
      load()
    } catch (e) { toast(e.error || 'Lỗi', 'error') }
  }

  const myBorrows = borrows.filter(b => b.userId === user?.id)
  const available = books.filter(b => b.status === 'available').length

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">📚 Tủ Sách Vật Lý SBU3</h1>
          <p className="text-gray-400 text-sm">Sách đang trưng tại văn phòng Kaopiz · {books.length} đầu sách · {available} cuốn sẵn có</p>
        </div>
        {user?.role === 'admin' && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>+ Thêm sách</button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200 mb-6">
        {[['catalog','📖 Danh sách sách'], ['my', `🎒 Của tôi${myBorrows.filter(b=>b.status!=='returned'&&b.status!=='rejected').length > 0 ? ` (${myBorrows.filter(b=>b.status!=='returned'&&b.status!=='rejected').length})` : ''}`],
          ...(user?.role === 'admin' ? [['admin','⚙️ Quản lý']] : [])
        ].map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)}
            className={clsx('px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all whitespace-nowrap',
              tab === v ? 'text-primary-600 border-primary-500' : 'text-gray-400 border-transparent hover:text-gray-600')}>
            {l}
          </button>
        ))}
      </div>

      {/* CATALOG TAB */}
      {tab === 'catalog' && (
        <div>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-5 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input className="input pl-9" placeholder="Tìm tên sách, tác giả..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input w-auto" value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">Tất cả ({books.length})</option>
              <option value="available">Có thể mượn ({available})</option>
              <option value="borrowed">Đang được mượn ({books.length - available})</option>
            </select>
          </div>

          {/* Genre pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {GENRES.map(g => (
              <button key={g} onClick={() => setGenre(g)}
                className={clsx('px-4 py-1.5 rounded-full text-sm font-medium border-2 transition-all',
                  g === genre ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300')}>
                {GENRE_EMOJI[g] || ''} {g}
                <span className="ml-1 text-xs opacity-70">({g === 'Tất cả' ? books.length : books.filter(b => b.genre === g).length})</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(book => (
                <PhysicalBookCard key={book.id} book={book} user={user}
                  onSelect={() => setSelected(book)} />
              ))}
              {filtered.length === 0 && (
                <div className="col-span-3 text-center py-16 text-gray-400">
                  <div className="text-4xl mb-2">📭</div>
                  <div className="font-semibold text-gray-600">Không tìm thấy sách phù hợp</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MY BORROWS TAB */}
      {tab === 'my' && (
        <div>
          {!user ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-4xl mb-3">🔐</div>
              <div className="font-semibold text-gray-600">Vui lòng đăng nhập để xem sách đang mượn</div>
            </div>
          ) : myBorrows.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-4xl mb-3">🎒</div>
              <div className="font-semibold text-gray-600 mb-2">Bạn chưa đăng ký mượn sách nào</div>
              <button className="btn btn-primary btn-sm mt-2" onClick={() => setTab('catalog')}>Xem danh sách sách</button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {myBorrows.map(b => {
                const od = isOverdue(b.dueDate)
                const dl = b.dueDate ? daysLeft(b.dueDate) : null
                return (
                  <div key={b.id} className={clsx('card p-4 flex items-start gap-4',
                    od ? 'border-l-4 border-sbu-red' : b.status === 'approved' ? 'border-l-4 border-primary-400' : 'border-l-4 border-gray-200')}>
                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-xl shrink-0">📖</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 text-sm mb-0.5 leading-snug">{b.bookTitle}</div>
                      <div className="flex flex-wrap gap-2 items-center mt-1.5">
                        <span className={clsx('badge', STATUS_MAP[b.status]?.cls || 'badge-gray')}>
                          {STATUS_MAP[b.status]?.label || b.status}
                        </span>
                        {b.status === 'approved' && b.dueDate && (
                          <span className={clsx('text-xs font-medium', od ? 'text-sbu-red' : dl <= 3 ? 'text-amber-600' : 'text-gray-500')}>
                            {od ? `⚠️ Quá hạn ${Math.abs(dl)} ngày` : `📅 Hạn trả: ${b.dueDate} (còn ${dl} ngày)`}
                          </span>
                        )}
                        {b.status === 'pending' && <span className="text-xs text-gray-400">Yêu cầu {b.requestDate}</span>}
                      </div>
                      {b.note && <div className="text-xs text-gray-400 mt-1">Ghi chú: {b.note}</div>}
                    </div>
                    {b.status === 'approved' && (
                      <button className="btn btn-subtle btn-sm shrink-0" onClick={() => handleReturn(b.id)}>
                        Trả sách
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ADMIN TAB */}
      {tab === 'admin' && user?.role === 'admin' && (
        <AdminPhysical books={books} borrows={borrows} onReload={load} toast={toast} />
      )}

      {/* BOOK DETAIL MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-fade-up overflow-hidden">
            <div className="bg-gradient-to-br from-primary-50 to-blue-50 p-8 text-center relative">
              <button onClick={() => setSelected(null)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-gray-500 hover:bg-white">✕</button>
              <div className="text-6xl mb-2">📖</div>
              <span className={clsx('badge', selected.status === 'available' ? 'badge-green' : 'badge-red')}>
                {selected.status === 'available' ? '✅ Có thể mượn' : '⏳ Đang được mượn'}
              </span>
            </div>
            <div className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-1 leading-snug">{selected.title}</h2>
              <p className="text-sm text-gray-400 mb-1">{selected.author}</p>
              <div className="flex items-center gap-2 mb-4">
                <span className="badge badge-blue">{GENRE_EMOJI[selected.genre]} {selected.genre}</span>
              </div>

              {selected.activeBorrow && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-sm">
                  <div className="font-semibold text-amber-800 mb-1">📤 Đang được mượn bởi</div>
                  <div className="text-amber-700">{selected.activeBorrow.userName}</div>
                  {selected.activeBorrow.dueDate && <div className="text-amber-600 text-xs mt-0.5">Hạn trả: {selected.activeBorrow.dueDate}</div>}
                </div>
              )}

              {selected.link && (
                <a href={selected.link} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary-600 hover:underline mb-4">
                  🔗 Xem trên Fahasa
                </a>
              )}

              {selected.status === 'available' && user && (
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Ghi chú (tuỳ chọn)</label>
                  <input className="input text-sm" placeholder="VD: Mình ở tầng 3, có thể lấy sách vào thứ 2..." value={noteInput} onChange={e => setNoteInput(e.target.value)} />
                </div>
              )}

              <div className="flex gap-2">
                {!user ? (
                  <div className="text-sm text-gray-400 text-center w-full py-2">Đăng nhập để đăng ký mượn sách</div>
                ) : selected.status === 'available' ? (
                  <button className="btn btn-primary flex-1" onClick={() => handleBorrow(selected)}>
                    📥 Đăng ký mượn
                  </button>
                ) : (
                  <button className="btn btn-subtle flex-1" disabled>Đang có người mượn</button>
                )}
                <button className="btn btn-subtle" onClick={() => setSelected(null)}>Đóng</button>
              </div>
              {selected.status === 'available' && user && (
                <p className="text-xs text-gray-400 text-center mt-2">Admin sẽ duyệt và liên hệ bạn qua email</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADD BOOK FORM */}
      {showForm && user?.role === 'admin' && (
        <AddBookForm onClose={() => setShowForm(false)} onSave={() => { setShowForm(false); load() }} toast={toast} />
      )}
    </div>
  )
}

function PhysicalBookCard({ book, user, onSelect }) {
  const available = book.status === 'available'
  return (
    <div onClick={onSelect}
      className={clsx('card p-4 cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 flex gap-4 group',
        !available && 'opacity-80')}>
      <div className={clsx('w-12 h-16 rounded-xl flex items-center justify-center text-2xl shrink-0 flex-col gap-1',
        available ? 'bg-primary-50' : 'bg-red-50')}>
        📖
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 mb-1 group-hover:text-primary-600 transition-colors">{book.title}</div>
        <div className="text-xs text-gray-400 mb-2 truncate">{book.author}</div>
        <div className="flex items-center justify-between">
          <span className="badge badge-blue text-[10px]">{GENRE_EMOJI[book.genre]} {book.genre}</span>
          <span className={clsx('text-xs font-semibold', available ? 'text-green-600' : 'text-sbu-red')}>
            {available ? '✅ Có thể mượn' : '⏳ Đang mượn'}
          </span>
        </div>
        {book.activeBorrow && (
          <div className="text-[10px] text-gray-400 mt-1 truncate">Bởi: {book.activeBorrow.userName}</div>
        )}
      </div>
    </div>
  )
}

function AdminPhysical({ books, borrows, onReload, toast }) {
  const [adminTab, setAdminTab] = useState('requests')
  const pending = borrows.filter(b => b.status === 'pending')
  const returnReq = borrows.filter(b => b.status === 'return_requested')

  const handleAction = async (id, action, extra = {}) => {
    try {
      await api.put('/physical/borrow', { id, action, ...extra })
      toast(action === 'approve' ? 'Đã duyệt ✅' : action === 'reject' ? 'Đã từ chối' : 'Đã xác nhận trả sách ✅')
      onReload()
    } catch (e) { toast(e.error || 'Lỗi', 'error') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Xóa sách này?')) return
    try {
      await api.delete(`/physical/${id}`)
      toast('Đã xóa sách')
      onReload()
    } catch (e) { toast(e.error || 'Lỗi', 'error') }
  }

  return (
    <div>
      <div className="flex gap-1 mb-6 flex-wrap">
        {[['requests', `📬 Đăng ký mượn${pending.length > 0 ? ` (${pending.length})` : ''}`],
          ['return_req', `📦 Chờ xác nhận trả${returnReq.length > 0 ? ` (${returnReq.length})` : ''}`],
          ['all_borrows', '📋 Tất cả lịch sử'],
          ['books_list', '📚 Danh sách sách'],
        ].map(([v, l]) => (
          <button key={v} onClick={() => setAdminTab(v)}
            className={clsx('px-4 py-2 rounded-xl text-sm font-semibold transition-all',
              adminTab === v ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
            {l}
          </button>
        ))}
      </div>

      {adminTab === 'requests' && (
        pending.length === 0
          ? <Empty icon="📬" msg="Không có đăng ký mượn nào đang chờ" />
          : <div className="card overflow-hidden">
            <table className="w-full">
              <thead><tr className="bg-gray-50 border-b border-gray-200">
                {['Sách', 'Người đăng ký', 'Ngày đăng ký', 'Ghi chú', ''].map(h =>
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">{h}</th>)}
              </tr></thead>
              <tbody>
                {pending.map(b => (
                  <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-sm text-gray-900">{b.bookTitle}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{b.userName}<br/><span className="text-xs text-gray-400">{b.userEmail}</span></td>
                    <td className="px-4 py-3 text-sm text-gray-500">{b.requestDate}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-[160px] truncate">{b.note || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="btn btn-primary btn-sm" onClick={() => handleAction(b.id, 'approve')}>✅ Duyệt</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleAction(b.id, 'reject')}>❌ Từ chối</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      )}

      {adminTab === 'return_req' && (
        returnReq.length === 0
          ? <Empty icon="📦" msg="Không có yêu cầu trả sách nào" />
          : <div className="card overflow-hidden">
            <table className="w-full">
              <thead><tr className="bg-gray-50 border-b border-gray-200">
                {['Sách', 'Người mượn', 'Ngày mượn', 'Hạn trả', ''].map(h =>
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">{h}</th>)}
              </tr></thead>
              <tbody>
                {returnReq.map(b => (
                  <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-sm">{b.bookTitle}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{b.userName}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{b.approvedDate}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{b.dueDate}</td>
                    <td className="px-4 py-3">
                      <button className="btn btn-primary btn-sm" onClick={() => handleAction(b.id, 'confirm_return')}>
                        ✅ Xác nhận đã trả
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      )}

      {adminTab === 'all_borrows' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-gray-50 border-b border-gray-200">
              {['Sách', 'Người mượn', 'Ngày đăng ký', 'Hạn trả', 'Trạng thái'].map(h =>
                <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">{h}</th>)}
            </tr></thead>
            <tbody>
              {[...borrows].reverse().map(b => (
                <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-sm">{b.bookTitle}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{b.userName}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{b.requestDate}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{b.dueDate || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={clsx('badge', STATUS_MAP[b.status]?.cls || 'badge-gray')}>
                      {STATUS_MAP[b.status]?.label || b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {adminTab === 'books_list' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-gray-50 border-b border-gray-200">
              {['#', 'Tên sách', 'Tác giả', 'Thể loại', 'Trạng thái', ''].map(h =>
                <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">{h}</th>)}
            </tr></thead>
            <tbody>
              {books.map(b => (
                <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-400">{b.stt}</td>
                  <td className="px-4 py-3 font-semibold text-sm text-gray-900 max-w-[240px]">{b.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{b.author}</td>
                  <td className="px-4 py-3"><span className="badge badge-blue">{b.genre}</span></td>
                  <td className="px-4 py-3">
                    <span className={b.status === 'available' ? 'badge badge-green' : 'badge badge-red'}>
                      {b.status === 'available' ? 'Có thể mượn' : 'Đang mượn'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b.id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function AddBookForm({ onClose, onSave, toast }) {
  const [form, setForm] = useState({ title: '', author: '', genre: 'Kỹ năng', link: '', owner: '' })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const handleSave = async () => {
    if (!form.title) { toast('Tên sách không được trống', 'error'); return }
    try {
      await api.post('/physical', form)
      toast('Đã thêm sách mới 📗')
      onSave()
    } catch (e) { toast(e.error || 'Lỗi', 'error') }
  }
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg text-gray-900">Thêm sách vật lý</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div className="space-y-3">
          <div><label className="block text-xs font-bold text-gray-500 mb-1">Tên sách *</label><input className="input" value={form.title} onChange={e => set('title', e.target.value)} /></div>
          <div><label className="block text-xs font-bold text-gray-500 mb-1">Tác giả</label><input className="input" value={form.author} onChange={e => set('author', e.target.value)} /></div>
          <div><label className="block text-xs font-bold text-gray-500 mb-1">Thể loại</label>
            <select className="input" value={form.genre} onChange={e => set('genre', e.target.value)}>
              {['Kỹ năng','Tư duy','Lịch sử','Cảm hứng'].map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div><label className="block text-xs font-bold text-gray-500 mb-1">Link tham khảo</label><input className="input" value={form.link} onChange={e => set('link', e.target.value)} placeholder="https://fahasa.com/..." /></div>
          <div><label className="block text-xs font-bold text-gray-500 mb-1">Chủ sách (nếu có)</label><input className="input" value={form.owner} onChange={e => set('owner', e.target.value)} /></div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button className="btn btn-subtle" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" onClick={handleSave}>Thêm sách</button>
        </div>
      </div>
    </div>
  )
}

function Empty({ icon, msg }) {
  return (
    <div className="text-center py-16">
      <div className="text-4xl mb-3">{icon}</div>
      <div className="font-semibold text-gray-600">{msg}</div>
    </div>
  )
}
