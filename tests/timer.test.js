import { describe, it, expect } from 'vitest'
import { timerState, formatClock, addLap } from '../src/lib/timer.js'

describe('timer', () => {
  it('formats mm:ss', () => {
    expect(formatClock(0)).toBe('00:00')
    expect(formatClock(754)).toBe('12:34')
  })
  it('starts at 00:00 and counts up', () => {
    expect(timerState({ mode: 'amrap', duration: 600 }, 0)).toMatchObject({ phase: 'work', display: '00:00' })
    expect(timerState({ mode: 'fortime', cap: 900 }, 75).display).toBe('01:15')
  })
  it('interval mode counts up and tracks rounds and time left in the round', () => {
    const c = { mode: 'interval', interval: 60, rounds: 10 }
    expect(timerState(c, 0)).toMatchObject({ phase: 'work', round: 1, display: '00:00', remaining: '01:00' })
    expect(timerState(c, 61)).toMatchObject({ round: 2, display: '01:01', remaining: '00:59' })
    expect(timerState(c, 600)).toMatchObject({ phase: 'done', done: true, display: '10:00' })
  })
  it('work/rest mode alternates and counts rounds', () => {
    const c = { mode: 'workrest', work: 20, rest: 10, rounds: 8 }
    expect(timerState(c, 0)).toMatchObject({ phase: 'work', round: 1, display: '00:00', remaining: '00:20' })
    expect(timerState(c, 25)).toMatchObject({ phase: 'rest', round: 1, remaining: '00:05' })
    expect(timerState(c, 31)).toMatchObject({ phase: 'work', round: 2, remaining: '00:19' })
    expect(timerState(c, 230)).toMatchObject({ done: true })
  })
  it('amrap shows time left and stops at the duration', () => {
    const c = { mode: 'amrap', duration: 600 }
    expect(timerState(c, 30)).toMatchObject({ display: '00:30', remaining: '09:30' })
    expect(timerState(c, 600)).toMatchObject({ done: true, display: '10:00' })
  })
  it('for time stops at the cap', () => {
    expect(timerState({ mode: 'fortime', cap: 900 }, 900)).toMatchObject({ done: true, display: '15:00' })
  })
})

describe('laps', () => {
  it('records lap time since the previous lap and the running total', () => {
    let laps = addLap([], 65)
    laps = addLap(laps, 130.4)
    expect(laps).toEqual([
      { n: 1, lap: 65, total: 65 },
      { n: 2, lap: 65.4, total: 130.4 },
    ])
  })
})
