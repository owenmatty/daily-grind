import { MOVEMENTS } from '../data/movements.js'

// acc = number of accessories paired with the main lift; alt = alternate main/accessory each minute.
export const STRENGTH_TEMPLATES = [
  { interval: 180, rounds: 5, mainReps: [5, 6, 8], acc: 1 },
  { interval: 180, rounds: 5, mainReps: [5, 8], acc: 2 },
  { interval: 150, rounds: 5, mainReps: [5], acc: 1 },
  { interval: 120, rounds: 5, mainReps: [5], acc: 1 },
  { interval: 240, rounds: 4, mainReps: [12], acc: 1 },
  { interval: 90, rounds: 5, mainReps: [5], acc: 1 },
  { interval: 60, rounds: 10, mainReps: [5], acc: 1, alt: true },
  // Low-rep EMOMs are only used for the Olympic lifts, as in the gym app.
  { interval: 60, rounds: 10, mainReps: [2, 3], acc: 0, olympic: true },
]

export function intervalHeading(interval, rounds, alt = false) {
  if (interval === 60) return `${alt ? 'ALT EMOM' : 'EMOM'} x ${rounds}`
  const m = Math.floor(interval / 60)
  const s = String(interval % 60).padStart(2, '0')
  return `Every ${m}:${s} Minutes x ${rounds}`
}

export function buildStrength(rng, focus) {
  const main = rng.pick(MOVEMENTS.filter((m) => m.roles.includes('main') && m.focus === focus))
  const t = rng.pick(STRENGTH_TEMPLATES.filter((x) => Boolean(x.olympic) === (focus === 'olympic')))
  const lines = [{ movementId: main.id, base: Math.min(rng.pick(t.mainReps), main.repCap ?? 99) }]
  const patterns = new Set([main.pattern])
  for (const acc of rng.shuffle(MOVEMENTS.filter((m) => m.roles.includes('acc')))) {
    if (lines.length > t.acc) break
    if (patterns.has(acc.pattern)) continue
    patterns.add(acc.pattern)
    lines.push({ movementId: acc.id, base: acc.base })
  }
  if (main.id === 'power_clean' && rng.next() < 0.6) lines.push({ movementId: 'clean_overhead', base: 2 })
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
    building: Boolean(main.building),
    lines,
    timer: { mode: 'interval', interval: t.interval, rounds: t.rounds },
  }
}
