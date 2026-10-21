import { describe, it, expect } from 'vitest'
import { timerState, formatClock, LEAD_IN } from '../src/lib/timer.js'

const at = (s) => s + LEAD_IN

describe('timer', () => {
  it('formats mm:ss', () => {
    expect(formatClock(0)).toBe('00:00')
    expect(formatClock(754)).toBe('12:34')
  })
  it('counts down the lead-in', () => {
    expect(timerState({ mode: 'amrap', duration: 600 }, 0)).toMatchObject({ phase: 'ready', display: '00:10' })
  })
  it('interval mode tracks rounds and finishes', () => {
    const c = { mode: 'interval', interval: 60, rounds: 10 }
    expect(timerState(c, at(0))).toMatchObject({ phase: 'work', round: 1, display: '01:00' })
    expect(timerState(c, at(61))).toMatchObject({ round: 2, display: '00:59' })
    expect(timerState(c, at(600))).toMatchObject({ phase: 'done', done: true })
  })
  it('amrap counts down', () => {
    const c = { mode: 'amrap', duration: 600 }
    expect(timerState(c, at(30)).display).toBe('09:30')
    expect(timerState(c, at(600)).done).toBe(true)
  })
  it('for time counts up to the cap', () => {
    const c = { mode: 'fortime', cap: 900 }
    expect(timerState(c, at(75)).display).toBe('01:15')
    expect(timerState(c, at(900))).toMatchObject({ done: true, display: '15:00' })
  })
  it('work/rest mode alternates and counts rounds', () => {
    const c = { mode: 'workrest', work: 20, rest: 10, rounds: 8 }
    expect(timerState(c, at(0))).toMatchObject({ phase: 'work', round: 1, display: '00:20' })
    expect(timerState(c, at(25))).toMatchObject({ phase: 'rest', round: 1, display: '00:05' })
    expect(timerState(c, at(31))).toMatchObject({ phase: 'work', round: 2, display: '00:19' })
    expect(timerState(c, at(230))).toMatchObject({ done: true })
  })
})
