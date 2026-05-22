import { readDB, writeDB, genId, today, addDays } from '../_db.js'
import { getUser, cors, json } from '../_auth.js'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const payload = await getUser(req)
  if (!payload) return json(res, { error: 'Unauthorized' }, 401)

  const borrows = (await readDB('physical_borrows')) || []

  if (req.method === 'GET') {
    if (payload.role === 'admin') return json(res, borrows)
    return json(res, borrows.filter(b => b.userId === payload.userId))
  }

  if (req.method === 'POST') {
    const { bookId, note } = req.body
    const books = (await readDB('physical_books')) || []
    const book = books.find(b => b.id === bookId)
    if (!book) return json(res, { error: 'Không tìm thấy sách' }, 404)

    const active = borrows.find(b => b.bookId === bookId && !['returned','rejected'].includes(b.status))
    if (active) return json(res, { error: 'Sách đang được mượn hoặc có người đăng ký' }, 409)

    const myActive = borrows.filter(b => b.userId === payload.userId && b.status === 'approved')
    if (myActive.length >= 2) return json(res, { error: 'Bạn đang mượn tối đa 2 cuốn sách vật lý' }, 409)

    const users = (await readDB('users')) || []
    const user = users.find(u => u.id === payload.userId)

    const borrow = {
      id: genId(), bookId, bookTitle: book.title,
      userId: payload.userId, userName: user?.name || '', userEmail: user?.email || '',
      requestDate: today(), dueDate: null, returnDate: null,
      status: 'pending', note: note || '',
    }
    borrows.push(borrow)
    await writeDB('physical_borrows', borrows)
    return json(res, borrow, 201)
  }

  if (req.method === 'PUT') {
    const { id, action, dueDate } = req.body
    const idx = borrows.findIndex(b => b.id === id)
    if (idx === -1) return json(res, { error: 'Not found' }, 404)

    const isAdmin = payload.role === 'admin'
    const isOwner = borrows[idx].userId === payload.userId

    if (action === 'approve' && isAdmin) {
      borrows[idx].status = 'approved'
      borrows[idx].dueDate = dueDate || addDays(today(), 14)
      borrows[idx].approvedDate = today()
      const books = (await readDB('physical_books')) || []
      const bi = books.findIndex(b => b.id === borrows[idx].bookId)
      if (bi > -1) { books[bi].status = 'borrowed'; await writeDB('physical_books', books) }
    } else if (action === 'reject' && isAdmin) {
      borrows[idx].status = 'rejected'
    } else if (action === 'return' && (isOwner || isAdmin)) {
      borrows[idx].status = 'return_requested'
    } else if (action === 'confirm_return' && isAdmin) {
      borrows[idx].status = 'returned'
      borrows[idx].returnDate = today()
      const books = (await readDB('physical_books')) || []
      const bi = books.findIndex(b => b.id === borrows[idx].bookId)
      if (bi > -1) { books[bi].status = 'available'; await writeDB('physical_books', books) }
    } else {
      return json(res, { error: 'Invalid action' }, 400)
    }

    await writeDB('physical_borrows', borrows)
    return json(res, borrows[idx])
  }
}
