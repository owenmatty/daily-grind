# Daily Grind Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A Vue static site on GitHub Pages that shows a randomised, date-seeded two-block workout every day, viewable at six difficulty levels, with timer, score log, day navigation and demo links.

**Architecture:** Pure JS core (seeded RNG, movement library, generator, renderer, timer maths, storage) fully unit-tested with Vitest; thin Vue 3 SFC layer on top. Vite builds static files; a GitHub Actions workflow tests, builds and deploys to Pages.

**Tech Stack:** Vue 3, Vite 6, @vitejs/plugin-vue 5, Vitest 3, GitHub Actions, GitHub Pages.

Spec: `docs/superpowers/specs/2026-10-21-daily-grind-design.md`

---

## File structure

```
package.json, vite.config.js, index.html, .gitignore
.github/workflows/deploy.yml        test + build + deploy to Pages
src/main.js                         mount app
src/style.css                       global dark theme
src/App.vue                         date state, day generation, level preference
src/lib/rng.js                      hashString, createRng (seeded PRNG helpers)
src/lib/dates.js                    ISO date helpers, dayNumber, formatLong
src/lib/levels.js                   LEVELS (6 colours)
src/lib/storage.js                  safe localStorage: level pref + scores
src/lib/timer.js                    pure timerState(config, elapsed), formatClock
src/lib/beep.js                     Web Audio beep (fails silently)
src/data/movements.js               MOVEMENTS, FOCI, getMovement
src/data/names.js                   WORKOUT_NAMES
src/generator/render.js             amountText, renderLevel
src/generator/conditioning.js       CONDITIONING_BUILDERS, takeMovements
src/generator/strength.js           STRENGTH_TEMPLATES, buildStrength
src/generator/generateDay.js        generateDay(iso)
src/components/LevelPicker.vue      6 circles
src/components/DayNav.vue           prev / date / next / today
src/components/BlockCard.vue        one workout block + footer actions
src/components/Modal.vue            shared modal shell
src/components/TimerModal.vue       timer UI
src/components/ScoreModal.vue       log + history
src/components/DemoModal.vue        YouTube links
tests/*.test.js                     Vitest unit tests
docs/album-notes.md                 transcription of the photo album (Task 12)
```

---

### Task 1: Scaffold project

**Files:** Create `package.json`, `vite.config.js`, `index.html`, `.gitignore`, `src/main.js`, `src/App.vue` (placeholder), `src/style.css` (empty)

- [ ] **Step 1: Write package.json**

```json
{
  "name": "daily-grind",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  }
}
```

- [ ] **Step 2: Install deps**

Run: `npm install vue@3 && npm install -D vite@6 @vitejs/plugin-vue@5 vitest@3`
Expected: installs without errors.

- [ ] **Step 3: vite.config.js**

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/daily-grind/',
  plugins: [vue()],
  test: { environment: 'node' },
})
```

- [ ] **Step 4: index.html, main.js, placeholder App.vue, .gitignore**

`index.html`:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#121418" />
    <title>Daily Grind</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

`src/main.js`:
```js
import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

createApp(App).mount('#app')
```

`src/App.vue`:
```vue
<template><h1>Daily Grind</h1></template>
```

`.gitignore`:
```
node_modules
dist
```

- [ ] **Step 5: Verify build** — Run `npm run build`. Expected: `dist/` created, no errors.

- [ ] **Step 6: Commit** — `git add -A && git commit -m "chore: scaffold Vue + Vite project"`

---

### Task 2: Seeded RNG and date helpers

**Files:** Create `src/lib/rng.js`, `src/lib/dates.js`, `tests/rng.test.js`, `tests/dates.test.js`

- [ ] **Step 1: Failing tests**

`tests/rng.test.js`:
```js
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
```

`tests/dates.test.js`:
```js
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
```

- [ ] **Step 2: Run** `npm test` — Expected: FAIL (modules not found).

- [ ] **Step 3: Implement**

`src/lib/rng.js`:
```js
export function hashString(str) {
  let h = 1779033703 ^ str.length
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return h >>> 0
}

// mulberry32
export function createRng(seed) {
  let a = typeof seed === 'string' ? hashString(seed) : seed >>> 0
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    shuffle(arr) {
      const out = [...arr]
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1))
        ;[out[i], out[j]] = [out[j], out[i]]
      }
      return out
    },
  }
}
```

`src/lib/dates.js`:
```js
const pad = (n) => String(n).padStart(2, '0')

export function toISODate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function parseISODate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(iso, n) {
  const d = parseISODate(iso)
  d.setDate(d.getDate() + n)
  return toISODate(d)
}

export function dayNumber(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000)
}

export function formatLong(iso) {
  return parseISODate(iso).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}
```

- [ ] **Step 4: Run** `npm test` — Expected: PASS.
- [ ] **Step 5: Commit** — `git commit -am "feat: seeded rng and date helpers"` (add new files first with `git add -A`).

---

### Task 3: Levels and movement library

**Files:** Create `src/lib/levels.js`, `src/data/movements.js`, `src/data/names.js`, `tests/movements.test.js`

Movement shape: `{ id, roles: ('main'|'acc'|'cond')[], focus?, title?, repCap?, pattern, tags, unit: 'reps'|'cal'|'m'|'s', base, sec, hiRep?, schemes?, levels: [6 × { name, scale, load }] }`.
`base` = reps/amount at scale 1. `sec` = rough seconds per unit (for goal/cap estimates). `schemes: false` excludes from rep-scheme workouts (21-15-9 etc.); `hiRep` allows 30-20-10.

- [ ] **Step 1: Failing test** `tests/movements.test.js`:

```js
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
```

- [ ] **Step 2: Run** `npm test` — Expected: FAIL.

- [ ] **Step 3: Implement**

`src/lib/levels.js`:
```js
export const LEVELS = [
  { id: 'white', label: 'White', color: '#ffffff' },
  { id: 'yellow', label: 'Yellow', color: '#ffeb3b' },
  { id: 'orange', label: 'Orange', color: '#ff9800' },
  { id: 'blue', label: 'Blue', color: '#2196f3' },
  { id: 'purple', label: 'Purple', color: '#9c27b0' },
  { id: 'brown', label: 'Brown', color: '#795548' },
]
```

`src/data/names.js`:
```js
export const WORKOUT_NAMES = [
  'The Undercard', 'Tissue Box', 'Grind House', 'Iron Lung', 'Sweat Equity', 'Main Event',
  'Engine Room', 'Heavy Metal', 'Paper Cut', 'Double Trouble', 'Ground Control', 'Slow Burn',
  'Night Shift', 'Full Send', 'Second Wind', 'Redline', 'Chalk Dust', 'Lights Out',
  'Rough Draft', 'Hot Lap', 'Last Orders', 'Black Coffee', 'Stormfront', 'No Shortcuts',
  'Pressure Cooker', 'Wrecking Ball', 'Steel Toes', 'Overtime', 'Box Office', 'Static Shock',
  'The Gauntlet', 'Hold the Line', 'Burnout', 'Top Shelf', 'Grit & Grin', 'Final Round',
]
```

`src/data/movements.js`:
```js
const v = (name, scale = 1, load = '') => ({ name, scale, load })

// Block A focus rotates one step per day, so consecutive days never share a focus.
export const FOCI = ['squat', 'press', 'olympic', 'pull', 'hinge', 'gymnastics']

