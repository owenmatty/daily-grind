export const LEAD_IN = 10

export function formatClock(sec) {
  const s = Math.max(0, Math.floor(sec))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

// elapsed = seconds since Start was pressed (includes the lead-in).
export function timerState(config, elapsed) {
  const t = elapsed - LEAD_IN
  if (t < 0) return { phase: 'ready', display: formatClock(Math.ceil(-t)), round: 0, done: false }

  if (config.mode === 'interval') {
    const total = config.interval * config.rounds
    if (t >= total) return { phase: 'done', display: '00:00', round: config.rounds, done: true }
    const round = Math.floor(t / config.interval) + 1
    return { phase: 'work', display: formatClock(Math.ceil(config.interval - (t % config.interval))), round, done: false }
  }
  if (config.mode === 'workrest') {
    const cycle = config.work + config.rest
    if (t >= cycle * config.rounds - config.rest) return { phase: 'done', display: '00:00', round: config.rounds, done: true }
    const round = Math.floor(t / cycle) + 1
    const inCycle = t % cycle
    if (inCycle < config.work) return { phase: 'work', display: formatClock(Math.ceil(config.work - inCycle)), round, done: false }
    return { phase: 'rest', display: formatClock(Math.ceil(cycle - inCycle)), round, done: false }
  }
  if (config.mode === 'amrap') {
    const remaining = config.duration - t
    if (remaining <= 0) return { phase: 'done', display: '00:00', round: 0, done: true }
    return { phase: 'work', display: formatClock(Math.ceil(remaining)), round: 0, done: false }
  }
  if (config.cap && t >= config.cap) return { phase: 'done', display: formatClock(config.cap), round: 0, done: true }
  return { phase: 'work', display: formatClock(t), round: 0, done: false }
}
