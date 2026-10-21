const pad = (n) => String(n).padStart(2, '0')

export function toISODate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function parseISODate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(iso, n) {
  const d = parseISODate(iso)
  d.setDate(d.getDate() + n)
  return toISODate(d)
}

export function dayNumber(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000)
}

export function formatLong(iso) {
  return parseISODate(iso).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

// When the calendar day changes, follow it only if the user was looking at "today".
export function rollover(viewed, previousToday, now) {
  return { today: now, date: viewed === previousToday ? now : viewed }
}