export const MOVEMENTS = [
  // ---- Block A main lifts ----
  { id: 'back_squat', roles: ['main'], focus: 'squat', title: 'Squat', pattern: 'squat', tags: ['Lower Body'], unit: 'reps', base: 6, sec: 3,
    levels: [v('Box Squats', 1.25), v('Goblet Squats', 1.25, '(16/12)'), v('Back Squats', 1, '@ 65%'), v('Back Squats', 0.75, '@ 75%'), v('Back Squats', 0.6, '@ 82%'), v('Back Squats', 0.5, '@ 88%')] },
  { id: 'front_squat', roles: ['main'], focus: 'squat', title: 'Front Squat', pattern: 'squat', tags: ['Lower Body'], unit: 'reps', base: 6, sec: 3,
    levels: [v('Air Squats', 1.5), v('DB Front Squats', 1.25, '(2x12.5/10)'), v('Front Squats', 1, '@ 65%'), v('Front Squats', 0.75, '@ 75%'), v('Front Squats', 0.6, '@ 80%'), v('Front Squats', 0.5, '@ 85%')] },
  { id: 'strict_press', roles: ['main'], focus: 'press', title: 'Press', pattern: 'press', tags: ['Upper Body Push'], unit: 'reps', base: 6, sec: 3,
    levels: [v('DB Strict Press', 1.25, '(2x7.5/5)'), v('DB Strict Press', 1, '(2x12.5/10)'), v('Strict Press', 1, '@ 65%'), v('Strict Press', 0.75, '@ 75%'), v('Strict Press', 0.6, '@ 82%'), v('Strict Press', 0.5, '@ 88%')] },
  { id: 'push_press', roles: ['main'], focus: 'press', title: 'Push Press', pattern: 'press', tags: ['Upper Body Push'], unit: 'reps', base: 6, sec: 3,
    levels: [v('DB Push Press', 1.25, '(2x10/7.5)'), v('DB Push Press', 1, '(2x15/10)'), v('Push Press', 1, '@ 65%'), v('Push Press', 0.75, '@ 75%'), v('Push Press', 0.6, '@ 82%'), v('Push Press', 0.5, '@ 88%')] },
  { id: 'pike_hspu', roles: ['main'], focus: 'press', title: 'Handstand', repCap: 8, pattern: 'press', tags: ['Upper Body Push', 'Gymnastics'], unit: 'reps', base: 6, sec: 4,
    levels: [v('Pike Push-ups'), v('Box Pike Push-ups'), v('Piked HSPU'), v('Kipping HSPU'), v('Strict HSPU'), v('Deficit Strict HSPU', 0.75, '(5cm)')] },
  { id: 'power_clean', roles: ['main'], focus: 'olympic', title: 'Power Cleans', repCap: 3, pattern: 'olympic', tags: ['Weightlifting'], unit: 'reps', base: 3, sec: 5,
    levels: [v('PVC Hang Cleans', 2), v('DB Hang Power Cleans', 1.5, '(2x10/7.5)'), v('Hang Power Cleans', 1, '@ 60%'), v('Power Cleans', 1, '@ 70%'), v('Power Cleans', 0.67, '@ 78%'), v('Squat Cleans', 0.67, '@ 82%')] },
  { id: 'power_snatch', roles: ['main'], focus: 'olympic', title: 'Snatch', repCap: 3, pattern: 'olympic', tags: ['Weightlifting'], unit: 'reps', base: 3, sec: 5,
    levels: [v('PVC Overhead Squats', 2), v('DB Snatches', 1.5, '(15/10)'), v('Hang Power Snatches', 1, '@ 60%'), v('Power Snatches', 1, '@ 70%'), v('Power Snatches', 0.67, '@ 78%'), v('Squat Snatches', 0.67, '@ 80%')] },
  { id: 'strict_pullup', roles: ['main'], focus: 'pull', title: 'Rings', repCap: 6, pattern: 'pull', tags: ['Upper Body Pull', 'Gymnastics'], unit: 'reps', base: 5, sec: 4,
    levels: [v('Ring Rows', 1.5), v('Banded Pull-ups'), v('Jumping Pull-ups', 1, '(slow lower)'), v('Strict Pull-ups'), v('Weighted Pull-ups', 1, '(+5kg)'), v('Weighted Pull-ups', 1, '(+10kg)')] },
  { id: 'bent_row', roles: ['main'], focus: 'pull', title: 'Row', pattern: 'pull', tags: ['Upper Body Pull'], unit: 'reps', base: 8, sec: 3,
    levels: [v('DB Rows e/s', 1.25, '(15/10)'), v('DB Rows e/s', 1, '(22.5/15)'), v('Bent-over Rows', 1, '@ 60%'), v('Bent-over Rows', 0.75, '@ 70%'), v('Pendlay Rows', 0.6, '@ 75%'), v('Pendlay Rows', 0.5, '@ 80%')] },
  { id: 'deadlift', roles: ['main'], focus: 'hinge', title: 'Deadlift', pattern: 'hinge', tags: ['Posterior Chain'], unit: 'reps', base: 6, sec: 3,
    levels: [v('KB Deadlifts', 1.25, '(24/16)'), v('Trap Bar Deadlifts', 1, '@ 60%'), v('Deadlifts', 1, '@ 65%'), v('Deadlifts', 0.75, '@ 75%'), v('Deadlifts', 0.6, '@ 82%'), v('Deadlifts', 0.5, '@ 88%')] },
  { id: 'rdl', roles: ['main'], focus: 'hinge', title: 'Hinge', pattern: 'hinge', tags: ['Posterior Chain'], unit: 'reps', base: 8, sec: 3,
    levels: [v('KB RDLs', 1.25, '(16/12)'), v('DB RDLs', 1, '(2x15/10)'), v('Romanian Deadlifts', 1, '@ 50%'), v('Romanian Deadlifts', 0.85, '@ 60%'), v('Romanian Deadlifts', 0.75, '@ 65%'), v('Romanian Deadlifts', 0.65, '@ 70%')] },
  { id: 'muscle_up', roles: ['main'], focus: 'gymnastics', title: 'Gymnastics', repCap: 5, pattern: 'pull', tags: ['Gymnastics', 'Upper Body Pull'], unit: 'reps', base: 4, sec: 5,
    levels: [v('Hollow-to-Arch Swings', 2), v('Jumping Chest-to-Bar'), v('Chest-to-Bar Pull-ups'), v('Banded Bar Muscle-ups'), v('Bar Muscle-ups'), v('Ring Muscle-ups')] },

  // ---- Block A accessories ----
  { id: 'wtd_deadbug', roles: ['acc'], pattern: 'core', tags: ['Neurological and Core'], unit: 'reps', base: 12, sec: 2,
    levels: [v('Deadbugs'), v('Deadbugs', 1.25), v('WTD Deadbugs', 1, '(2.5kg)'), v('WTD Deadbugs', 1, '(5kg)'), v('WTD Deadbugs', 1.25, '(5kg)'), v('WTD Deadbugs', 1, '(10kg)')] },
  { id: 'glute_bridge', roles: ['acc'], pattern: 'hinge', tags: ['Posterior Chain'], unit: 'reps', base: 10, sec: 2,
    levels: [v('Glute Bridges', 1.5), v('SL Glute Bridges e/s'), v('SL Elevated Glute Bridges e/s'), v('SL Elevated Glute Bridges e/s', 1.25), v('Hip Thrusts', 1, '(40/30)'), v('Hip Thrusts', 1, '(60/40)')] },
  { id: 'ring_dip', roles: ['acc'], pattern: 'press', tags: ['Upper Body Push'], unit: 'reps', base: 4, sec: 3,
    levels: [v('Box Dips', 2), v('Banded Ring Dips'), v('Bar Dips'), v('Strict Ring Dips'), v('Strict Ring Dips', 1.5), v('Weighted Ring Dips', 1, '(+5kg)')] },
  { id: 'hollow_hold', roles: ['acc'], pattern: 'core', tags: ['Neurological and Core'], unit: 's', base: 20, sec: 1,
    levels: [v('Tuck Hold'), v('Hollow Hold'), v('Hollow Hold', 1.5), v('Hollow Hold', 2), v('Weighted Hollow Hold', 1.5, '(5kg)'), v('Weighted Hollow Hold', 2, '(5kg)')] },
  { id: 'copenhagen', roles: ['acc'], pattern: 'core', tags: ['Neurological and Core'], unit: 's', base: 20, sec: 1,
    levels: [v('Side Plank e/s'), v('Side Plank e/s', 1.5), v('Short Copenhagen Plank e/s'), v('Copenhagen Plank e/s'), v('Copenhagen Plank e/s', 1.5), v('Copenhagen Plank e/s', 2)] },
  { id: 'db_row', roles: ['acc'], pattern: 'pull', tags: ['Upper Body Pull'], unit: 'reps', base: 10, sec: 2,
    levels: [v('Ring Rows'), v('DB Rows e/s', 1, '(10/7.5)'), v('DB Rows e/s', 1, '(17.5/12.5)'), v('DB Rows e/s', 1, '(22.5/15)'), v('DB Rows e/s', 1, '(27.5/20)'), v('DB Rows e/s', 1, '(32.5/22.5)')] },
  { id: 'farmer_carry', roles: ['acc', 'cond'], schemes: false, pattern: 'carry', tags: ['Grip'], unit: 'm', base: 30, sec: 0.6,
    levels: [v('Farmer Carry', 1, '(2x12/8)'), v('Farmer Carry', 1, '(2x16/12)'), v('Farmer Carry', 1, '(2x24/16)'), v('Farmer Carry', 1, '(2x32/24)'), v('Farmer Carry', 1.5, '(2x32/24)'), v('Farmer Carry', 1.5, '(2x40/28)')] },

  // ---- Block B conditioning ----
  { id: 'burpee', roles: ['cond'], pattern: 'bodyweight', tags: ['Bodyweight'], unit: 'reps', base: 10, sec: 4,
    levels: [v('Step-back Burpees', 0.8), v('Burpees', 0.8), v('Burpees'), v('Burpees over DB'), v('Bar-facing Burpees', 1.2), v('Burpee Box Jump Overs', 1, '(24/20")')] },
  { id: 'wallball', roles: ['cond'], hiRep: true, pattern: 'squat', tags: ['Lower Body'], unit: 'reps', base: 15, sec: 2.5,
    levels: [v('Wallballs', 1, '(3/2)'), v('Wallballs', 1, '(4/3)'), v('Wallballs', 1, '(6/4)'), v('Wallballs', 1, '(9/6)'), v('Wallballs', 1.2, '(9/6)'), v('Wallballs', 1.2, '(12/9)')] },
  { id: 'thruster', roles: ['cond'], pattern: 'squat', tags: ['Lower Body', 'Upper Body Push'], unit: 'reps', base: 10, sec: 3,
    levels: [v('PVC Thrusters'), v('DB Thrusters', 1, '(2x7.5/5)'), v('DB Thrusters', 1, '(2x12.5/10)'), v('Thrusters', 1, '(40/30)'), v('Thrusters', 1, '(43/30)'), v('Thrusters', 1, '(50/35)')] },
  { id: 'box_step_over', roles: ['cond'], pattern: 'squat', tags: ['Lower Body'], unit: 'reps', base: 12, sec: 3,
    levels: [v('Box Step Ups', 1, '(16")'), v('Box Step Overs', 1, '(20")'), v('Box Step Overs', 1, '(24/20")'), v('DB Box Step Overs', 1, '(15/10)'), v('Box Jump Overs', 1, '(24/20")'), v('Box Jump Overs', 1.25, '(24/20")')] },
  { id: 'kb_swing', roles: ['cond'], hiRep: true, pattern: 'hinge', tags: ['Kettlebell'], unit: 'reps', base: 15, sec: 2,
    levels: [v('Russian KB Swings', 1, '(8/6)'), v('Russian KB Swings', 1, '(12/8)'), v('Russian KB Swings', 1, '(16/12)'), v('American KB Swings', 1, '(24/16)'), v('American KB Swings', 1, '(28/20)'), v('American KB Swings', 1, '(32/24)')] },
  { id: 'sa_kb_swing', roles: ['cond'], pattern: 'hinge', tags: ['Kettlebell'], unit: 'reps', base: 10, sec: 2,
    levels: [v('Alternating SA KB Swings', 1, '(8/6)'), v('Alternating SA KB Swings', 1, '(12/8)'), v('Alternating SA KB Swings', 1, '(16/12)'), v('Alternating SA KB Swings', 1, '(20/14)'), v('Alternating SA KB Swings', 1, '(24/16)'), v('Alternating SA KB Swings', 1, '(28/20)')] },
  { id: 'db_snatch', roles: ['cond'], pattern: 'olympic', tags: ['Weightlifting'], unit: 'reps', base: 10, sec: 3,
    levels: [v('Alternating DB Snatches', 1, '(5/2.5)'), v('Alternating DB Snatches', 1, '(10/7.5)'), v('Alternating DB Snatches', 1, '(15/10)'), v('Alternating DB Snatches', 1, '(22.5/15)'), v('Alternating DB Snatches', 1, '(25/17.5)'), v('Alternating DB Snatches', 1, '(27.5/20)')] },
  { id: 'hang_power_clean', roles: ['cond'], pattern: 'olympic', tags: ['Weightlifting'], unit: 'reps', base: 8, sec: 3.5,
    levels: [v('PVC Hang Cleans'), v('DB Hang Cleans', 1, '(2x10/7.5)'), v('Hang Power Cleans', 1, '(30/20)'), v('Hang Power Cleans', 1, '(40/30)'), v('Hang Power Cleans', 1, '(50/35)'), v('Hang Squat Cleans', 1, '(60/40)')] },
  { id: 'medball_clean', roles: ['cond'], pattern: 'olympic', tags: ['Weightlifting'], unit: 'reps', base: 10, sec: 2.5,
    levels: [v('Medball Cleans', 1, '(4/3)'), v('Medball Cleans', 1, '(6/4)'), v('Medball Cleans', 1, '(9/6)'), v('Medball Cleans', 1.2, '(9/6)'), v('Medball Cleans', 1, '(12/9)'), v('Medball Cleans', 1.2, '(12/9)')] },
  { id: 'pushup', roles: ['cond'], pattern: 'press', tags: ['Upper Body Push'], unit: 'reps', base: 10, sec: 2.5,
    levels: [v('Box Push-ups', 1, '(24")'), v('Box Push-ups', 1, '(16")'), v('Push-ups'), v('Hand-release Push-ups'), v('Deficit Push-ups'), v('Ring Push-ups')] },
  { id: 'wall_walk', roles: ['cond'], schemes: false, pattern: 'press', tags: ['Upper Body Push', 'Gymnastics'], unit: 'reps', base: 2, sec: 15,
    levels: [v('Plank Shoulder Taps', 5), v('Inchworms', 2), v('Half Wall Walks'), v('Wall Walks'), v('Wall Walks', 1.5), v('Wall Walks', 2)] },
  { id: 'pullup', roles: ['cond'], pattern: 'pull', tags: ['Upper Body Pull'], unit: 'reps', base: 8, sec: 3,
    levels: [v('Ring Rows', 1.5), v('Banded Pull-ups'), v('Jumping Pull-ups'), v('Kipping Pull-ups'), v('Chest-to-Bar Pull-ups'), v('Bar Muscle-ups', 0.5)] },
  { id: 'ring_row', roles: ['cond'], pattern: 'pull', tags: ['Upper Body Pull'], unit: 'reps', base: 10, sec: 2.5,
    levels: [v('Ring Rows', 1, '(upright)'), v('Ring Rows'), v('Ring Rows', 1, '(feet elevated)'), v('Strict Pull-ups', 0.6), v('Strict Chin-ups', 0.8), v('Strict Chest-to-Bar', 0.6)] },
  { id: 'toes_to_bar', roles: ['cond'], pattern: 'core', tags: ['Neurological and Core'], unit: 'reps', base: 10, sec: 3,
    levels: [v('Lying Leg Raises'), v('Hanging Knee Raises'), v('Hanging Leg Raises'), v('Toes-to-Bar'), v('Toes-to-Bar', 1.25), v('Strict Toes-to-Bar')] },
  { id: 'sit_up', roles: ['cond'], hiRep: true, pattern: 'core', tags: ['Neurological and Core'], unit: 'reps', base: 15, sec: 2,
    levels: [v('Crunches'), v('Sit-ups'), v('AbMat Sit-ups'), v('AbMat Sit-ups', 1.25), v('GHD Sit-ups', 0.75), v('GHD Sit-ups')] },
  { id: 'jump_rope', roles: ['cond'], schemes: false, pattern: 'mono', tags: ['Monostructural'], unit: 'reps', base: 40, sec: 0.5,
    levels: [v('Jumping Jacks'), v('Single-unders'), v('Single-unders', 1.5), v('Double-unders', 0.5), v('Double-unders', 0.75), v('Double-unders')] },
  { id: 'run', roles: ['cond'], schemes: false, pattern: 'mono', tags: ['Monostructural'], unit: 'm', base: 400, sec: 0.25,
    levels: [v('Walk/Jog', 0.5), v('Run', 0.5), v('Run', 0.75), v('Run'), v('Run'), v('Run', 1.25)] },
  { id: 'row', roles: ['cond'], hiRep: true, pattern: 'mono', tags: ['Monostructural'], unit: 'cal', base: 12, sec: 4.5,
    levels: [v('Row', 0.6), v('Row', 0.8), v('Row'), v('Row'), v('Row', 1.2), v('Row', 1.4)] },
  { id: 'bike', roles: ['cond'], hiRep: true, pattern: 'mono', tags: ['Monostructural'], unit: 'cal', base: 10, sec: 5,
    levels: [v('Bike', 0.6), v('Bike', 0.8), v('Bike'), v('Bike'), v('Bike', 1.2), v('Bike', 1.4)] },
  { id: 'ski', roles: ['cond'], hiRep: true, pattern: 'mono', tags: ['Monostructural'], unit: 'cal', base: 12, sec: 5,
    levels: [v('Ski Erg', 0.6), v('Ski Erg', 0.8), v('Ski Erg'), v('Ski Erg'), v('Ski Erg', 1.2), v('Ski Erg', 1.4)] },
]

