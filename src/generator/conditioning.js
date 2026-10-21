import { MOVEMENTS } from '../data/movements.js'

const HEAVY = 'Heavy Breathing – Vp(v)'
const BURN = 'Muscular Burn – Pp(p)'
const BREATHE_BURN = 'Breathe & Burn – Vp(p)'
const BRACE = 'Breathe & Brace – Vp(e)'

const SCHEMES = [
  '21-15-9', '30-20-10', '13-11-9-7-5', '10-8-6-4-2', '15-12-9-6-3', '20-15-10-5',
  '20-16-12-8-4', '24-16-8', '5-10-15-20-15-10-5', '21-18-15-9', '25-20-15-10-5', '3-6-9-12-15', '9-12-15-18-21',
]

const roundSeconds = (moves) => moves.reduce((t, m) => t + m.base * m.sec, 0)
const schemeTotal = (scheme) => scheme.split('-').map(Number).reduce((a, b) => a + b, 0)
const withBase = (moves) => moves.map((m) => ({ movementId: m.id, base: m.base }))
const noBase = (moves) => moves.map((m) => ({ movementId: m.id, base: null }))
const restLabel = (sec) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`
const isEngine = (m) => m.pattern === 'mono' && m.unit !== 'reps'

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
    const lines = withBase(moves)
    // Sometimes an interruption: "Every 4:00 starting at 0:00 → 12 KB Swings"
    if (rng.next() < 0.35) {
      const every = rng.pick([3, 4, 5])
      const [extra] = pick(1, (m) => m.unit === 'reps')
      lines.push({ movementId: extra.id, base: extra.base, prefix: `Every ${every}:00 from 0:00 → ` })
    }
    return {
      heading: ['AMRAP', `${minutes} minutes`],
      lines,
      note: null,
      goal: `${Math.max(1, Math.floor((minutes * 60) / roundSeconds(moves)))}+ Rounds`,
      energy: rng.pick([HEAVY, BREATHE_BURN]),
      timer: { mode: 'amrap', duration: minutes * 60 },
    }
  },
  function roundsForTime(rng, pick) {
    const rounds = rng.int(3, 6)
    const moves = pick(3)
    const est = rounds * roundSeconds(moves)
    const cap = Math.max(10, Math.ceil((est * 1.5) / 60))
    return {
      heading: [`For Time – ${cap} min CAP`, `${rounds} Rounds`],
      lines: withBase(moves),
      note: rng.next() < 0.3 ? 'Each break = 3 Burpees' : null,
      goal: `<${Math.ceil(est / 60)}:00`,
      energy: rng.pick([HEAVY, BREATHE_BURN]),
      timer: { mode: 'fortime', cap: cap * 60 },
    }
  },
  function repScheme(rng, pick) {
    const scheme = rng.pick(SCHEMES)
    const sets = scheme.split('-').length
    const hiRep = Number(scheme.split('-')[0]) >= 25
    const tail = rng.next() < 0.35
    const base = (m) => (hiRep ? m.hiRep : m.schemes !== false) && (!tail || m.pattern !== 'mono')
    const moves = pick(hiRep ? 2 : rng.int(2, 3), base)
    const lines = noBase(moves)
    let est = schemeTotal(scheme) * moves.reduce((t, m) => t + m.sec, 0)
    // Sometimes a fixed piece after every set: "After each round: 200m Run"
    if (tail) {
      const [engine] = pick(1, isEngine)
      const amount = Math.round(engine.base * 0.5)
      lines.push({ movementId: engine.id, base: amount, prefix: 'After each round: ' })
      est += sets * amount * engine.sec
    }
    const cap = Math.max(8, Math.ceil((est * 1.5) / 60))
    return {
      heading: [`For Time – ${cap} min CAP`, scheme],
      lines,
      note: null,
      goal: `<${Math.ceil(est / 60)}:00`,
      energy: est <= 540 ? BURN : BREATHE_BURN,
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
    const minutes = count * rng.int(4, 6)
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
    const rounds = rng.int(4, 8)
    const rest = rng.pick([60, 90, 120])
    const moves = pick(rng.int(2, 3))
    const est = rounds * (roundSeconds(moves) + rest)
    return {
      heading: [`${rounds} Rounds`],
      lines: withBase(moves),
      note: `Rest ${restLabel(rest)} between rounds`,
      goal: null,
      energy: BURN,
      timer: { mode: 'fortime', cap: Math.ceil(est / 60 + 2) * 60 },
    }
  },
  function chipper(rng, pick) {
    const moves = pick(rng.int(5, 6))
    const factors = [5, 4, 3.5, 3, 2, 1.5]
    const roundTo = (n) => (n >= 20 ? Math.round(n / 5) * 5 : Math.round(n))
    const lines = moves.map((m, i) => ({ movementId: m.id, base: roundTo(m.base * factors[i]) }))
    const est = lines.reduce((t, l, i) => t + l.base * moves[i].sec, 0)
    const cap = Math.max(15, Math.ceil((est * 1.4) / 60))
    return {
      heading: [`For Time – ${cap} min CAP`, 'Chipper'],
      lines,
      note: null,
      goal: `<${Math.ceil(est / 60)}:00`,
      energy: HEAVY,
      timer: { mode: 'fortime', cap: cap * 60 },
    }
  },
  function buyInRounds(rng, pick) {
    const buyOut = rng.next() < 0.5
    const engines = pick(buyOut ? 2 : 1, isEngine)
    const rounds = rng.int(3, 5)
    const moves = pick(3, (m) => m.pattern !== 'mono')
    const lines = [
      { movementId: engines[0].id, base: engines[0].base * 2, prefix: 'Buy-in: ' },
      ...withBase(moves),
      ...(buyOut ? [{ movementId: engines[1].id, base: engines[1].base * 2, prefix: 'Buy-out: ' }] : []),
    ]
    const est = engines.reduce((t, m) => t + m.base * 2 * m.sec, 0) + rounds * roundSeconds(moves)
    const cap = Math.max(15, Math.ceil((est * 1.4) / 60))
    return {
      heading: [`For Time – ${cap} min CAP`, `Buy-in → ${rounds} Rounds${buyOut ? ' → Buy-out' : ''}`],
      lines,
      note: null,
      goal: `<${Math.ceil(est / 60)}:00`,
      energy: BRACE,
      timer: { mode: 'fortime', cap: cap * 60 },
    }
  },
  function workRest(rng, pick) {
    const rounds = rng.int(3, 6)
    const work = rng.pick([120, 180])
    const rest = rng.pick([60, 120])
    const [engine] = pick(1, (m) => m.unit === 'cal')
    const moves = pick(rng.int(1, 2), (m) => m.pattern !== 'mono' && m.unit === 'reps')
    const amrapMove = moves[moves.length - 1]
    const fixed = withBase([engine, ...moves.slice(0, -1)])
    const used = engine.base * engine.sec + moves.slice(0, -1).reduce((t, m) => t + m.base * m.sec, 0)
    const reps = Math.max(1, Math.floor((work - used) / amrapMove.sec))
    return {
      heading: ['For Total Reps', `${work / 60} minutes`],
      lines: [...fixed, { movementId: amrapMove.id, base: null, prefix: 'AMRAP ' }],
      note: `Rest ${restLabel(rest)} · x ${rounds}`,
      goal: `${rounds * reps}+ Reps`,
      energy: BREATHE_BURN,
      timer: { mode: 'workrest', work, rest, rounds },
    }
  },
  function tabata(rng, pick) {
    const sets = 8
    const moves = pick(3, (m) => m.unit === 'reps' || m.unit === 'cal')
    return {
      heading: ['For Total Reps', '20s on / 10s off alt.', `x ${sets}`],
      lines: noBase(moves),
      note: null,
      goal: `${Math.round(sets * moves.reduce((t, m) => t + 20 / m.sec, 0) * 0.8)}+ Reps`,
      energy: BREATHE_BURN,
      timer: { mode: 'workrest', work: 20, rest: 10, rounds: sets * moves.length },
    }
  },
]
