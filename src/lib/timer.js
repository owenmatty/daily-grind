export function formatClock(sec) {
  const s = Math.max(0, Math.floor(sec))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

const round1 = (n) => Math.round(n * 10) / 10

// t = seconds since Start was pressed. The clock always counts up from 00:00;
// `remaining` is the time left in the current round/phase (or the whole piece for AMRAP/For Time).
export function timerState(config, t) {
  const done = (total, round = 0) => ({ phase: 'done', display: formatClock(total), round, remaining: null, done: true })

  if (config.mode === 'interval') {
    const total = config.interval * config.rounds
    if (t >= total) return done(total, config.rounds)
    const round = Math.floor(t / config.interval) + 1
    return { phase: 'work', display: formatClock(t), round, remaining: formatClock(Math.ceil(config.interval - (t % config.interval))), done: false }
  }
  if (config.mode === 'workrest') {
    const cycle = config.work + config.rest
    const total = cycle * config.rounds - config.rest
    if (t >= total) return done(total, config.rounds)
    const round = Math.floor(t / cycle) + 1
    const inCycle = t % cycle
    const working = inCycle < config.work
    const remaining = formatClock(Math.ceil((working ? config.work : cycle) - inCycle))
    return { phase: working ? 'work' : 'rest', display: formatClock(t), round, remaining, done: false }
  }
  const limit = config.mode === 'amrap' ? config.duration : config.cap
  if (limit && t >= limit) return done(limit)
  return { phase: 'work', display: formatClock(t), round: 0, remaining: limit ? formatClock(Math.ceil(limit - t)) : null, done: false }
}

// Laps are oldest first: { n, lap: seconds since the previous lap, total: seconds since start }.
export function addLap(laps, t) {
  const previous = laps.length ? laps[laps.length - 1].total : 0
  return [...laps, { n: laps.length + 1, lap: round1(t - previous), total: round1(t) }]
}