const BY_ID = new Map(MOVEMENTS.map((m) => [m.id, m]))

export function getMovement(id) {
  const m = BY_ID.get(id)
  if (!m) throw new Error(`Unknown movement: ${id}`)
  return m
}
```

- [ ] **Step 4: Run** `npm test` — Expected: PASS.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: movement library with six difficulty levels"`

---

### Task 4: Renderer (block → text at a level)

**Files:** Create `src/generator/render.js`, `tests/render.test.js`

- [ ] **Step 1: Failing test**

```js
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
    expect(orange.lines.map((l) => l.text)).toEqual(['6 Back Squats @ 65%', 'Wallballs (6/4)'])
    expect(brown.lines.map((l) => l.text)).toEqual(['3 Back Squats @ 88%', 'Wallballs (12/9)'])
    expect(orange.lines.map((l) => l.movementId)).toEqual(brown.lines.map((l) => l.movementId))
  })
  it('exposes the bare movement name for demo searches', () => {
    expect(renderLevel(block, 2).lines[0].demo).toBe('Back Squats')
  })
})
```

- [ ] **Step 2: Run** `npm test` — Expected: FAIL.

- [ ] **Step 3: Implement** `src/generator/render.js`:

```js
import { getMovement } from '../data/movements.js'

export function amountText(movement, base, scale) {
  if (base == null) return ''
  const raw = base * scale
  switch (movement.unit) {
    case 'm':
      return raw < 200 ? `${Math.max(10, Math.round(raw / 10) * 10)}m` : `${Math.round(raw / 100) * 100}m`
    case 's':
      return `${Math.max(10, Math.round(raw / 5) * 5)}s`
    case 'cal':
      return `${Math.max(1, Math.round(raw))} Cal`
    default:
      return `${Math.max(1, Math.round(raw))}`
  }
}

export function renderLevel(block, level) {
  return {
    lines: block.lines.map(({ movementId, base }) => {
      const m = getMovement(movementId)
      const variant = m.levels[level]
      const name = variant.load ? `${variant.name} ${variant.load}` : variant.name
      const amount = amountText(m, base, variant.scale)
      return { movementId, name, demo: variant.name, text: amount ? `${amount} ${name}` : name }
    }),
  }
}
```

