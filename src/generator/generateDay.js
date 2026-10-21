import { createRng } from '../lib/rng.js'
import { dayNumber } from '../lib/dates.js'
import { LEVELS } from '../lib/levels.js'
import { FOCI, getMovement } from '../data/movements.js'
import { WORKOUT_NAMES } from '../data/names.js'
import { buildStrength } from './strength.js'
import { CONDITIONING_BUILDERS, takeMovements } from './conditioning.js'
import { renderLevel } from './render.js'

const withLevels = (block) => ({ ...block, levels: LEVELS.map((_, i) => renderLevel(block, i)) })

export function generateDay(iso) {
  const rng = createRng(`daily-grind:${iso}`)
  const focus = FOCI[((dayNumber(iso) % FOCI.length) + FOCI.length) % FOCI.length]

  const a = buildStrength(rng, focus)
  const mainPattern = getMovement(a.lines[0].movementId).pattern
  const used = new Set(a.lines.map((l) => l.movementId))
  const pick = (count, filter) => takeMovements(rng, count, mainPattern, used, filter)

  const cond = rng.pick(CONDITIONING_BUILDERS)(rng, pick)
  const tags = [...new Set(cond.lines.flatMap((l) => getMovement(l.movementId).tags))]
  const b = { id: 'B', kind: 'conditioning', title: rng.pick(WORKOUT_NAMES), window: '30:00 - 60:00', tags, ...cond }

  return { date: iso, focus, blocks: [withLevels(a), withLevels(b)] }
}
