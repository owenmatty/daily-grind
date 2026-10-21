import { describe, it, expect } from 'vitest'
import { generateDay } from '../src/generator/generateDay.js'
import { addDays } from '../src/lib/dates.js'
import { getMovement } from '../src/data/movements.js'

const DAYS = Array.from({ length: 730 }, (_, i) => addDays('2026-01-01', i))

describe('generateDay', () => {
  it('is deterministic for a date', () => {
    expect(generateDay('2026-10-21')).toEqual(generateDay('2026-10-21'))
  })
  it('differs between days', () => {
    expect(JSON.stringify(generateDay('2026-10-21'))).not.toBe(JSON.stringify(generateDay('2026-10-22')))
  })
  it('produces a valid day for two years of dates', () => {
    for (const iso of DAYS) {
      const day = generateDay(iso)
      expect(day.blocks.map((b) => b.id)).toEqual(['A', 'B'])
      const ids = day.blocks.flatMap((b) => b.lines.map((l) => l.movementId))
      expect(new Set(ids).size, iso).toBe(ids.length)
      const mainPattern = getMovement(day.blocks[0].lines[0].movementId).pattern
      day.blocks[1].lines.forEach((l) => expect(getMovement(l.movementId).pattern, iso).not.toBe(mainPattern))
      for (const b of day.blocks) {
        expect(b.levels).toHaveLength(6)
        b.levels.forEach((lvl) => expect(lvl.lines.map((l) => l.movementId)).toEqual(b.lines.map((l) => l.movementId)))
      }
      expect(day.blocks[1].title).toBeTruthy()
      expect(day.blocks[1].tags.length).toBeGreaterThan(0)
    }
  })
  it('never repeats the strength focus on consecutive days', () => {
    for (let i = 1; i < DAYS.length; i++) {
      expect(generateDay(DAYS[i]).focus).not.toBe(generateDay(DAYS[i - 1]).focus)
    }
  })
})
