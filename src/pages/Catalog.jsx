import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useStore } from '../store'
import BookCard from '../components/BookCard'
import BookModal from '../components/BookModal'

const GENRES = (books) => ['Tất cả', ...new Set(books.map(b => b.genre))]

export default function Catalog() {
  const { books, fetchBorrows, fetchRequests, user } = useStore()
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('Tất cả')
  const [sort, setSort] = useState('rating')
  const [availOnly, setAvailOnly] = useState(false)
  const [selectedBook, setSelectedBook] = useState(null)
  const [params, setParams] = useSearchParams()

  useEffect(() => {
    if (user) { fetchBorrows(); fetchRequests() }
    const bookId = params.get('book')
    if (bookId) {
      const book = books.find(b => b.id === parseInt(bookId))
      if (book) setSelectedBook(book)
    }
  }, [user, books])

  const filtered = books
    .filter(b => {
      const q = search.toLowerCase()
      return (b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q))
        && (genre === 'Tất cả' || b.genre === genre)
        && (!availOnly || !b.isBorrowed)
    })
    .sort((a, b) => {
      if (sort === 'rating') return b.rating - a.rating
      if (sort === 'year') return b.year - a.year
      return a.title.localeCompare(b.title, 'vi')
    })

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-fade-up">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">📚 Tủ Sách</h1>
        <p className="text-gray-400">{books.length} đầu sách · {books.filter(b=>b.hasOnline).length} có bản đọc online</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input className="input pl-9" placeholder="Tìm tên sách, tác giả..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="rating">★ Đánh giá</option>
          <option value="year">📅 Mới nhất</option>
          <option value="title">A-Z</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer font-medium whitespace-nowrap">
          <input type="checkbox" checked={availOnly} onChange={e => setAvailOnly(e.target.checked)} className="w-4 h-4 accent-primary-500" />
          Còn sẵn
        </label>
      </div>

      {/* Genre pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {GENRES(books).map(g => (
          <button key={g} onClick={() => setGenre(g)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border-2 transition-all ${
              g === genre ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600'
            }`}>{g}</button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">📭</div>
          <div className="font-semibold text-gray-600">Không tìm thấy sách phù hợp</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {filtered.map(book => (
            <div key={book.id} onClick={() => { setSelectedBook(book); setParams({ book: book.id }) }}>
              <BookCard book={book} />
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedBook && (
        <BookModal book={selectedBook} onClose={() => { setSelectedBook(null); setParams({}) }} />
      )}
    </div>
  )
}
