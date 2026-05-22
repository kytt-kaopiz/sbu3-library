import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import api from '../lib/api'
import clsx from 'clsx'

const FONT_SIZES = [14, 16, 18, 20, 22]
const THEMES = {
  light: { bg: 'bg-[#FAFAF8]', text: 'text-gray-800', nav: 'bg-white border-gray-200' },
  sepia: { bg: 'bg-[#F8F1E3]', text: 'text-[#5C4033]', nav: 'bg-[#F0E6CC] border-[#DDD0B0]' },
  dark:  { bg: 'bg-[#1A1A2E]', text: 'text-gray-300', nav: 'bg-[#16213E] border-gray-700' },
}
const HIGHLIGHT_COLORS = [
  { name: 'yellow', cls: 'highlight-yellow', label: '🟡' },
  { name: 'blue',   cls: 'highlight-blue',   label: '🔵' },
  { name: 'green',  cls: 'highlight-green',  label: '🟢' },
  { name: 'pink',   cls: 'highlight-pink',   label: '🩷' },
]

export default function Reader() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { books, user, readProgress, saveProgress, highlights, addHighlight, removeHighlight, toast } = useStore()

  const [chapters, setChapters] = useState([])
  const [chapterIdx, setChapterIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [fontSizeIdx, setFontSizeIdx] = useState(2)
  const [theme, setTheme] = useState('light')
  const [progress, setProgress] = useState(0)
  const [showHighlightMenu, setShowHighlightMenu] = useState(false)
  const [selection, setSelection] = useState(null)
  const [showTOC, setShowTOC] = useState(false)
  const [showHighlights, setShowHighlights] = useState(false)

  const bodyRef = useRef(null)
  const book = books.find(b => b.id === parseInt(id))
  const bookHighlights = highlights[id] || []

  useEffect(() => {
    if (!book) return
    if (!book.hasOnline) { navigate('/catalog'); return }
    loadChapters()
  }, [book])

  useEffect(() => {
    const saved = readProgress[id]
    if (saved && chapters.length > 0) {
      setChapterIdx(Math.min(saved.chapter, chapters.length - 1))
    }
  }, [chapters])

  const loadChapters = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get(`/books/gutenberg?gutenbergId=${book.gutenbergId}`)
      setChapters(data.chapters || [])
    } catch (e) {
      setError('Không thể tải nội dung sách. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const handleScroll = useCallback(() => {
    const el = bodyRef.current
    if (!el) return
    const pct = el.scrollHeight > el.clientHeight
      ? Math.round(el.scrollTop / (el.scrollHeight - el.clientHeight) * 100) : 100
    setProgress(pct)
    if (user) saveProgress(id, chapterIdx, el.scrollTop)
  }, [chapterIdx, id, user])

  const gotoChapter = (idx) => {
    setChapterIdx(idx)
    setShowTOC(false)
    setTimeout(() => bodyRef.current?.scrollTo(0, 0), 50)
  }

  const handleTextSelect = () => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed) { setShowHighlightMenu(false); return }
    const text = sel.toString().trim()
    if (text.length < 5) return
    setSelection({ text, range: sel.getRangeAt(0) })
    setShowHighlightMenu(true)
  }

  const doHighlight = (color) => {
    if (!selection || !user) return
    addHighlight(id, { text: selection.text, color: color.name, chapter: chapterIdx })
    toast(`Đã highlight đoạn văn ${color.label}`)
    setShowHighlightMenu(false)
    window.getSelection()?.removeAllRanges()
  }

  const themeObj = THEMES[theme]
  const fontSize = FONT_SIZES[fontSizeIdx]
  const currentChapter = chapters[chapterIdx]
  const overallProgress = chapters.length > 0
    ? Math.round(((chapterIdx + progress / 100) / chapters.length) * 100) : 0

  if (!book) return <div className="text-center py-20 text-gray-400">Không tìm thấy sách</div>

  return (
    <div className={clsx('fixed inset-0 flex flex-col z-40', themeObj.bg)}>
      {/* TOP NAV */}
      <div className={clsx('flex items-center justify-between px-4 h-14 border-b shrink-0', themeObj.nav)}>
        <button onClick={() => navigate(-1)} className="btn btn-subtle btn-sm">← Quay lại</button>
        <div className="text-center hidden sm:block">
          <div className={clsx('text-sm font-semibold', themeObj.text)}>{book.title}</div>
          <div className="text-xs text-gray-400">{currentChapter?.title || ''}</div>
        </div>
        <div className="flex items-center gap-1">
          {/* Font size */}
          <button onClick={() => setFontSizeIdx(i => Math.max(0, i-1))}
            className="btn btn-subtle btn-sm w-8 px-0 justify-center">A-</button>
          <button onClick={() => setFontSizeIdx(i => Math.min(FONT_SIZES.length-1, i+1))}
            className="btn btn-subtle btn-sm w-8 px-0 justify-center">A+</button>
          {/* Theme */}
          <button onClick={() => setTheme(t => t==='light'?'sepia':t==='sepia'?'dark':'light')}
            className="btn btn-subtle btn-sm w-8 px-0 justify-center">
            {theme === 'dark' ? '☀️' : theme === 'sepia' ? '🌙' : '📜'}
          </button>
          {/* TOC */}
          <button onClick={() => setShowTOC(s => !s)}
            className={clsx('btn btn-sm w-8 px-0 justify-center', showTOC ? 'btn-primary' : 'btn-subtle')}>☰</button>
          {/* Highlights */}
          {user && (
            <button onClick={() => setShowHighlights(s => !s)}
              className={clsx('btn btn-sm btn-subtle w-8 px-0 justify-center relative')}>
              🔖
              {bookHighlights.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 text-white text-[9px] rounded-full flex items-center justify-center">{bookHighlights.length}</span>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* TOC SIDEBAR */}
        {showTOC && (
          <div className={clsx('w-72 border-r overflow-y-auto shrink-0', themeObj.nav)}>
            <div className={clsx('p-4 font-bold text-sm border-b', themeObj.text, themeObj.nav)}>Mục lục ({chapters.length})</div>
            {chapters.map((ch, i) => (
              <button key={i} onClick={() => gotoChapter(i)}
                className={clsx('w-full text-left px-4 py-2.5 text-sm transition-colors border-b border-gray-100/20',
                  i === chapterIdx ? 'bg-primary-500/20 text-primary-600 font-semibold' : `${themeObj.text} hover:bg-primary-500/10`)}>
                {ch.title || `Chương ${i + 1}`}
              </button>
            ))}
          </div>
        )}

        {/* HIGHLIGHTS SIDEBAR */}
        {showHighlights && user && (
          <div className={clsx('w-72 border-r overflow-y-auto shrink-0', themeObj.nav)}>
            <div className={clsx('p-4 font-bold text-sm border-b', themeObj.text, themeObj.nav)}>
              Highlights ({bookHighlights.length})
            </div>
            {bookHighlights.length === 0 ? (
              <div className="p-4 text-sm text-gray-400">Chưa có highlight nào. Bôi chọn text để highlight!</div>
            ) : bookHighlights.map(hl => (
              <div key={hl.id} className={clsx('p-3 border-b border-gray-100/20 group')}>
                <div className={clsx('text-xs font-medium mb-1', `highlight-${hl.color}`, 'inline-block px-1 rounded')}>
                  {HIGHLIGHT_COLORS.find(c=>c.name===hl.color)?.label} Chương {hl.chapter+1}
                </div>
                <p className={clsx('text-sm line-clamp-3', themeObj.text)}>"{hl.text}"</p>
                <button onClick={() => removeHighlight(id, hl.id)}
                  className="text-xs text-red-400 hover:text-red-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Xóa
                </button>
              </div>
            ))}
          </div>
        )}

        {/* MAIN CONTENT */}
        <div ref={bodyRef} className="flex-1 overflow-y-auto" onScroll={handleScroll} onMouseUp={handleTextSelect}>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <p className={clsx('text-sm', themeObj.text)}>Đang tải nội dung từ Project Gutenberg...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
              <div className="text-5xl">😕</div>
              <p className="text-gray-500">{error}</p>
              <button className="btn btn-primary" onClick={loadChapters}>Thử lại</button>
            </div>
          ) : currentChapter ? (
            <div className="max-w-2xl mx-auto px-6 py-12 pb-24">
              <h2 className={clsx('font-serif text-2xl font-bold mb-10 text-center', themeObj.text)}>
                {currentChapter.title}
              </h2>
              <div className={clsx('font-serif reader-content leading-loose select-text', themeObj.text)}
                style={{ fontSize: `${fontSize}px`, lineHeight: '1.9' }}>
                {currentChapter.content.split('\n').filter(l => l.trim()).map((para, i) => (
                  <p key={i} className="mb-5">{para}</p>
                ))}
              </div>

              {/* Chapter nav */}
              <div className="flex justify-between mt-12 pt-6 border-t border-gray-200/30">
                {chapterIdx > 0
                  ? <button className="btn btn-outline btn-sm" onClick={() => gotoChapter(chapterIdx-1)}>← Chương trước</button>
                  : <span />}
                {chapterIdx < chapters.length - 1
                  ? <button className="btn btn-primary btn-sm" onClick={() => gotoChapter(chapterIdx+1)}>Chương sau →</button>
                  : <span className={clsx('text-sm', themeObj.text, 'opacity-50')}>Đã đọc xong 🎉</span>}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* BOTTOM PROGRESS */}
      <div className={clsx('shrink-0 px-4 py-2 border-t flex items-center gap-3', themeObj.nav)}>
        <span className="text-xs text-gray-400 shrink-0">
          {chapterIdx+1}/{chapters.length}
        </span>
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500 rounded-full transition-all duration-300"
            style={{ width: `${overallProgress}%` }} />
        </div>
        <span className="text-xs text-gray-400 shrink-0">{overallProgress}%</span>
      </div>

      {/* HIGHLIGHT MENU */}
      {showHighlightMenu && user && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-2xl px-4 py-3 flex items-center gap-2 z-50 border border-gray-200 animate-fade-up">
          <span className="text-xs text-gray-500 mr-1">Highlight:</span>
          {HIGHLIGHT_COLORS.map(c => (
            <button key={c.name} onClick={() => doHighlight(c)}
              className="text-lg hover:scale-125 transition-transform">{c.label}</button>
          ))}
          <button onClick={() => setShowHighlightMenu(false)} className="ml-2 text-gray-400 hover:text-gray-600 text-sm">✕</button>
        </div>
      )}
    </div>
  )
}
