import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const DATA_DIR = join(process.cwd(), 'data')

export function readDB(name) {
  try {
    return JSON.parse(readFileSync(join(DATA_DIR, `${name}.json`), 'utf8'))
  } catch {
    return []
  }
}

export function writeDB(name, data) {
  writeFileSync(join(DATA_DIR, `${name}.json`), JSON.stringify(data, null, 2))
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
