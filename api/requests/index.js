import { readDB, writeDB, genId, today } from '../_db.js'
import { getUser, cors, json } from '../_auth.js'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const payload = await getUser(req)
  if (!payload) return json(res, { error: 'Unauthorized' }, 401)

  const requests = readDB('requests')

  if (req.method === 'GET') {
    if (payload.role === 'admin') return json(res, requests)
    return json(res, requests.filter(r => r.userId === payload.userId))
  }

  if (req.method === 'POST') {
    const { bookId } = req.body
    const books = readDB('books')
    const book = books.find(b => b.id === parseInt(bookId))
    if (!book) return json(res, { error: 'Book not found' }, 404)

    const existing = requests.find(r => r.bookId === parseInt(bookId) && r.userId === payload.userId && r.status === 'waiting')
    if (existing) return json(res, { error: 'Đã đặt trước rồi' }, 409)

    const users = readDB('users')
    const user = users.find(u => u.id === payload.userId)

    const req2 = {
      id: genId(),
      bookId: parseInt(bookId),
      bookTitle: book.title,
      userId: payload.userId,
      userName: user?.name || 'Unknown',
      date: today(),
      status: 'waiting',
    }
    requests.push(req2)
    writeDB('requests', requests)
    return json(res, req2, 201)
  }

  if (req.method === 'PUT') {
    // Admin approve
    if (payload.role !== 'admin') return json(res, { error: 'Forbidden' }, 403)
    const { id, status } = req.body
    const idx = requests.findIndex(r => r.id === id)
    if (idx === -1) return json(res, { error: 'Not found' }, 404)
    requests[idx].status = status
    writeDB('requests', requests)
    return json(res, requests[idx])
  }
}