- [ ] **Step 4: Run** `npm test` — Expected: PASS.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: render blocks at a difficulty level"`

---

### Task 5: Strength builder (Block A)

**Files:** Create `src/generator/strength.js`, `tests/strength.test.js`

- [ ] **Step 1: Failing test**

```js
import { describe, it, expect } from 'vitest'
import { buildStrength, intervalHeading } from '../src/generator/strength.js'
import { createRng } from '../src/lib/rng.js'
import { getMovement, FOCI } from '../src/data/movements.js'

describe('strength block', () => {
  it('formats interval headings', () => {
    expect(intervalHeading(60, 10)).toBe('EMOM x 10')
    expect(intervalHeading(180, 5)).toBe('Every 3:00 Minutes x 5')
    expect(intervalHeading(150, 5)).toBe('Every 2:30 Minutes x 5')
  })
  it.each(FOCI)('builds a valid %s block', (focus) => {
    for (let i = 0; i < 50; i++) {
      const b = buildStrength(createRng(`${focus}${i}`), focus)
      const main = getMovement(b.lines[0].movementId)
      expect(main.focus).toBe(focus)
      expect(b.title).toBe(main.title)
      expect(b.timer.mode).toBe('interval')
      expect(b.lines[0].base).toBeLessThanOrEqual(main.repCap ?? 99)
      if (b.lines[1]) expect(getMovement(b.lines[1].movementId).pattern).not.toBe(main.pattern)
    }
  })
})
```

- [ ] **Step 2: Run** `npm test` — Expected: FAIL.

- [ ] **Step 3: Implement** `src/generator/strength.js`:

```js
import { MOVEMENTS } from '../data/movements.js'

export const STRENGTH_TEMPLATES = [
  { interval: 180, rounds: 5, mainReps: [5, 6, 8], withAcc: true },
  { interval: 150, rounds: 5, mainReps: [3, 4, 5], withAcc: true },
  { interval: 120, rounds: 6, mainReps: [3, 5], withAcc: false },
  { interval: 60, rounds: 10, mainReps: [2, 3], withAcc: false },
]

export function intervalHeading(interval, rounds) {
  if (interval === 60) return `EMOM x ${rounds}`
  const m = Math.floor(interval / 60)
  const s = String(interval % 60).padStart(2, '0')
  return `Every ${m}:${s} Minutes x ${rounds}`
}

export function buildStrength(rng, focus) {
  const main = rng.pick(MOVEMENTS.filter((m) => m.roles.includes('main') && m.focus === focus))
  const t = rng.pick(STRENGTH_TEMPLATES)
  const lines = [{ movementId: main.id, base: Math.min(rng.pick(t.mainReps), main.repCap ?? 99) }]
  if (t.withAcc) {
    const acc = rng.pick(MOVEMENTS.filter((m) => m.roles.includes('acc') && m.pattern !== main.pattern))
    lines.push({ movementId: acc.id, base: acc.base })
  }
  return {
    id: 'A',
    kind: 'strength',
    title: main.title,
    window: '10:00 - 30:00',
    goal: null,
    energy: null,
    tags: [],
    heading: [intervalHeading(t.interval, t.rounds)],
    note: null,
    lines,
    timer: { mode: 'interval', interval: t.interval, rounds: t.rounds },
  }
}
```

