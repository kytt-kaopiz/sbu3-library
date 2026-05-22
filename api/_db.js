import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
})

export async function readDB(name) {
  const data = await redis.get(name)
  if (!data) return []
  return Array.isArray(data) ? data : []
}

export async function writeDB(name, data) {
  await redis.set(name, data)
}

export function genId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

export function today() {
  return new Date().toISOString().split('T')[0]
}

export function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}
