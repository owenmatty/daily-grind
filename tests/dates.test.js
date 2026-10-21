import { describe, it, expect } from 'vitest'
import { toISODate, addDays, dayNumber } from '../src/lib/dates.js'

describe('dates', () => {
  it('formats local dates as YYYY-MM-DD', () => {
    expect(toISODate(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
  it('adds days across month/year boundaries', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
  })
  it('dayNumber increments by one per day', () => {
    expect(dayNumber('2026-10-22') - dayNumber('2026-10-21')).toBe(1)
    expect(dayNumber('2027-01-01') - dayNumber('2026-12-31')).toBe(1)
  })
})
