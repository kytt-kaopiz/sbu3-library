import { readDB, writeDB, today } from '../_db.js'
import { getUser, cors, json } from '../_auth.js'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const payload = await getUser(req)
  if (!payload) return json(res, { error: 'Unauthorized' }, 401)

  if (req.method === 'PUT') {
    const borrows = readDB('borrows')
    const idx = borrows.findIndex(b => b.id === req.query.id)
    if (idx === -1) return json(res, { error: 'Not found' }, 404)

    const borrow = borrows[idx]
    if (borrow.userId !== payload.userId && payload.role !== 'admin') {
      return json(res, { error: 'Forbidden' }, 403)
    }

    borrows[idx].returnDate = today()
    borrows[idx].status = 'returned'
    writeDB('borrows', borrows)

    // Notify waiting requests
    const requests = readDB('requests')
    const waiting = requests.find(r => r.bookId === borrow.bookId && r.status === 'waiting')
    if (waiting) {
      const idx2 = requests.findIndex(r => r.id === waiting.id)
      requests[idx2].status = 'ready'
      writeDB('requests', requests)
    }

    return json(res, borrows[idx])
  }
}
