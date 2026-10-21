# Daily Grind — Design Spec

Date: 2026-10-21

## Goal

A mobile-first fitness website that shows a new, randomised workout every day,
in the style of the user's gym programming (source: their Google Photos album of
whiteboard workouts and app screenshots). Each workout can be viewed at six
difficulty levels via coloured circles.

## Architecture

- Vue 3 + Vite, static site, no backend.
- Hosted on GitHub Pages at `<username>.github.io/daily-grind`, deployed by a
  GitHub Actions workflow on push to `main`.
- Look: dark cards, orange action buttons, six coloured level circles
  (white, yellow, orange, blue, purple, brown), modelled on the reference app.

## Workout library (`src/data/`)

Built by transcribing every photo in the album:

- **Movements**: each movement has a name, tags (e.g. "Upper Body Pull",
  "Weightlifting", "Neurological and Core") and **six variants**, one per level,
  ordered easiest → hardest. A variant may change the movement itself, the rep
  multiplier, and/or the load.
  Example — pull-ups: band/cable pull-ups → ring rows → jumping pull-ups →
  strict pull-ups → kipping pull-ups → chest-to-bar.
- **Strength templates** (Block A, 10:00–30:00): e.g. "Every 3:00 × 5",
  "EMOM × 10", "Every 2:30 × 5", pairing a main lift/skill with an accessory.
- **Conditioning templates** (Block B, 30:00–60:00): AMRAP, For Time with cap,
  21-15-9, 30-20-10, ascending ladders, alternating EMOMs, "N rounds + rest".
  Each has a goal (e.g. "6+ rounds", "<16:00") and an energy system
  ("Heavy Breathing – Vp(v)", "Muscular Burn – Pp(p)", etc.).
- **Workout names**: a pool of fun names for Block B.

## Daily generator (`src/generator/`)

- Pure function `generateDay(date) -> Day`.
- Seeded PRNG keyed on the date (YYYY-MM-DD): same date → same workout for
  everyone; changes at local midnight; any date reproducible.
- Randomly picks a strength template + movements and a conditioning template +
  movements from the library.
- Rules: no repeated movement within a day; Block A and Block B don't both hit
  the same heavy pattern (e.g. not two squat-dominant pieces); consecutive days
  avoid the same Block A main lift.
- A `Day` contains two blocks; each block has title, time window, optional
  goal/energy system/tags, timer config, and its movements resolved for **all six
  levels**.

## Difficulty levels

- The workout's format, timing and movement order are **identical** across
  levels. Only each movement's difficulty changes (variant, reps, load).
- White = easiest, brown = hardest.
- Selected level is per block, defaults to the last level the user chose
  (remembered in localStorage).

## Features

1. **Today's workout**: two block cards with level circles.
2. **Day navigation**: previous/next arrows and a "Today" button.
3. **Timer** (clock icon per block): EMOM/interval mode (beeps each interval,
   shows round), AMRAP countdown, For Time stopwatch with cap. Uses Web Audio
   beeps; screen stays on via Wake Lock where supported.
4. **Log score** ("Chalk It!"): score, level and notes per block per date,
   saved in localStorage; shows past entries for that block.
5. **Demo links** (video icon): opens a YouTube search for each movement at the
   chosen level in a new tab.

## Error handling

- localStorage unavailable → app still works; logging shows a "can't save on this
  device" message.
- Wake Lock / audio unsupported → timer still runs silently.

## Testing

- Vitest unit tests: determinism (same date → same output), all six levels
  present for every movement, identical structure across levels, generator
  produces a valid day for every date across two years, no-repeat rules hold.
- `npm run build` must succeed before deploy (enforced in the Actions workflow).

## Out of scope

Accounts, server-side storage, leaderboards, Laravel backend.

## Prerequisite

GitHub CLI installed and authenticated (one-time browser login) to create the
repo and enable Pages.
