import { describe, it, expect } from 'vitest'
import { buildStrength, intervalHeading } from '../src/generator/strength.js'
import { createRng } from '../src/lib/rng.js'
import { getMovement, FOCI } from '../src/data/movements.js'

describe('strength block', () => {
  it('formats interval headings', () => {
    expect(intervalHeading(60, 10)).toBe('EMOM x 10')
    expect(intervalHeading(180, 5)).toBe('Every 3:00 Minutes x 5')
    expect(intervalHeading(150, 5)).toBe('Every 2:30 Minutes x 5')
  })
  it.each(FOCI)('builds a valid %s block', (focus) => {
    for (let i = 0; i < 50; i++) {
      const b = buildStrength(createRng(`${focus}${i}`), focus)
      const main = getMovement(b.lines[0].movementId)
      expect(main.focus).toBe(focus)
      expect(b.title).toBe(main.title)
      expect(b.timer.mode).toBe('interval')
      expect(b.lines[0].base).toBeLessThanOrEqual(main.repCap ?? 99)
      if (b.lines[1]) expect(getMovement(b.lines[1].movementId).pattern).not.toBe(main.pattern)
    }
  })
})
