import { MOVEMENTS } from '../data/movements.js'

const HEAVY = 'Heavy Breathing – Vp(v)'
const BURN = 'Muscular Burn – Pp(p)'

const roundSeconds = (moves) => moves.reduce((t, m) => t + m.base * m.sec, 0)
const schemeTotal = (scheme) => scheme.split('-').map(Number).reduce((a, b) => a + b, 0)
const withBase = (moves) => moves.map((m) => ({ movementId: m.id, base: m.base }))
const noBase = (moves) => moves.map((m) => ({ movementId: m.id, base: null }))

// Picks `count` conditioning movements, avoiding `excludePattern` and `usedIds`.
// Prefers one movement per pattern; only repeats a pattern if it has to.
export function takeMovements(rng, count, excludePattern, usedIds, filter = () => true) {
  const pool = rng.shuffle(
    MOVEMENTS.filter((m) => m.roles.includes('cond') && m.pattern !== excludePattern && !usedIds.has(m.id) && filter(m)),
  )
  const picked = []
  const patterns = new Set()
  for (const m of pool) {
    if (picked.length < count && !patterns.has(m.pattern)) {
      picked.push(m)
      patterns.add(m.pattern)
    }
  }
  for (const m of pool) {
    if (picked.length < count && !picked.includes(m)) picked.push(m)
  }
  if (picked.length < count) throw new Error(`Only ${picked.length} movements available, needed ${count}`)
  return picked
}

export const CONDITIONING_BUILDERS = [
  function amrap(rng, pick) {
    const minutes = rng.int(10, 20)
    const moves = pick(3)
    return {
      heading: ['AMRAP', `${minutes} minutes`],
      lines: withBase(moves),
      note: null,
      goal: `${Math.max(1, Math.floor((minutes * 60) / roundSeconds(moves)))}+ Rounds`,
      energy: HEAVY,
      timer: { mode: 'amrap', duration: minutes * 60 },
    }
  },
  function roundsForTime(rng, pick) {
    const rounds = rng.int(3, 5)
    const moves = pick(3)
    const est = rounds * roundSeconds(moves)
    const cap = Math.max(10, Math.ceil((est * 1.5) / 60))
    return {
      heading: [`For Time – ${cap} min CAP`, `${rounds} Rounds`],
      lines: withBase(moves),
      note: null,
      goal: `<${Math.ceil(est / 60)}:00`,
      energy: HEAVY,
      timer: { mode: 'fortime', cap: cap * 60 },
    }
  },
  function repScheme(rng, pick) {
    const scheme = rng.pick(['21-15-9', '30-20-10', '13-11-9-7-5', '10-8-6-4-2'])
    const moves = scheme === '30-20-10' ? pick(2, (m) => m.hiRep) : pick(rng.int(2, 3), (m) => m.schemes !== false)
    const est = schemeTotal(scheme) * moves.reduce((t, m) => t + m.sec, 0)
    const cap = Math.max(8, Math.ceil((est * 1.5) / 60))
    return {
      heading: [`For Time – ${cap} min CAP`, scheme],
      lines: noBase(moves),
      note: null,
      goal: `<${Math.ceil(est / 60)}:00`,
      energy: est <= 540 ? BURN : HEAVY,
      timer: { mode: 'fortime', cap: cap * 60 },
    }
  },
  function ladder(rng, pick) {
    const minutes = rng.int(10, 15)
    const step = rng.pick([2, 3, 5])
    const moves = pick(2, (m) => m.schemes !== false && m.unit === 'reps')
    const perRep = moves.reduce((t, m) => t + m.sec, 0)
    let rounds = 0
    let time = 0
    while (time + step * (rounds + 1) * perRep <= minutes * 60) {
      rounds += 1
      time += step * rounds * perRep
    }
    return {
      heading: ['AMRAP', `${minutes} minutes`, `${step}-${step * 2}-${step * 3}-${step * 4}…etc.`],
      lines: noBase(moves),
      note: null,
      goal: `${Math.max(1, rounds)}+ Rounds`,
      energy: HEAVY,
      timer: { mode: 'amrap', duration: minutes * 60 },
    }
  },
  function altEmom(rng, pick) {
    const count = rng.int(3, 4)
    const minutes = count * rng.int(4, 5)
    const moves = pick(count)
    return {
      heading: [`${minutes} min EMOM Alt.`],
      lines: moves.map((m) => ({ movementId: m.id, base: Math.round(40 / m.sec) })),
      note: 'Drop reps to maintain EMOM',
      goal: null,
      energy: HEAVY,
      timer: { mode: 'interval', interval: 60, rounds: minutes },
    }
  },
  function roundsWithRest(rng, pick) {
    const rounds = rng.int(4, 6)
    const rest = rng.pick([60, 90])
    const moves = pick(2)
    const est = rounds * (roundSeconds(moves) + rest)
    return {
      heading: [`${rounds} Rounds`],
      lines: withBase(moves),
      note: `Rest ${rest === 60 ? '1:00' : '1:30'} between rounds`,
      goal: null,
      energy: BURN,
      timer: { mode: 'fortime', cap: Math.ceil(est / 60 + 2) * 60 },
    }
  },
]
