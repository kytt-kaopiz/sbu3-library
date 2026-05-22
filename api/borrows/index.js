import { readDB, writeDB, genId, today, addDays } from '../_db.js'
import { getUser, cors, json } from '../_auth.js'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const payload = await getUser(req)
  if (!payload) return json(res, { error: 'Unauthorized' }, 401)

  const borrows = readDB('borrows')

  if (req.method === 'GET') {
    if (payload.role === 'admin') return json(res, borrows)
    return json(res, borrows.filter(b => b.userId === payload.userId))
  }

  if (req.method === 'POST') {
    const { bookId } = req.body
    if (!bookId) return json(res, { error: 'bookId required' }, 400)

    const existing = borrows.find(b => b.bookId === bookId && !b.returnDate)
    if (existing) return json(res, { error: 'Sách đang được mượn' }, 409)

    const myActive = borrows.filter(b => b.userId === payload.userId && !b.returnDate)
    if (myActive.length >= 3) return json(res, { error: 'Bạn đang mượn tối đa 3 cuốn' }, 409)

    const due = addDays(today(), 14)
    const borrow = {
      id: genId(),
      bookId: parseInt(bookId),
      userId: payload.userId,
      borrowDate: today(),
      dueDate: due,
      returnDate: null,
    }
    borrows.push(borrow)
    writeDB('borrows', borrows)
    return json(res, borrow, 201)
  }
}
