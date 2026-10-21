import { MOVEMENTS } from '../data/movements.js'

export const STRENGTH_TEMPLATES = [
  { interval: 180, rounds: 5, mainReps: [5, 6, 8], withAcc: true },
  { interval: 150, rounds: 5, mainReps: [3, 4, 5], withAcc: true },
  { interval: 120, rounds: 6, mainReps: [3, 5], withAcc: false },
  { interval: 60, rounds: 10, mainReps: [2, 3], withAcc: false },
]

export function intervalHeading(interval, rounds) {
  if (interval === 60) return `EMOM x ${rounds}`
  const m = Math.floor(interval / 60)
  const s = String(interval % 60).padStart(2, '0')
  return `Every ${m}:${s} Minutes x ${rounds}`
}

export function buildStrength(rng, focus) {
  const main = rng.pick(MOVEMENTS.filter((m) => m.roles.includes('main') && m.focus === focus))
  const t = rng.pick(STRENGTH_TEMPLATES)
  const lines = [{ movementId: main.id, base: Math.min(rng.pick(t.mainReps), main.repCap ?? 99) }]
  if (t.withAcc) {
    const acc = rng.pick(MOVEMENTS.filter((m) => m.roles.includes('acc') && m.pattern !== main.pattern))
    lines.push({ movementId: acc.id, base: acc.base })
  }
  return {
    id: 'A',
    kind: 'strength',
    title: main.title,
    window: '10:00 - 30:00',
    goal: null,
    energy: null,
    tags: [],
    heading: [intervalHeading(t.interval, t.rounds)],
    note: null,
    lines,
    timer: { mode: 'interval', interval: t.interval, rounds: t.rounds },
  }
}
