import { readDB } from '../_db.js'
import { cors, json, getUser } from '../_auth.js'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method === 'GET') {
    const books = readDB('books')
    const borrows = readDB('borrows')
    const result = books.map(b => ({
      ...b,
      isBorrowed: borrows.some(br => br.bookId === b.id && !br.returnDate),
    }))
    return json(res, result)
  }

  // POST — admin only
  if (req.method === 'POST') {
    const payload = await getUser(req)
    if (!payload || payload.role !== 'admin') return json(res, { error: 'Forbidden' }, 403)
    const books = readDB('books')
    const newBook = { id: Date.now(), ...req.body }
    books.push(newBook)
    const { writeDB } = await import('../_db.js')
    writeDB('books', books)
    return json(res, newBook, 201)
  }
}
