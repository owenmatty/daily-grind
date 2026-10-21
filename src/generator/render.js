import { getMovement } from '../data/movements.js'

export function amountText(movement, base, scale) {
  if (base == null) return ''
  const raw = base * scale
  switch (movement.unit) {
    case 'm':
      return raw < 200 ? `${Math.max(10, Math.round(raw / 10) * 10)}m` : `${Math.round(raw / 100) * 100}m`
    case 's':
      return `${Math.max(10, Math.round(raw / 5) * 5)}s`
    case 'cal':
      return `${Math.max(1, Math.round(raw))} Cal`
    default:
      return `${Math.max(1, Math.round(raw))}`
  }
}

export function renderLevel(block, level) {
  return {
    lines: block.lines.map(({ movementId, base, prefix = '' }) => {
      const m = getMovement(movementId)
      const variant = m.levels[level]
      const name = variant.load ? `${variant.name} ${variant.load}` : variant.name
      const amount = amountText(m, base, variant.scale)
      return { movementId, name, demo: variant.name, text: prefix + (amount ? `${amount} ${name}` : name) }
    }),
  }
}
