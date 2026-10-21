import { describe, it, expect } from 'vitest'
import { CONDITIONING_BUILDERS, takeMovements } from '../src/generator/conditioning.js'
import { createRng } from '../src/lib/rng.js'
import { getMovement } from '../src/data/movements.js'

describe('takeMovements', () => {
  it('excludes a pattern and used ids, preferring distinct patterns', () => {
    for (let i = 0; i < 100; i++) {
      const picked = takeMovements(createRng(i), 3, 'squat', new Set(['burpee']))
      expect(picked).toHaveLength(3)
      picked.forEach((m) => {
        expect(m.pattern).not.toBe('squat')
        expect(m.id).not.toBe('burpee')
      })
      expect(new Set(picked.map((m) => m.pattern)).size).toBe(3)
    }
  })
})

describe('conditioning builders', () => {
  it.each(CONDITIONING_BUILDERS.map((b) => [b.name, b]))('%s produces a valid block', (_, build) => {
    for (let i = 0; i < 100; i++) {
      const rng = createRng(`${build.name}${i}`)
      const used = new Set()
      const pick = (count, filter) => {
        const picked = takeMovements(rng, count, 'press', used, filter)
        picked.forEach((m) => used.add(m.id))
        return picked
      }
      const b = build(rng, pick)
      expect(b.heading.length).toBeGreaterThan(0)
      expect(b.lines.length).toBeGreaterThanOrEqual(2)
      b.lines.forEach((l) => expect(getMovement(l.movementId).pattern).not.toBe('press'))
      expect(['interval', 'amrap', 'fortime', 'workrest']).toContain(b.timer.mode)
      const secs = b.timer.duration ?? b.timer.cap ?? (b.timer.interval ?? b.timer.work) * b.timer.rounds
      const ids = b.lines.map((l) => l.movementId)
      expect(new Set(ids).size).toBe(ids.length)
      expect(secs).toBeGreaterThan(0)
      expect(b.energy).toBeTruthy()
    }
  })
  it('includes the new album formats', () => {
    const names = CONDITIONING_BUILDERS.map((b) => b.name)
    for (const n of ['chipper', 'buyInRounds', 'workRest', 'tabata']) expect(names).toContain(n)
  })
})