- [ ] **Step 4: Run** `npm test` — Expected: PASS.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: strength block builder"`

---

### Task 6: Conditioning builders (Block B)

**Files:** Create `src/generator/conditioning.js`, `tests/conditioning.test.js`

- [ ] **Step 1: Failing test**

```js
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
      const pick = (count, filter) => takeMovements(rng, count, 'press', new Set(), filter)
      const b = build(rng, pick)
      expect(b.heading.length).toBeGreaterThan(0)
      expect(b.lines.length).toBeGreaterThanOrEqual(2)
      b.lines.forEach((l) => expect(getMovement(l.movementId).pattern).not.toBe('press'))
      expect(['interval', 'amrap', 'fortime']).toContain(b.timer.mode)
      const secs = b.timer.duration ?? b.timer.cap ?? b.timer.interval * b.timer.rounds
      expect(secs).toBeGreaterThan(0)
      expect(b.energy).toBeTruthy()
    }
  })
})
```

- [ ] **Step 2: Run** `npm test` — Expected: FAIL.

- [ ] **Step 3: Implement** `src/generator/conditioning.js`:

```js
import { MOVEMENTS } from '../data/movements.js'

const HEAVY = 'Heavy Breathing – Vp(v)'
const BURN = 'Muscular Burn – Pp(p)'

const roundSeconds = (moves) => moves.reduce((t, m) => t + m.base * m.sec, 0)
const schemeTotal = (scheme) => scheme.split('-').map(Number).reduce((a, b) => a + b, 0)
const withBase = (moves) => moves.map((m) => ({ movementId: m.id, base: m.base }))
const noBase = (moves) => moves.map((m) => ({ movementId: m.id, base: null }))

// Picks `count` conditioning movements, avoiding `excludePattern` and `usedIds`.
// Prefers one movement per pattern; only repeats a pattern if it has to.
export function takeMovements(rng, count, excludePattern, usedIds, filter = () => true) {
  const pool = rng.shuffle(
    MOVEMENTS.filter((m) => m.roles.includes('cond') && m.pattern !== excludePattern && !usedIds.has(m.id) && filter(m)),
  )
  const picked = []
  const patterns = new Set()
  for (const m of pool) {
    if (picked.length < count && !patterns.has(m.pattern)) {
      picked.push(m)
      patterns.add(m.pattern)
    }
  }
  for (const m of pool) {
    if (picked.length < count && !picked.includes(m)) picked.push(m)
  }
  if (picked.length < count) throw new Error(`Only ${picked.length} movements available, needed ${count}`)
  return picked
}

export const CONDITIONING_BUILDERS = [
  function amrap(rng, pick) {
    const minutes = rng.int(10, 20)
    const moves = pick(3)
    return {
      heading: ['AMRAP', `${minutes} minutes`],
      lines: withBase(moves),
      note: null,
      goal: `${Math.max(1, Math.floor((minutes * 60) / roundSeconds(moves)))}+ Rounds`,
      energy: HEAVY,
      timer: { mode: 'amrap', duration: minutes * 60 },
    }
  },
  function roundsForTime(rng, pick) {
    const rounds = rng.int(3, 5)
    const moves = pick(3)
    const est = rounds * roundSeconds(moves)
    const cap = Math.max(10, Math.ceil((est * 1.5) / 60))
    return {
      heading: [`For Time – ${cap} min CAP`, `${rounds} Rounds`],
      lines: withBase(moves),
      note: null,
      goal: `<${Math.ceil(est / 60)}:00`,
      energy: HEAVY,
      timer: { mode: 'fortime', cap: cap * 60 },
    }
  },
  function repScheme(rng, pick) {
    const scheme = rng.pick(['21-15-9', '30-20-10', '13-11-9-7-5', '10-8-6-4-2'])
    const moves = scheme === '30-20-10' ? pick(2, (m) => m.hiRep) : pick(rng.int(2, 3), (m) => m.schemes !== false)
    const est = schemeTotal(scheme) * moves.reduce((t, m) => t + m.sec, 0)
    const cap = Math.max(8, Math.ceil((est * 1.5) / 60))
    return {
      heading: [`For Time – ${cap} min CAP`, scheme],
      lines: noBase(moves),
      note: null,
      goal: `<${Math.ceil(est / 60)}:00`,
      energy: est <= 540 ? BURN : HEAVY,
      timer: { mode: 'fortime', cap: cap * 60 },
    }
  },
  function ladder(rng, pick) {
    const minutes = rng.int(10, 15)
    const step = rng.pick([2, 3, 5])
    const moves = pick(2, (m) => m.schemes !== false && m.unit === 'reps')
    const perRep = moves.reduce((t, m) => t + m.sec, 0)
    let rounds = 0
    let time = 0
    while (time + step * (rounds + 1) * perRep <= minutes * 60) {
      rounds += 1
      time += step * rounds * perRep
    }
    return {
      heading: ['AMRAP', `${minutes} minutes`, `${step}-${step * 2}-${step * 3}-${step * 4}…etc.`],
      lines: noBase(moves),
      note: null,
      goal: `${Math.max(1, rounds)}+ Rounds`,
      energy: HEAVY,
      timer: { mode: 'amrap', duration: minutes * 60 },
    }
  },
  function altEmom(rng, pick) {
    const count = rng.int(3, 4)
    const minutes = count * rng.int(4, 5)
    const moves = pick(count)
    return {
      heading: [`${minutes} min EMOM Alt.`],
      lines: moves.map((m) => ({ movementId: m.id, base: Math.round(40 / m.sec) })),
      note: 'Drop reps to maintain EMOM',
      goal: null,
      energy: HEAVY,
      timer: { mode: 'interval', interval: 60, rounds: minutes },
    }
  },
  function roundsWithRest(rng, pick) {
    const rounds = rng.int(4, 6)
    const rest = rng.pick([60, 90])
    const moves = pick(2)
    const est = rounds * (roundSeconds(moves) + rest)
    return {
      heading: [`${rounds} Rounds`],
      lines: withBase(moves),
      note: `Rest ${rest === 60 ? '1:00' : '1:30'} between rounds`,
      goal: null,
      energy: BURN,
      timer: { mode: 'fortime', cap: Math.ceil(est / 60 + 2) * 60 },
    }
  },
]
```

- [ ] **Step 4: Run** `npm test` — Expected: PASS.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: conditioning block builders"`

---

### Task 7: generateDay

**Files:** Create `src/generator/generateDay.js`, `tests/generateDay.test.js`

- [ ] **Step 1: Failing test**

```js
import { describe, it, expect } from 'vitest'
import { generateDay } from '../src/generator/generateDay.js'
import { addDays } from '../src/lib/dates.js'
import { getMovement } from '../src/data/movements.js'

const DAYS = Array.from({ length: 730 }, (_, i) => addDays('2026-01-01', i))

describe('generateDay', () => {
  it('is deterministic for a date', () => {
    expect(generateDay('2026-10-21')).toEqual(generateDay('2026-10-21'))
  })
  it('differs between days', () => {
    expect(JSON.stringify(generateDay('2026-10-21'))).not.toBe(JSON.stringify(generateDay('2026-10-22')))
  })
  it('produces a valid day for two years of dates', () => {
    for (const iso of DAYS) {
      const day = generateDay(iso)
      expect(day.blocks.map((b) => b.id)).toEqual(['A', 'B'])
      const ids = day.blocks.flatMap((b) => b.lines.map((l) => l.movementId))
      expect(new Set(ids).size, iso).toBe(ids.length)
      const mainPattern = getMovement(day.blocks[0].lines[0].movementId).pattern
      day.blocks[1].lines.forEach((l) => expect(getMovement(l.movementId).pattern, iso).not.toBe(mainPattern))
      for (const b of day.blocks) {
        expect(b.levels).toHaveLength(6)
        b.levels.forEach((lvl) => expect(lvl.lines.map((l) => l.movementId)).toEqual(b.lines.map((l) => l.movementId)))
      }
      expect(day.blocks[1].title).toBeTruthy()
      expect(day.blocks[1].tags.length).toBeGreaterThan(0)
    }
  })
  it('never repeats the strength focus on consecutive days', () => {
    for (let i = 1; i < DAYS.length; i++) {
      expect(generateDay(DAYS[i]).focus).not.toBe(generateDay(DAYS[i - 1]).focus)
    }
  })
})
```

