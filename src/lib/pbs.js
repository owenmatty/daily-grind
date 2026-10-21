// Reads a weight from a free-text score: "80", "80kg", "82.5 kg". Times and rounds aren't lift PBs.
export function parseWeight(score) {
  const m = /^\s*(\d+(?:\.\d+)?)\s*(kg)?\s*$/i.exec(score ?? '')
  return m ? Number(m[1]) : null
}

// Heaviest logged weight per lift name; the first time it was hit wins ties.
export function personalBests(entries) {
  const best = new Map()
  for (const e of [...entries].sort((a, b) => a.date.localeCompare(b.date))) {
    if (!e.lift) continue
    const kg = parseWeight(e.score)
    if (kg == null) continue
    const current = best.get(e.lift)
    if (!current || kg > current.kg) best.set(e.lift, { lift: e.lift, kg, date: e.date, level: e.level })
  }
  return [...best.values()].sort((a, b) => a.lift.localeCompare(b.lift))
}
