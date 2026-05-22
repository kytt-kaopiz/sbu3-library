import { readDB, writeDB, genId, today } from '../_db.js'
import { signToken, cors, json } from '../_auth.js'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { code } = req.query
  if (!code) return json(res, { error: 'No code provided' }, 400)

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.APP_URL}/api/auth/google`,
        grant_type: 'authorization_code',
      }),
    })
    const tokens = await tokenRes.json()
    if (!tokens.access_token) throw new Error('No access token')

    // Get user info from Google
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    const profile = await profileRes.json()

    // Upsert user in DB
    const users = readDB('users')
    let user = users.find(u => u.googleId === profile.id)
    if (!user) {
      user = {
        id: genId(),
        googleId: profile.id,
        name: profile.name,
        email: profile.email,
        avatar: profile.picture,
        role: profile.email === process.env.ADMIN_EMAIL ? 'admin' : 'user',
        joinDate: today(),
      }
      users.push(user)
      writeDB('users', users)
    }

    // Sign JWT
    const token = await signToken({ userId: user.id, role: user.role })

    // Redirect to frontend with token
    res.redirect(`${process.env.APP_URL}/auth/callback?token=${token}`)
  } catch (err) {
    console.error(err)
    res.redirect(`${process.env.APP_URL}/auth/error`)
  }
}
