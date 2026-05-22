import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

export default function BookCard({ book, onBorrow, onReserve, myBorrowCount = 0 }) {
  const navigate = useNavigate()
  const { title, author, genre, year, rating, coverUrl, isBorrowed, hasOnline } = book

  return (
    <div className="book-card-tilt card overflow-hidden cursor-pointer group"
      onClick={() => navigate(`/catalog?book=${book.id}`)}>
      {/* Cover */}
      <div className={clsx('h-44 relative overflow-hidden flex items-center justify-center',
        isBorrowed ? 'bg-red-50' : hasOnline ? 'bg-gradient-to-br from-blue-50 to-primary-100' : 'bg-primary-50')}>
        {coverUrl ? (
          <img src={coverUrl} alt={title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
        ) : null}
        <div className="hidden items-center justify-center text-5xl w-full h-full">📖</div>

        {/* Tags */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {isBorrowed && <span className="badge badge-red text-[10px]">ĐANG MƯỢN</span>}
          {hasOnline && !isBorrowed && <span className="badge badge-blue text-[10px]">📖 ONLINE</span>}
        </div>
      </div>

      {/* Info */}
      <div className="p-3.5">
        <div className="font-bold text-sm text-gray-900 leading-snug line-clamp-2 mb-0.5">{title}</div>
        <div className="text-xs text-gray-400 mb-2.5">{author} · {year}</div>
        <div className="flex items-center justify-between">
          <span className="badge badge-blue">{genre}</span>
          <span className="text-xs font-semibold text-amber-500">★ {rating}</span>
        </div>
      </div>
    </div>
  )
}
