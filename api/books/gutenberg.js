import { cors, json } from '../_auth.js'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { gutenbergId } = req.query
  if (!gutenbergId) return json(res, { error: 'gutenbergId required' }, 400)

  try {
    // Try plain text first
    const url = `https://www.gutenberg.org/cache/epub/${gutenbergId}/pg${gutenbergId}.txt`
    const r = await fetch(url)
    if (!r.ok) throw new Error('Not found')
    let text = await r.text()

    // Clean up Gutenberg header/footer boilerplate
    const startMarkers = [
      '*** START OF THE PROJECT GUTENBERG',
      '***START OF THE PROJECT GUTENBERG',
      '*END*THE SMALL PRINT',
    ]
    const endMarkers = [
      '*** END OF THE PROJECT GUTENBERG',
      '***END OF THE PROJECT GUTENBERG',
      'End of the Project Gutenberg',
      'End of Project Gutenberg',
    ]

    for (const m of startMarkers) {
      const idx = text.indexOf(m)
      if (idx !== -1) {
        text = text.slice(text.indexOf('\n', idx) + 1)
        break
      }
    }
    for (const m of endMarkers) {
      const idx = text.indexOf(m)
      if (idx !== -1) {
        text = text.slice(0, idx)
        break
      }
    }

    // Split into chapters (rough heuristic)
    const lines = text.split('\n')
    const chapters = []
    let currentTitle = 'Introduction'
    let currentLines = []

    const chapterRegex = /^(CHAPTER|Chapter|PART|Part|BOOK|Book|Section|SECTION|I\.|II\.|III\.|IV\.|V\.|VI\.|VII\.|VIII\.|IX\.|X\.)\s/

    for (const line of lines) {
      if (chapterRegex.test(line.trim()) && line.trim().length < 80) {
        if (currentLines.length > 50) {
          chapters.push({ title: currentTitle, content: currentLines.join('\n') })
        }
        currentTitle = line.trim()
        currentLines = []
      } else {
        currentLines.push(line)
      }
    }
    if (currentLines.length > 50) {
      chapters.push({ title: currentTitle, content: currentLines.join('\n') })
    }

    // If no chapters detected, split by length
    if (chapters.length === 0) {
      const CHUNK = 3000
      const words = text.split(/\s+/)
      for (let i = 0; i < words.length; i += CHUNK) {
        chapters.push({
          title: `Part ${Math.floor(i / CHUNK) + 1}`,
          content: words.slice(i, i + CHUNK).join(' ')
        })
      }
    }

    return json(res, { chapters: chapters.slice(0, 50) }) // max 50 chapters
  } catch (err) {
    return json(res, { error: 'Failed to fetch from Gutenberg', detail: err.message }, 502)
  }
}
