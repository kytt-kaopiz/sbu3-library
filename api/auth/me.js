import { readDB } from '../_db.js'
import { getUser, cors, json } from '../_auth.js'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const payload = await getUser(req)
  if (!payload) return json(res, { error: 'Unauthorized' }, 401)

  const users = await readDB('users')
  const user = users.find(u => u.id === payload.userId)
  if (!user) return json(res, { error: 'User not found' }, 404)

  const { googleId, ...safe } = user
  return json(res, safe)
}
