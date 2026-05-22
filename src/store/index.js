import { create } from 'zustand'
import api from '../lib/api'

export const useStore = create((set, get) => ({
  // Auth
  user: null,
  token: localStorage.getItem('sbu3_token'),
  setToken: (token) => {
    localStorage.setItem('sbu3_token', token)
    set({ token })
  },
  logout: () => {
    localStorage.removeItem('sbu3_token')
    set({ user: null, token: null })
  },
  fetchMe: async () => {
    try {
      const user = await api.get('/auth/me')
      set({ user })
    } catch {
      get().logout()
    }
  },

  // Books
  books: [],
  fetchBooks: async () => {
    const books = await api.get('/books')
    set({ books })
  },

  // Borrows
  borrows: [],
  fetchBorrows: async () => {
    const borrows = await api.get('/borrows')
    set({ borrows })
  },
  borrowBook: async (bookId) => {
    const borrow = await api.post('/borrows', { bookId })
    set(s => ({ borrows: [...s.borrows, borrow] }))
    await get().fetchBooks()
    return borrow
  },
  returnBook: async (borrowId) => {
    const updated = await api.put(`/borrows/${borrowId}`, {})
    set(s => ({ borrows: s.borrows.map(b => b.id === borrowId ? updated : b) }))
    await get().fetchBooks()
  },

  // Requests
  requests: [],
  fetchRequests: async () => {
    const requests = await api.get('/requests')
    set({ requests })
  },
  reserveBook: async (bookId) => {
    const req = await api.post('/requests', { bookId })
    set(s => ({ requests: [...s.requests, req] }))
    return req
  },

  // Reader state (localStorage-backed)
  readProgress: JSON.parse(localStorage.getItem('sbu3_progress') || '{}'),
  saveProgress: (bookId, chapter, scroll) => {
    const rp = { ...get().readProgress, [bookId]: { chapter, scroll, updatedAt: Date.now() } }
    localStorage.setItem('sbu3_progress', JSON.stringify(rp))
    set({ readProgress: rp })
  },

  highlights: JSON.parse(localStorage.getItem('sbu3_highlights') || '{}'),
  addHighlight: (bookId, highlight) => {
    const hl = get().highlights
    const bookHl = [...(hl[bookId] || []), { ...highlight, id: Date.now() }]
    const updated = { ...hl, [bookId]: bookHl }
    localStorage.setItem('sbu3_highlights', JSON.stringify(updated))
    set({ highlights: updated })
  },
  removeHighlight: (bookId, hlId) => {
    const hl = get().highlights
    const bookHl = (hl[bookId] || []).filter(h => h.id !== hlId)
    const updated = { ...hl, [bookId]: bookHl }
    localStorage.setItem('sbu3_highlights', JSON.stringify(updated))
    set({ highlights: updated })
  },

  // Toast
  toasts: [],
  toast: (msg, type = 'success') => {
    const id = Date.now()
    set(s => ({ toasts: [...s.toasts, { id, msg, type }] }))
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 3500)
  },
}))
