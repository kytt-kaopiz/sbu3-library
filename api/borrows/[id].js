import { readDB, writeDB, today } from '../_db.js'
import { getUser, cors, json } from '../_auth.js'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const payload = await getUser(req)
  if (!payload) return json(res, { error: 'Unauthorized' }, 401)

  if (req.method === 'PUT') {
    const borrows = await readDB('borrows')
    const idx = borrows.findIndex(b => b.id === req.query.id)
    if (idx === -1) return json(res, { error: 'Not found' }, 404)

    if (borrows[idx].userId !== payload.userId && payload.role !== 'admin')
      return json(res, { error: 'Forbidden' }, 403)

    borrows[idx].returnDate = today()
    borrows[idx].status = 'returned'
    await writeDB('borrows', borrows)

    // notify waiting requests
    const requests = await readDB('requests')
    const waiting = requests.find(r => r.bookId === borrows[idx].bookId && r.status === 'waiting')
    if (waiting) {
      const i2 = requests.findIndex(r => r.id === waiting.id)
      requests[i2].status = 'ready'
      await writeDB('requests', requests)
    }

    return json(res, borrows[idx])
  }
}
