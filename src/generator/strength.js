import { MOVEMENTS } from '../data/movements.js'

// acc = number of accessories paired with the main lift; alt = alternate main/accessory each minute.
export const STRENGTH_TEMPLATES = [
  { interval: 180, rounds: 5, mainReps: [5, 6, 8], acc: 1 },
  { interval: 180, rounds: 5, mainReps: [3, 5, 8], acc: 2 },
  { interval: 150, rounds: 5, mainReps: [3, 4, 5], acc: 1 },
  { interval: 240, rounds: 4, mainReps: [8, 10, 12], acc: 1 },
  { interval: 120, rounds: 6, mainReps: [3, 5], acc: 0 },
  { interval: 90, rounds: 5, mainReps: [5], acc: 1 },
  { interval: 60, rounds: 10, mainReps: [2, 3], acc: 0 },
  { interval: 60, rounds: 10, mainReps: [3, 5], acc: 1, alt: true },
]

export function intervalHeading(interval, rounds, alt = false) {
  if (interval === 60) return `${alt ? 'ALT EMOM' : 'EMOM'} x ${rounds}`
  const m = Math.floor(interval / 60)
  const s = String(interval % 60).padStart(2, '0')
  return `Every ${m}:${s} Minutes x ${rounds}`
}

export function buildStrength(rng, focus) {
  const main = rng.pick(MOVEMENTS.filter((m) => m.roles.includes('main') && m.focus === focus))
  const t = rng.pick(STRENGTH_TEMPLATES)
  const lines = [{ movementId: main.id, base: Math.min(rng.pick(t.mainReps), main.repCap ?? 99) }]
  const patterns = new Set([main.pattern])
  for (const acc of rng.shuffle(MOVEMENTS.filter((m) => m.roles.includes('acc')))) {
    if (lines.length > t.acc) break
    if (patterns.has(acc.pattern)) continue
    patterns.add(acc.pattern)
    lines.push({ movementId: acc.id, base: acc.base })
  }
  if (t.alt) lines.forEach((l, i) => (l.prefix = i === 0 ? 'Odd: ' : 'Even: '))
  return {
    id: 'A',
    kind: 'strength',
    title: main.title,
    window: '10:00 - 30:00',
    goal: null,
    energy: null,
    tags: [],
    heading: [intervalHeading(t.interval, t.rounds, t.alt)],
    note: null,
    alt: Boolean(t.alt),
    lines,
    timer: { mode: 'interval', interval: t.interval, rounds: t.rounds },
  }
}
