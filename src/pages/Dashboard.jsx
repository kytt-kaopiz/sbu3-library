import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import api from '../lib/api'
import clsx from 'clsx'

const isOverdue = (due) => due && new Date(due) < new Date(new Date().toDateString())
const daysLeft = (due) => Math.ceil((new Date(due) - new Date()) / 86400000)

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, books, borrows, requests, fetchBorrows, fetchRequests, returnBook, toast } = useStore()
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    if (!user) { navigate('/'); return }
    fetchBorrows()
    fetchRequests()
  }, [user])

  if (!user) return null

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 animate-fade-up">
      <div className="flex items-center gap-4 mb-8">
        <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-2xl border-2 border-primary-200" />
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">{user.name}</h1>
          <p className="text-sm text-gray-400">{user.email} · {user.role === 'admin' ? '🔴 Admin' : '👤 Thành viên'}</p>
        </div>
      </div>

      {user.role === 'admin'
        ? <AdminDash books={books} borrows={borrows} requests={requests} fetchBorrows={fetchBorrows} fetchRequests={fetchRequests} toast={toast} />
        : <UserDash user={user} books={books} borrows={borrows} requests={requests} returnBook={returnBook} navigate={navigate} toast={toast} />
      }
    </div>
  )
}

function UserDash({ user, books, borrows, requests, returnBook, navigate, toast }) {
  const [tab, setTab] = useState('active')
  const myActive = borrows.filter(b => b.userId === user.id && !b.returnDate)
  const myHistory = borrows.filter(b => b.userId === user.id && b.returnDate)
  const myReqs = requests.filter(r => r.userId === user.id)
  const overdueCount = myActive.filter(b => isOverdue(b.dueDate)).length

  const handleReturn = async (borrowId) => {
    try { await returnBook(borrowId); toast('Đã trả sách ✅') }
    catch (e) { toast(e.error || 'Lỗi', 'error') }
  }

  const TABS = [['active',`📤 Đang mượn (${myActive.length})`],['history','🕐 Lịch sử'],['reserve','📬 Đặt trước']]

  return (
    <div>
      {overdueCount > 0 && (
        <div className="bg-sbu-redLight border border-sbu-red/20 rounded-xl p-3.5 mb-6 flex items-center gap-2.5 text-sm text-sbu-red font-medium">
          ⚠️ Bạn có <strong>{overdueCount}</strong> cuốn quá hạn trả. Vui lòng trả sớm!
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[['📤', myActive.length, 'Đang mượn', 'border-primary-500'],
          ['⚠️', overdueCount, 'Quá hạn', 'border-sbu-red'],
          ['✅', myHistory.length, 'Đã trả', 'border-green-500'],
          ['📬', myReqs.filter(r=>r.status==='waiting').length, 'Đặt trước', 'border-amber-500'],
        ].map(([icon,n,label,border]) => (
          <div key={label} className={clsx('card p-5 border-t-4', border)}>
            <div className="text-3xl font-extrabold text-gray-900">{n}</div>
            <div className="text-sm text-gray-400 mt-1">{icon} {label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200 mb-6">
        {TABS.map(([v,l]) => (
          <button key={v} onClick={() => setTab(v)}
            className={clsx('px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all',
              tab===v ? 'text-primary-600 border-primary-500' : 'text-gray-400 border-transparent hover:text-gray-600')}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'active' && (
        myActive.length === 0
          ? <Empty icon="📚" msg="Chưa mượn sách nào" action={<button className="btn btn-primary mt-3" onClick={() => navigate('/catalog')}>Khám phá tủ sách</button>} />
          : <div className="flex flex-col gap-3">
            {myActive.map(b => {
              const book = books.find(bk=>bk.id===b.bookId)
              const od = isOverdue(b.dueDate)
              const dl = daysLeft(b.dueDate)
              return (
                <div key={b.id} className={clsx('card p-4 flex items-center gap-4', od ? 'border-l-4 border-sbu-red' : dl<=3 ? 'border-l-4 border-amber-400' : 'border-l-4 border-green-400')}>
                  {book?.coverUrl && <img src={book.coverUrl} alt={book.title} className="w-12 h-16 object-cover rounded-lg shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 truncate">{book?.title}</div>
                    <div className="text-sm text-gray-400">{book?.author}</div>
                    <div className={clsx('text-xs font-medium mt-1', od?'text-sbu-red':dl<=3?'text-amber-600':'text-green-600')}>
                      {od ? `⚠️ Quá hạn ${Math.abs(dl)} ngày` : `📅 Còn ${dl} ngày · hạn ${b.dueDate}`}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {book?.hasOnline && <button className="btn btn-outline btn-sm" onClick={() => navigate(`/reader/${book.id}`)}>Đọc</button>}
                    <button className={clsx('btn btn-sm', od?'btn-danger':'btn-subtle')} onClick={() => handleReturn(b.id)}>Trả sách</button>
                  </div>
                </div>
              )
            })}
          </div>
      )}

      {tab === 'history' && (
        myHistory.length === 0 ? <Empty icon="🕐" msg="Chưa có lịch sử" /> :
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-gray-50 border-b border-gray-200">
              {['Sách','Ngày mượn','Ngày trả',''].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">{h}</th>)}
            </tr></thead>
            <tbody>
              {myHistory.map(b=>{const bk=books.find(x=>x.id===b.bookId);return(
                <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-sm">{bk?.title||'—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{b.borrowDate}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{b.returnDate}</td>
                  <td className="px-4 py-3"><span className="badge badge-green">✅ Đã trả</span></td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'reserve' && (
        myReqs.length === 0 ? <Empty icon="📬" msg="Chưa có đặt trước" sub="Khi sách đang được mượn, bấm 'Đặt trước' để nhận thông báo." /> :
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-gray-50 border-b border-gray-200">
              {['Sách','Ngày đặt','Trạng thái'].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">{h}</th>)}
            </tr></thead>
            <tbody>
              {myReqs.map(r=>(
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-sm">{r.bookTitle}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{r.date}</td>
                  <td className="px-4 py-3">{r.status==='waiting'?<span className="badge badge-amber">⏳ Đang chờ</span>:r.status==='ready'?<span className="badge badge-green">✅ Sẵn sàng</span>:<span className="badge badge-gray">Hoàn thành</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function AdminDash({ books, borrows, requests, fetchBorrows, fetchRequests, toast }) {
  const [tab, setTab] = useState('overview')
  const [allUsers, setAllUsers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editBook, setEditBook] = useState(null)

  const activeB = borrows.filter(b=>!b.returnDate)
  const overdueB = activeB.filter(b=>isOverdue(b.dueDate))
  const members = allUsers.filter(u=>u.role==='user')
  const pending = requests.filter(r=>r.status==='waiting')

  useEffect(() => {
    api.get('/auth/me').then(() => {}).catch(()=>{})
    // Load all users for admin
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${localStorage.getItem('sbu3_token')}` } })
      .then(r=>r.json()).then(()=>{})
  }, [])

  const handleReturn = async (borrowId) => {
    try {
      await api.put(`/borrows/${borrowId}`, {})
      await fetchBorrows()
      toast('Đã xác nhận trả sách ✅')
    } catch (e) { toast(e.error||'Lỗi','error') }
  }

  const handleApprove = async (reqId) => {
    try {
      await api.put('/requests', { id: reqId, status: 'ready' })
      await fetchRequests()
      toast('Đã duyệt ✅')
    } catch (e) { toast(e.error||'Lỗi','error') }
  }

  const handleDeleteBook = async (id) => {
    if (!confirm('Xóa sách này?')) return
    try {
      await api.delete(`/books/${id}`)
      window.location.reload()
    } catch (e) { toast(e.error||'Lỗi','error') }
  }

  const TABS = [['overview','📊 Tổng quan'],['books',`📗 Sách (${books.length})`],['borrows',`📤 Đang mượn (${activeB.length})`],['requests',`📬 Yêu cầu ${pending.length>0?`(${pending.length})`:''}`]]

  return (
    <div>
      {/* Admin stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {[['📚',books.length,'Tổng sách','border-primary-500'],
          ['✅',books.length-activeB.length,'Sẵn có','border-green-500'],
          ['📤',activeB.length,'Đang mượn','border-amber-500'],
          ['⚠️',overdueB.length,'Quá hạn','border-sbu-red'],
          ['📬',pending.length,'Chờ duyệt','border-amber-500'],
        ].map(([icon,n,label,border])=>(
          <div key={label} className={clsx('card p-4 border-t-4',border)}>
            <div className="text-2xl font-extrabold text-gray-900">{n}</div>
            <div className="text-xs text-gray-400 mt-1">{icon} {label}</div>
          </div>
        ))}
      </div>

      {overdueB.length > 0 && (
        <div className="card p-5 border-l-4 border-sbu-red mb-6">
          <div className="font-bold text-sbu-red mb-3">⚠️ Sách quá hạn ({overdueB.length})</div>
          {overdueB.map(b=>{const bk=books.find(x=>x.id===b.bookId);return(
            <div key={b.id} className="flex justify-between py-2 border-b border-gray-100 text-sm">
              <span className="font-semibold">{bk?.title}</span>
              <span className="text-sbu-red font-bold">Quá {Math.abs(daysLeft(b.dueDate))} ngày</span>
            </div>
          )})}
        </div>
      )}

      <div className="flex gap-0 border-b border-gray-200 mb-6 overflow-x-auto">
        {TABS.map(([v,l])=>(
          <button key={v} onClick={()=>setTab(v)}
            className={clsx('px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all whitespace-nowrap',
              tab===v?'text-primary-600 border-primary-500':'text-gray-400 border-transparent hover:text-gray-600')}>
            {l}
          </button>
        ))}
      </div>

      {tab==='overview' && <div className="text-gray-400 text-sm">Chọn tab phía trên để quản lý.</div>}

      {tab==='books' && (
        <div>
          <div className="flex justify-end mb-4">
            <button className="btn btn-primary btn-sm" onClick={()=>{setEditBook(null);setShowForm(true)}}>+ Thêm sách</button>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead><tr className="bg-gray-50 border-b border-gray-200">
                {['Sách','Tác giả','Thể loại','Năm','Rating','Online',''].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">{h}</th>)}
              </tr></thead>
              <tbody>
                {books.map(b=>(
                  <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-sm">{b.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{b.author}</td>
                    <td className="px-4 py-3"><span className="badge badge-blue">{b.genre}</span></td>
                    <td className="px-4 py-3 text-sm text-gray-500">{b.year}</td>
                    <td className="px-4 py-3 text-sm font-bold text-amber-500">★ {b.rating}</td>
                    <td className="px-4 py-3">{b.hasOnline?<span className="badge badge-green">✓</span>:<span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="btn btn-subtle btn-sm" onClick={()=>{setEditBook(b);setShowForm(true)}}>Sửa</button>
                        <button className="btn btn-danger btn-sm" onClick={()=>handleDeleteBook(b.id)}>Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {showForm && <BookForm book={editBook} onClose={()=>setShowForm(false)} onSave={()=>{setShowForm(false);window.location.reload()}} toast={toast} />}
        </div>
      )}

      {tab==='borrows' && (
        activeB.length===0 ? <Empty icon="📤" msg="Không có sách nào đang mượn" /> :
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-gray-50 border-b border-gray-200">
              {['Sách','Ngày mượn','Hạn trả','Trạng thái',''].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">{h}</th>)}
            </tr></thead>
            <tbody>
              {activeB.map(b=>{const bk=books.find(x=>x.id===b.bookId);const od=isOverdue(b.dueDate);const dl=daysLeft(b.dueDate);return(
                <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-sm">{bk?.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{b.borrowDate}</td>
                  <td className={clsx('px-4 py-3 text-sm font-medium',od?'text-sbu-red':'text-gray-500')}>{b.dueDate}</td>
                  <td className="px-4 py-3">{od?<span className="badge badge-red">Quá {Math.abs(dl)}d</span>:dl<=3?<span className="badge badge-amber">Sắp hạn</span>:<span className="badge badge-green">Đúng hạn</span>}</td>
                  <td className="px-4 py-3"><button className="btn btn-outline btn-sm" onClick={()=>handleReturn(b.id)}>Xác nhận trả</button></td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      )}

      {tab==='requests' && (
        requests.length===0 ? <Empty icon="📬" msg="Chưa có yêu cầu đặt trước" /> :
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead><tr className="bg-gray-50 border-b border-gray-200">
              {['Sách','Người đặt','Ngày đặt','Trạng thái',''].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">{h}</th>)}
            </tr></thead>
            <tbody>
              {requests.map(r=>(
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-sm">{r.bookTitle}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{r.userName}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{r.date}</td>
                  <td className="px-4 py-3">{r.status==='waiting'?<span className="badge badge-amber">⏳ Đang chờ</span>:r.status==='ready'?<span className="badge badge-green">✅ Sẵn sàng</span>:<span className="badge badge-gray">Xong</span>}</td>
                  <td className="px-4 py-3">{r.status==='waiting'&&<button className="btn btn-primary btn-sm" onClick={()=>handleApprove(r.id)}>Duyệt</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function BookForm({ book, onClose, onSave, toast }) {
  const [form, setForm] = useState(book || { title:'',author:'',genre:'',year:2024,rating:4.5,gutenbergId:'',hasOnline:false,desc:'',coverUrl:'' })
  const set = (k,v) => setForm(p=>({...p,[k]:v}))

  const handleSave = async () => {
    try {
      if (book) await api.put(`/books/${book.id}`, form)
      else await api.post('/books', form)
      toast(book?'Đã cập nhật ✅':'Đã thêm sách 📗')
      onSave()
    } catch (e) { toast(e.error||'Lỗi','error') }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg text-gray-900">{book?'Sửa sách':'Thêm sách mới'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><label className="block text-xs font-bold text-gray-500 mb-1">Tên sách *</label><input className="input" value={form.title} onChange={e=>set('title',e.target.value)} /></div>
          <div><label className="block text-xs font-bold text-gray-500 mb-1">Tác giả</label><input className="input" value={form.author} onChange={e=>set('author',e.target.value)} /></div>
          <div><label className="block text-xs font-bold text-gray-500 mb-1">Thể loại</label><input className="input" value={form.genre} onChange={e=>set('genre',e.target.value)} /></div>
          <div><label className="block text-xs font-bold text-gray-500 mb-1">Năm XB</label><input className="input" type="number" value={form.year} onChange={e=>set('year',+e.target.value)} /></div>
          <div><label className="block text-xs font-bold text-gray-500 mb-1">Rating</label><input className="input" type="number" step="0.1" min="1" max="5" value={form.rating} onChange={e=>set('rating',+e.target.value)} /></div>
          <div><label className="block text-xs font-bold text-gray-500 mb-1">Gutenberg ID</label><input className="input" value={form.gutenbergId} onChange={e=>set('gutenbergId',+e.target.value)} /></div>
          <div className="flex items-center gap-2 pt-5"><input type="checkbox" checked={form.hasOnline} onChange={e=>set('hasOnline',e.target.checked)} className="w-4 h-4 accent-primary-500" /><label className="text-sm font-medium text-gray-700">Có bản đọc online</label></div>
          <div className="col-span-2"><label className="block text-xs font-bold text-gray-500 mb-1">Cover URL</label><input className="input" value={form.coverUrl} onChange={e=>set('coverUrl',e.target.value)} /></div>
          <div className="col-span-2"><label className="block text-xs font-bold text-gray-500 mb-1">Mô tả</label><textarea className="input resize-none h-20" value={form.desc} onChange={e=>set('desc',e.target.value)} /></div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button className="btn btn-subtle" onClick={onClose}>Hủy</button>
          <button className="btn btn-primary" onClick={handleSave}>{book?'Lưu':'Thêm sách'}</button>
        </div>
      </div>
    </div>
  )
}

function Empty({ icon, msg, sub, action }) {
  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-3">{icon}</div>
      <div className="font-semibold text-gray-600 mb-1">{msg}</div>
      {sub && <div className="text-sm text-gray-400">{sub}</div>}
      {action}
    </div>
  )
}
