import { describe, it, expect } from 'vitest'
import { MOVEMENTS, FOCI, getMovement } from '../src/data/movements.js'
import { LEVELS } from '../src/lib/levels.js'
import { WORKOUT_NAMES } from '../src/data/names.js'

describe('movement library', () => {
  it('has six levels', () => expect(LEVELS).toHaveLength(6))
  it('ids are unique and lookup works', () => {
    const ids = MOVEMENTS.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(getMovement('burpee').id).toBe('burpee')
  })
  it.each(MOVEMENTS.map((m) => [m.id, m]))('%s is well formed', (_, m) => {
    expect(m.levels).toHaveLength(6)
    for (const v of m.levels) {
      expect(v.name.length).toBeGreaterThan(0)
      expect(v.scale).toBeGreaterThan(0)
    }
    expect(['reps', 'cal', 'm', 's']).toContain(m.unit)
    expect(m.base).toBeGreaterThan(0)
    expect(m.sec).toBeGreaterThan(0)
    expect(m.roles.length).toBeGreaterThan(0)
  })
  it('every focus has a main lift with a title', () => {
    for (const f of FOCI) {
      const mains = MOVEMENTS.filter((m) => m.roles.includes('main') && m.focus === f)
      expect(mains.length, f).toBeGreaterThan(0)
      mains.forEach((m) => expect(m.title).toBeTruthy())
    }
  })
  it('has accessories, conditioning movements and names', () => {
    expect(MOVEMENTS.filter((m) => m.roles.includes('acc')).length).toBeGreaterThanOrEqual(4)
    expect(MOVEMENTS.filter((m) => m.roles.includes('cond')).length).toBeGreaterThanOrEqual(12)
    expect(WORKOUT_NAMES.length).toBeGreaterThanOrEqual(30)
  })
})
