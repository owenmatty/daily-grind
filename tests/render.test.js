import { describe, it, expect } from 'vitest'
import { amountText, renderLevel } from '../src/generator/render.js'
import { getMovement } from '../src/data/movements.js'

describe('amountText', () => {
  it('rounds reps with a minimum of 1', () => {
    expect(amountText(getMovement('burpee'), 10, 0.8)).toBe('8')
    expect(amountText(getMovement('burpee'), 1, 0.2)).toBe('1')
  })
  it('formats calories, metres and seconds', () => {
    expect(amountText(getMovement('row'), 12, 1)).toBe('12 Cal')
    expect(amountText(getMovement('run'), 400, 0.75)).toBe('300m')
    expect(amountText(getMovement('run'), 160, 1)).toBe('160m')
    expect(amountText(getMovement('hollow_hold'), 20, 1.5)).toBe('30s')
  })
  it('is empty when base is null (rep-scheme workouts)', () => {
    expect(amountText(getMovement('burpee'), null, 1)).toBe('')
  })
})

describe('renderLevel', () => {
  const block = { lines: [{ movementId: 'back_squat', base: 6 }, { movementId: 'wallball', base: null }] }
  it('changes only movement difficulty between levels', () => {
    const orange = renderLevel(block, 2)
    const brown = renderLevel(block, 5)
    expect(orange.lines.map((l) => l.text)).toEqual(['6 Back Squats @ 65%', 'Wallballs (6/3)'])
    expect(brown.lines.map((l) => l.text)).toEqual(['3 Back Squats @ 88%', 'Wallballs (12/9)'])
    expect(orange.lines.map((l) => l.movementId)).toEqual(brown.lines.map((l) => l.movementId))
  })
  it('exposes the bare movement name for demo searches', () => {
    expect(renderLevel(block, 2).lines[0].demo).toBe('Back Squats')
  })
  it('puts a line prefix before the amount', () => {
    const b = { lines: [{ movementId: 'run', base: 800, prefix: 'Buy-in: ' }, { movementId: 'burpee', base: null, prefix: 'AMRAP ' }] }
    expect(renderLevel(b, 3).lines.map((l) => l.text)).toEqual(['Buy-in: 800m Run', 'AMRAP Burpees over DB'])
  })
})
