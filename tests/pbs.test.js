import { describe, it, expect } from 'vitest'
import { parseWeight, personalBests } from '../src/lib/pbs.js'

describe('parseWeight', () => {
  it('reads plain and kg weights', () => {
    expect(parseWeight('80')).toBe(80)
    expect(parseWeight('82.5kg')).toBe(82.5)
    expect(parseWeight(' 100 KG ')).toBe(100)
  })
  it('ignores times, rounds and text', () => {
    expect(parseWeight('14:32')).toBeNull()
    expect(parseWeight('6+12')).toBeNull()
    expect(parseWeight('felt good')).toBeNull()
    expect(parseWeight(undefined)).toBeNull()
  })
})

describe('personalBests', () => {
  const e = (lift, score, date, level = 3) => ({ lift, score, date, level })
  it('keeps the heaviest weight per lift, earliest date on ties', () => {
    const bests = personalBests([
      e('Back Squats', '80kg', '2026-10-01'),
      e('Back Squats', '90', '2026-10-08'),
      e('Back Squats', '90kg', '2026-10-15'),
      e('Deadlifts', '120kg', '2026-10-02'),
      e('Goblet Squats', '24', '2026-10-03', 1),
    ])
    expect(bests).toEqual([
      { lift: 'Back Squats', kg: 90, date: '2026-10-08', level: 3 },
      { lift: 'Deadlifts', kg: 120, date: '2026-10-02', level: 3 },
      { lift: 'Goblet Squats', kg: 24, date: '2026-10-03', level: 1 },
    ])
  })
  it('skips conditioning scores and non-weights', () => {
    expect(personalBests([e(null, '80', '2026-10-01'), e('Back Squats', '5 rounds', '2026-10-01')])).toEqual([])
  })
})