- [ ] **Step 2: Run** `npm test` — Expected: FAIL.

- [ ] **Step 3: Implement** `src/generator/generateDay.js`:

```js
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
```

- [ ] **Step 4: Run** `npm test` — Expected: PASS.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: date-seeded daily workout generator"`

---

### Task 8: Timer maths, storage, beep

**Files:** Create `src/lib/timer.js`, `src/lib/storage.js`, `src/lib/beep.js`, `tests/timer.test.js`, `tests/storage.test.js`

- [ ] **Step 1: Failing tests**

`tests/timer.test.js`:
```js
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
})
```

`tests/storage.test.js`:
```js
import { describe, it, expect, beforeEach } from 'vitest'
import { loadLevel, saveLevel, loadScores, addScore, storageAvailable } from '../src/lib/storage.js'

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
  it('survives a broken localStorage', () => {
    globalThis.localStorage = { getItem() { throw new Error('no') }, setItem() { throw new Error('no') }, removeItem() {} }
    expect(storageAvailable()).toBe(false)
    expect(loadLevel()).toBe(2)
    expect(addScore('2026-10-21', 'A', { score: '1' })).toBe(false)
  })
})
```

- [ ] **Step 2: Run** `npm test` — Expected: FAIL.

- [ ] **Step 3: Implement**

`src/lib/timer.js`:
```js
export const LEAD_IN = 10

export function formatClock(sec) {
  const s = Math.max(0, Math.floor(sec))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

// elapsed = seconds since Start was pressed (includes the lead-in).
export function timerState(config, elapsed) {
  const t = elapsed - LEAD_IN
  if (t < 0) return { phase: 'ready', display: formatClock(Math.ceil(-t)), round: 0, done: false }

  if (config.mode === 'interval') {
    const total = config.interval * config.rounds
    if (t >= total) return { phase: 'done', display: '00:00', round: config.rounds, done: true }
    const round = Math.floor(t / config.interval) + 1
    return { phase: 'work', display: formatClock(Math.ceil(config.interval - (t % config.interval))), round, done: false }
  }
  if (config.mode === 'amrap') {
    const remaining = config.duration - t
    if (remaining <= 0) return { phase: 'done', display: '00:00', round: 0, done: true }
    return { phase: 'work', display: formatClock(Math.ceil(remaining)), round: 0, done: false }
  }
  if (config.cap && t >= config.cap) return { phase: 'done', display: formatClock(config.cap), round: 0, done: true }
  return { phase: 'work', display: formatClock(t), round: 0, done: false }
}
```

`src/lib/storage.js`:
```js
const LEVEL_KEY = 'dg.level'
const SCORES_KEY = 'dg.scores'
const DEFAULT_LEVEL = 2

function read(key, fallback) {
  try {
    const raw = globalThis.localStorage.getItem(key)
    return raw == null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    globalThis.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function storageAvailable() {
  try {
    globalThis.localStorage.setItem('dg.test', '1')
    globalThis.localStorage.removeItem('dg.test')
    return true
  } catch {
    return false
  }
}

export function loadLevel() {
  const n = read(LEVEL_KEY, DEFAULT_LEVEL)
  return Number.isInteger(n) && n >= 0 && n <= 5 ? n : DEFAULT_LEVEL
}

export function saveLevel(n) {
  return write(LEVEL_KEY, n)
}

const scoreKey = (date, blockId) => `${date}|${blockId}`

export function loadScores(date, blockId) {
  return read(SCORES_KEY, {})[scoreKey(date, blockId)] ?? []
}

export function addScore(date, blockId, entry) {
  const all = read(SCORES_KEY, {})
  const key = scoreKey(date, blockId)
  all[key] = [...(all[key] ?? []), entry]
  return write(SCORES_KEY, all)
}
```

`src/lib/beep.js`:
```js
let ctx = null

// Must first be called from a user gesture (Start button) so browsers allow audio.
export function beep(freq = 880, ms = 180) {
  try {
    ctx ??= new (window.AudioContext || window.webkitAudioContext)()
    if (ctx.state === 'suspended') ctx.resume()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.value = freq
    gain.gain.value = 0.2
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + ms / 1000)
  } catch {
    // audio unsupported: timer still works silently
  }
}
```

- [ ] **Step 4: Run** `npm test` — Expected: PASS.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: timer maths, safe storage and beeps"`

---

### Task 9: Theme, App shell, DayNav, LevelPicker, BlockCard

**Files:** Create `src/style.css`, `src/components/DayNav.vue`, `src/components/LevelPicker.vue`, `src/components/BlockCard.vue`, `src/components/Modal.vue`; replace `src/App.vue`

- [ ] **Step 1: `src/style.css`**

```css
:root {
  --bg: #121418;
  --card: #1f2329;
  --line: #2c3138;
  --text: #ffffff;
  --muted: #9aa0a6;
  --accent: #ffa000;
  --select: #1e88e5;
  color-scheme: dark;
  font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--text); }
#app { max-width: 560px; margin: 0 auto; padding: 0 12px calc(24px + env(safe-area-inset-bottom)); }
button { font: inherit; cursor: pointer; }
.btn { background: var(--accent); color: #111; border: 0; border-radius: 10px; padding: 10px 16px; font-weight: 700; }
.btn.ghost { background: transparent; color: var(--accent); border: 1px solid var(--accent); }
.icon-btn { background: none; border: 0; color: var(--accent); padding: 6px; display: inline-flex; }
.icon-btn svg { width: 28px; height: 28px; }
```

- [ ] **Step 2: `src/components/LevelPicker.vue`**

```vue
<script setup>
import { LEVELS } from '../lib/levels.js'
defineProps({ modelValue: { type: Number, required: true } })
defineEmits(['update:modelValue'])
</script>

<template>
  <div class="levels" role="radiogroup" aria-label="Difficulty level">
    <button
      v-for="(lvl, i) in LEVELS"
      :key="lvl.id"
      class="dot"
      role="radio"
      :aria-checked="modelValue === i"
      :aria-label="lvl.label"
      :style="{ background: lvl.color }"
      :class="{ active: modelValue === i }"
      @click="$emit('update:modelValue', i)"
    />
  </div>
</template>

<style scoped>
.levels { display: flex; gap: 14px; margin: 18px 0 8px; }
.dot { width: 38px; height: 38px; border-radius: 50%; border: 2px solid rgba(0, 0, 0, 0.35); position: relative; padding: 0; }
.dot.active::after { content: ''; position: absolute; left: -2px; right: -2px; bottom: -12px; height: 3px; background: var(--select); border-radius: 2px; }
</style>
```

- [ ] **Step 3: `src/components/DayNav.vue`**

