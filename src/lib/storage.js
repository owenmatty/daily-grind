const LEVEL_KEY = 'dg.level'
const SCORES_KEY = 'dg.scores'
const DEFAULT_LEVEL = 2

function read(key, fallback) {
  try {
    const raw = globalThis.localStorage.getItem(key)
    return raw == null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    globalThis.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function storageAvailable() {
  try {
    globalThis.localStorage.setItem('dg.test', '1')
    globalThis.localStorage.removeItem('dg.test')
    return true
  } catch {
    return false
  }
}

export function loadLevel() {
  const n = read(LEVEL_KEY, DEFAULT_LEVEL)
  return Number.isInteger(n) && n >= 0 && n <= 5 ? n : DEFAULT_LEVEL
}

export function saveLevel(n) {
  return write(LEVEL_KEY, n)
}

const scoreKey = (date, blockId) => `${date}|${blockId}`

export function loadScores(date, blockId) {
  return read(SCORES_KEY, {})[scoreKey(date, blockId)] ?? []
}

export function addScore(date, blockId, entry) {
  const all = read(SCORES_KEY, {})
  const key = scoreKey(date, blockId)
  all[key] = [...(all[key] ?? []), entry]
  return write(SCORES_KEY, all)
}
