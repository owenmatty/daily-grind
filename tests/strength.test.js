import { describe, it, expect } from 'vitest'
import { buildStrength, intervalHeading } from '../src/generator/strength.js'
import { createRng } from '../src/lib/rng.js'
import { getMovement, FOCI } from '../src/data/movements.js'

describe('strength block', () => {
  it('formats interval headings', () => {
    expect(intervalHeading(60, 10)).toBe('EMOM x 10')
    expect(intervalHeading(180, 5)).toBe('Every 3:00 Minutes x 5')
    expect(intervalHeading(150, 5)).toBe('Every 2:30 Minutes x 5')
    expect(intervalHeading(90, 5)).toBe('Every 1:30 Minutes x 5')
    expect(intervalHeading(60, 10, true)).toBe('ALT EMOM x 10')
  })
  it.each(FOCI)('builds a valid %s block', (focus) => {
    for (let i = 0; i < 50; i++) {
      const b = buildStrength(createRng(`${focus}${i}`), focus)
      const main = getMovement(b.lines[0].movementId)
      expect(main.focus).toBe(focus)
      expect(b.title).toBe(main.title)
      expect(b.timer.mode).toBe('interval')
      expect(b.lines[0].base).toBeLessThanOrEqual(main.repCap ?? 99)
      const accPatterns = b.lines.slice(1).map((l) => getMovement(l.movementId).pattern)
      expect(accPatterns).not.toContain(main.pattern)
      expect(new Set(accPatterns).size).toBe(accPatterns.length)
      expect(b.lines.length).toBeLessThanOrEqual(3)
      if (focus === 'olympic') {
        expect(b.timer).toMatchObject({ interval: 60, rounds: 10 })
      } else {
        expect(b.lines[0].base).toBeGreaterThanOrEqual(Math.min(5, main.repCap ?? 99))
      }
    }
  })
})
