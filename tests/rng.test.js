import { describe, it, expect } from 'vitest'
import { createRng, hashString } from '../src/lib/rng.js'

describe('rng', () => {
  it('hashes strings deterministically', () => {
    expect(hashString('abc')).toBe(hashString('abc'))
    expect(hashString('abc')).not.toBe(hashString('abd'))
  })
  it('same seed gives same sequence', () => {
    const a = createRng('2026-10-21'), b = createRng('2026-10-21')
    for (let i = 0; i < 20; i++) expect(a.next()).toBe(b.next())
  })
  it('different seeds give different sequences', () => {
    expect(createRng('x').next()).not.toBe(createRng('y').next())
  })
  it('int stays in inclusive bounds', () => {
    const r = createRng('bounds')
    for (let i = 0; i < 500; i++) {
      const n = r.int(3, 5)
      expect(n).toBeGreaterThanOrEqual(3)
      expect(n).toBeLessThanOrEqual(5)
    }
  })
  it('shuffle keeps all items and does not mutate', () => {
    const src = [1, 2, 3, 4, 5]
    const out = createRng('s').shuffle(src)
    expect([...out].sort()).toEqual(src)
    expect(src).toEqual([1, 2, 3, 4, 5])
  })
})