```vue
<script setup>
import { formatLong } from '../lib/dates.js'
defineProps({ date: String, isToday: Boolean })
defineEmits(['prev', 'next', 'today'])
</script>

<template>
  <nav class="daynav">
    <button class="icon-btn" aria-label="Previous day" @click="$emit('prev')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6" /></svg>
    </button>
    <div class="label">
      <strong>{{ isToday ? 'Today' : formatLong(date) }}</strong>
      <span v-if="isToday">{{ formatLong(date) }}</span>
      <button v-else class="today" @click="$emit('today')">Back to today</button>
    </div>
    <button class="icon-btn" aria-label="Next day" @click="$emit('next')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 6l6 6-6 6" /></svg>
    </button>
  </nav>
</template>

<style scoped>
.daynav { display: flex; align-items: center; justify-content: space-between; margin: 8px 0 16px; }
.label { display: flex; flex-direction: column; align-items: center; text-align: center; }
.label span { color: var(--muted); font-size: 13px; }
.today { background: none; border: 0; color: var(--accent); font-size: 13px; padding: 2px; }
</style>
```

- [ ] **Step 4: `src/components/Modal.vue`**

```vue
<script setup>
defineProps({ title: String })
defineEmits(['close'])
</script>

<template>
  <div class="backdrop" @click.self="$emit('close')">
    <div class="sheet" role="dialog" :aria-label="title">
      <header>
        <h3>{{ title }}</h3>
        <button class="icon-btn" aria-label="Close" @click="$emit('close')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </header>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.backdrop { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.7); display: flex; align-items: flex-end; justify-content: center; z-index: 10; }
.sheet { background: var(--card); width: 100%; max-width: 560px; border-radius: 18px 18px 0 0; padding: 16px 18px calc(24px + env(safe-area-inset-bottom)); max-height: 90vh; overflow: auto; }
header { display: flex; justify-content: space-between; align-items: center; }
h3 { margin: 0; }
</style>
```

- [ ] **Step 5: `src/components/BlockCard.vue`** (modals wired in Task 10; start with buttons emitting nothing)

```vue
<script setup>
import { computed, ref } from 'vue'
import LevelPicker from './LevelPicker.vue'
import TimerModal from './TimerModal.vue'
import ScoreModal from './ScoreModal.vue'
import DemoModal from './DemoModal.vue'

const props = defineProps({ block: Object, date: String, initialLevel: Number })
const emit = defineEmits(['level'])

const level = ref(props.initialLevel)
const view = computed(() => props.block.levels[level.value])
const open = ref(null) // 'timer' | 'score' | 'demo' | null

function setLevel(i) {
  level.value = i
  emit('level', i)
}
</script>

<template>
  <article class="card">
    <div class="body">
      <header>
        <h2>{{ block.title }}</h2>
        <div class="meta">
          <span class="time">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
            {{ block.window }}
          </span>
          <span v-if="block.goal">Goal: {{ block.goal }}</span>
        </div>
      </header>
      <p v-if="block.energy" class="energy">Energy System: {{ block.energy }}</p>

      <LevelPicker :model-value="level" @update:model-value="setLevel" />

      <div class="workout">
        <p class="heading">{{ block.heading[0] }}</p>
        <p v-for="h in block.heading.slice(1)" :key="h" class="sub">{{ h }}</p>
        <template v-if="block.kind === 'strength'">
          <template v-for="(line, i) in view.lines" :key="line.movementId">
            <p v-if="i > 0" class="plus">+</p>
            <p>{{ line.text }}</p>
          </template>
        </template>
        <p v-else v-for="line in view.lines" :key="line.movementId">• {{ line.text }}</p>
        <p v-if="block.note" class="note">{{ block.note }}</p>
      </div>

      <div v-if="block.tags.length" class="tags">
        <span v-for="t in block.tags" :key="t">{{ t }}</span>
      </div>
    </div>

    <footer>
      <button class="icon-btn" aria-label="Movement demos" @click="open = 'demo'">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="14" height="12" rx="2" /><path d="M16 10l6-3v10l-6-3z" /></svg>
      </button>
      <button class="icon-btn" aria-label="Timer" @click="open = 'timer'">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
      </button>
      <span class="spacer" />
      <button class="btn" @click="open = 'score'">✎ Chalk It!</button>
    </footer>

    <TimerModal v-if="open === 'timer'" :title="block.title" :timer="block.timer" @close="open = null" />
    <ScoreModal v-if="open === 'score'" :title="block.title" :date="date" :block-id="block.id" :level="level" @close="open = null" />
    <DemoModal v-if="open === 'demo'" :title="block.title" :lines="view.lines" @close="open = null" />
  </article>
</template>

<style scoped>
.card { background: var(--card); border: 1px solid var(--line); border-radius: 14px; margin-bottom: 16px; overflow: hidden; }
.body { padding: 18px 18px 14px; }
header { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
h2 { margin: 0; font-size: 20px; }
.meta { display: flex; flex-direction: column; align-items: flex-end; color: var(--muted); font-size: 14px; gap: 6px; white-space: nowrap; }
.time { display: inline-flex; align-items: center; gap: 6px; }
.time svg { width: 20px; height: 20px; }
.energy { color: var(--muted); margin: 10px 0 0; }
.workout { text-align: center; font-size: 19px; line-height: 1.35; margin-top: 18px; }
.workout p { margin: 2px 0; }
.heading { font-weight: 800; font-style: italic; text-decoration: underline; }
.sub { font-weight: 800; font-style: italic; }
.plus { font-weight: 700; }
.note { font-style: italic; margin-top: 12px !important; }
.tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; }
.tags span { background: var(--accent); color: #111; border-radius: 6px; padding: 3px 8px; font-size: 13px; }
footer { display: flex; align-items: center; gap: 8px; padding: 12px 18px; border-top: 1px solid var(--line); }
.spacer { flex: 1; }
</style>
```

- [ ] **Step 6: Replace `src/App.vue`**

```vue
<script setup>
import { computed, ref } from 'vue'
import { generateDay } from './generator/generateDay.js'
import { toISODate, addDays } from './lib/dates.js'
import { loadLevel, saveLevel } from './lib/storage.js'
import DayNav from './components/DayNav.vue'
import BlockCard from './components/BlockCard.vue'

const today = toISODate(new Date())
const date = ref(today)
const day = computed(() => generateDay(date.value))
const preferredLevel = ref(loadLevel())

function onLevel(i) {
  preferredLevel.value = i
  saveLevel(i)
}
</script>

<template>
  <header class="brand"><h1>Daily <span>Grind</span></h1></header>
  <DayNav :date="date" :is-today="date === today" @prev="date = addDays(date, -1)" @next="date = addDays(date, 1)" @today="date = today" />
  <main>
    <BlockCard v-for="b in day.blocks" :key="`${date}-${b.id}`" :block="b" :date="date" :initial-level="preferredLevel" @level="onLevel" />
  </main>
</template>

<style scoped>
.brand { padding-top: calc(16px + env(safe-area-inset-top)); text-align: center; }
h1 { margin: 0; font-size: 26px; letter-spacing: 0.5px; text-transform: uppercase; }
h1 span { color: var(--accent); }
</style>
```

