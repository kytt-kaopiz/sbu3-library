import { readDB, writeDB } from '../_db.js'
import { cors, json, getUser } from '../_auth.js'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const id = parseInt(req.query.id)
  const books = await readDB('books')
  const idx = books.findIndex(b => b.id === id)
  if (idx === -1) return json(res, { error: 'Not found' }, 404)

  if (req.method === 'GET') return json(res, books[idx])

  const payload = await getUser(req)
  if (!payload || payload.role !== 'admin') return json(res, { error: 'Forbidden' }, 403)

  if (req.method === 'PUT') {
    books[idx] = { ...books[idx], ...req.body }
    await writeDB('books', books)
    return json(res, books[idx])
  }

  if (req.method === 'DELETE') {
    books.splice(idx, 1)
    await writeDB('books', books)
    return json(res, { ok: true })
  }
}
