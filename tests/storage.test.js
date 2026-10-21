import { describe, it, expect, beforeEach } from 'vitest'
import { loadLevel, saveLevel, loadScores, addScore, allScores, deleteScore, storageAvailable } from '../src/lib/storage.js'

function memoryStorage() {
  const data = new Map()
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
  }
}

describe('storage', () => {
  beforeEach(() => { globalThis.localStorage = memoryStorage() })

  it('defaults level to 2 and remembers it', () => {
    expect(loadLevel()).toBe(2)
    saveLevel(4)
    expect(loadLevel()).toBe(4)
  })
  it('ignores invalid stored levels', () => {
    globalThis.localStorage.setItem('dg.level', '9')
    expect(loadLevel()).toBe(2)
  })
  it('appends scores per date and block', () => {
    addScore('2026-10-21', 'B', { score: '6+3', level: 3, notes: '', at: 1 })
    addScore('2026-10-21', 'B', { score: '7', level: 3, notes: '', at: 2 })
    expect(loadScores('2026-10-21', 'B').map((s) => s.score)).toEqual(['6+3', '7'])
    expect(loadScores('2026-10-21', 'A')).toEqual([])
  })
  it('lists all scores newest first and deletes one', () => {
    addScore('2026-10-20', 'A', { score: '80kg', at: 1 })
    addScore('2026-10-21', 'B', { score: '6+3', at: 3 })
    addScore('2026-10-21', 'B', { score: '7', at: 2 })
    expect(allScores().map((s) => [s.date, s.blockId, s.score])).toEqual([
      ['2026-10-21', 'B', '6+3'],
      ['2026-10-21', 'B', '7'],
      ['2026-10-20', 'A', '80kg'],
    ])
    deleteScore('2026-10-21', 'B', 3)
    expect(allScores().map((s) => s.score)).toEqual(['7', '80kg'])
    deleteScore('2026-10-20', 'A', 1)
    expect(loadScores('2026-10-20', 'A')).toEqual([])
  })
  it('survives a broken localStorage', () => {
    globalThis.localStorage = { getItem() { throw new Error('no') }, setItem() { throw new Error('no') }, removeItem() {} }
    expect(storageAvailable()).toBe(false)
    expect(loadLevel()).toBe(2)
    expect(addScore('2026-10-21', 'A', { score: '1' })).toBe(false)
  })
})