(Build will fail until Task 10 creates the three modals — that's expected; commit after Task 10.)

---

### Task 10: Timer, Score and Demo modals

**Files:** Create `src/components/TimerModal.vue`, `src/components/ScoreModal.vue`, `src/components/DemoModal.vue`

- [ ] **Step 1: `src/components/TimerModal.vue`**

```vue
<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import Modal from './Modal.vue'
import { timerState } from '../lib/timer.js'
import { beep } from '../lib/beep.js'

const props = defineProps({ title: String, timer: Object })
defineEmits(['close'])

const elapsed = ref(0)
const running = ref(false)
let startedAt = 0
let banked = 0
let tick = null
let wakeLock = null
let prev = timerState(props.timer, 0)

const state = computed(() => timerState(props.timer, elapsed.value))
const modeLabel = { interval: 'Interval', amrap: 'AMRAP', fortime: 'For Time' }[props.timer.mode]

function update() {
  elapsed.value = banked + (Date.now() - startedAt) / 1000
  const s = state.value
  if (s.phase === 'ready' && s.display !== prev.display && ['00:03', '00:02', '00:01'].includes(s.display)) beep(660, 120)
  if (s.phase === 'work' && prev.phase === 'ready') beep(990, 400)
  else if (s.phase === 'work' && s.round !== prev.round) beep(990, 300)
  if (s.done && !prev.done) {
    beep(520, 700)
    pause()
  }
  prev = s
}

async function start() {
  beep(0, 1) // unlock audio on user gesture
  startedAt = Date.now()
  running.value = true
  tick = setInterval(update, 200)
  try { wakeLock = await navigator.wakeLock?.request('screen') } catch { wakeLock = null }
}

function pause() {
  if (!running.value) return
  banked = elapsed.value
  running.value = false
  clearInterval(tick)
  wakeLock?.release?.()
  wakeLock = null
}

function reset() {
  pause()
  banked = 0
  elapsed.value = 0
  prev = timerState(props.timer, 0)
}

onBeforeUnmount(pause)
</script>

<template>
  <Modal :title="`${title} — ${modeLabel}`" @close="$emit('close')">
    <div class="timer" :class="state.phase">
      <p class="phase">{{ state.phase === 'ready' ? 'Get ready' : state.done ? 'Time!' : modeLabel }}</p>
      <p class="clock">{{ state.display }}</p>
      <p v-if="timer.mode === 'interval' && state.round" class="round">Round {{ state.round }} / {{ timer.rounds }}</p>
      <div class="controls">
        <button v-if="!running && !state.done" class="btn" @click="start">{{ elapsed ? 'Resume' : 'Start' }}</button>
        <button v-if="running" class="btn" @click="pause">Pause</button>
        <button class="btn ghost" @click="reset">Reset</button>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.timer { text-align: center; padding: 12px 0; }
.phase { color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin: 0; }
.clock { font-size: 72px; font-weight: 800; font-variant-numeric: tabular-nums; margin: 8px 0; }
.ready .clock { color: var(--accent); }
.round { font-size: 20px; margin: 0 0 8px; }
.controls { display: flex; gap: 10px; justify-content: center; margin-top: 12px; }
</style>
```

- [ ] **Step 2: `src/components/ScoreModal.vue`**

```vue
<script setup>
import { ref } from 'vue'
import Modal from './Modal.vue'
import { LEVELS } from '../lib/levels.js'
import { addScore, loadScores, storageAvailable } from '../lib/storage.js'

const props = defineProps({ title: String, date: String, blockId: String, level: Number })
defineEmits(['close'])

const canSave = storageAvailable()
const score = ref('')
const notes = ref('')
const history = ref(loadScores(props.date, props.blockId))

function save() {
  if (!score.value.trim()) return
  addScore(props.date, props.blockId, { score: score.value.trim(), notes: notes.value.trim(), level: props.level, at: Date.now() })
  history.value = loadScores(props.date, props.blockId)
  score.value = ''
  notes.value = ''
}
</script>

<template>
  <Modal :title="`Chalk It! — ${title}`" @close="$emit('close')">
    <p v-if="!canSave" class="warn">Scores can't be saved on this device (storage is blocked).</p>
    <form @submit.prevent="save">
      <label>Score <input v-model="score" placeholder="e.g. 6+12, 14:32, 80kg" /></label>
      <label>Notes <textarea v-model="notes" rows="2" placeholder="Optional" /></label>
      <p class="level">Level: <span class="dot" :style="{ background: LEVELS[level].color }" /> {{ LEVELS[level].label }}</p>
      <button class="btn" type="submit" :disabled="!canSave">Save score</button>
    </form>
    <section v-if="history.length">
      <h4>Your scores</h4>
      <ul>
        <li v-for="h in [...history].reverse()" :key="h.at">
          <span class="dot" :style="{ background: LEVELS[h.level]?.color }" />
          <strong>{{ h.score }}</strong>
          <span v-if="h.notes" class="muted"> — {{ h.notes }}</span>
        </li>
      </ul>
    </section>
  </Modal>
</template>

<style scoped>
form { display: flex; flex-direction: column; gap: 12px; margin-top: 12px; }
label { display: flex; flex-direction: column; gap: 4px; color: var(--muted); font-size: 14px; }
input, textarea { background: var(--bg); color: var(--text); border: 1px solid var(--line); border-radius: 8px; padding: 10px; font: inherit; }
.level { margin: 0; display: flex; align-items: center; gap: 6px; }
.dot { display: inline-block; width: 14px; height: 14px; border-radius: 50%; vertical-align: middle; margin-right: 6px; }
ul { list-style: none; padding: 0; }
li { padding: 8px 0; border-bottom: 1px solid var(--line); }
.muted { color: var(--muted); }
.warn { color: var(--accent); }
</style>
```

- [ ] **Step 3: `src/components/DemoModal.vue`**

```vue
<script setup>
import Modal from './Modal.vue'
defineProps({ title: String, lines: Array })
defineEmits(['close'])
const url = (name) => `https://www.youtube.com/results?search_query=${encodeURIComponent(`${name} exercise demo`)}`
</script>

<template>
  <Modal :title="`Demos — ${title}`" @close="$emit('close')">
    <ul>
      <li v-for="l in lines" :key="l.movementId">
        <a :href="url(l.demo)" target="_blank" rel="noopener">▶ {{ l.demo }}</a>
      </li>
    </ul>
  </Modal>
</template>

<style scoped>
ul { list-style: none; padding: 0; }
li { padding: 12px 0; border-bottom: 1px solid var(--line); }
a { color: var(--accent); text-decoration: none; font-size: 18px; }
</style>
```

- [ ] **Step 4: Verify** — `npm test` (PASS) and `npm run build` (succeeds).
- [ ] **Step 5: Manual check** — `npm run dev`, open the URL at phone width: two cards render, circles change movements/reps but not the format, day arrows change the workout, timer counts and beeps, a saved score shows in history after reopening, demo links open YouTube.
- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: Vue UI with level picker, timer, score log and demos"`

---

### Task 11: GitHub Actions deploy workflow

**Files:** Create `.github/workflows/deploy.yml`

- [ ] **Step 1: Write workflow**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Commit** — `git add -A && git commit -m "ci: test, build and deploy to GitHub Pages"`

---

### Task 12: Album audit — check library covers the user's workouts

**Files:** Create `docs/album-notes.md`; modify `src/data/movements.js` / `src/data/names.js` as needed.

Album photos are already downloaded to the session scratchpad (`album/img*.jpg`, 272 files; whiteboards + app screenshots).

- [ ] **Step 1:** View every photo (downscaled copies are fine). For each, record in `docs/album-notes.md` one line: format (EMOM / AMRAP / For Time / scheme / rounds), movements, loads/heights.
- [ ] **Step 2:** List movements and formats that appear in the album but are missing from `MOVEMENTS` / `CONDITIONING_BUILDERS`.
- [ ] **Step 3:** Add each missing movement to `src/data/movements.js` with the same shape (six levels, easiest → hardest, `pattern`, `tags`, `unit`, `base`, `sec`). Add any workout names seen to `src/data/names.js`.
- [ ] **Step 4:** Run `npm test` — Expected: PASS (the library and 730-day generator tests cover the new data).
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: extend movement library from album audit"`

---

### Task 13: Publish (needs user's go-ahead — creates a public repo)

- [ ] **Step 1:** Confirm with the user before publishing.
- [ ] **Step 2:** `gh repo create daily-grind --public --source . --push`
- [ ] **Step 3:** Enable Pages from Actions: `gh api -X POST repos/owenmatty/daily-grind/pages -f build_type=workflow`
- [ ] **Step 4:** Re-run the workflow if the first push ran before Pages was enabled: `gh workflow run deploy.yml` then `gh run watch`.
- [ ] **Step 5:** Verify `https://owenmatty.github.io/daily-grind/` returns 200 and shows today's workout.
