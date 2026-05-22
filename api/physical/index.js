import { readDB, writeDB, genId, today } from '../_db.js'
import { getUser, cors, json } from '../_auth.js'
import { readFileSync } from 'fs'
import { join } from 'path'

async function getPhysicalBooks() {
  let books = await readDB('physical_books')
  if (!books || books.length === 0) {
    try {
      const raw = readFileSync(join(process.cwd(), 'data/physical-books.json'), 'utf8')
      books = JSON.parse(raw)
      await writeDB('physical_books', books)
    } catch { books = [] }
  }
  return books
}

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method === 'GET') {
    const books = await getPhysicalBooks()
    const borrows = (await readDB('physical_borrows')) || []
    const result = books.map(b => ({
      ...b,
      activeBorrow: borrows.find(br => br.bookId === b.id && !['returned','rejected'].includes(br.status)) || null,
    }))
    return json(res, result)
  }

  const payload = await getUser(req)
  if (!payload) return json(res, { error: 'Unauthorized' }, 401)
  if (payload.role !== 'admin') return json(res, { error: 'Forbidden' }, 403)

  if (req.method === 'POST') {
    const books = await getPhysicalBooks()
    const newBook = { id: `p${Date.now()}`, stt: books.length + 1, status: 'available', ...req.body }
    books.push(newBook)
    await writeDB('physical_books', books)
    return json(res, newBook, 201)
  }
}
