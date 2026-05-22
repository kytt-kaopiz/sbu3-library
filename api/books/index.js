import { readDB, writeDB } from '../_db.js'
import { cors, json, getUser } from '../_auth.js'

// Seed books data
import { createRequire } from 'module'
import { readFileSync } from 'fs'
import { join } from 'path'

async function getBooks() {
  let books = await readDB('books')
  if (!books || books.length === 0) {
    // Seed from JSON file
    try {
      const raw = readFileSync(join(process.cwd(), 'data/books.json'), 'utf8')
      books = JSON.parse(raw)
      await writeDB('books', books)
    } catch {}
  }
  return books
}

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method === 'GET') {
    const books = await getBooks()
    const borrows = await readDB('borrows')
    const result = books.map(b => ({
      ...b,
      isBorrowed: borrows.some(br => br.bookId === b.id && !br.returnDate),
    }))
    return json(res, result)
  }

  if (req.method === 'POST') {
    const payload = await getUser(req)
    if (!payload || payload.role !== 'admin') return json(res, { error: 'Forbidden' }, 403)
    const books = await getBooks()
    const newBook = { id: Date.now(), ...req.body }
    books.push(newBook)
    await writeDB('books', books)
    return json(res, newBook, 201)
  }
}
