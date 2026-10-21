<script setup>
import { computed, ref } from 'vue'
import { LEVELS } from '../lib/levels.js'
import { allScores, deleteScore, storageAvailable } from '../lib/storage.js'
import { personalBests } from '../lib/pbs.js'
import { formatLong } from '../lib/dates.js'

defineEmits(['open-day'])

const canSave = storageAvailable()
const entries = ref(allScores())
const bests = computed(() => personalBests(entries.value))
const confirming = ref(null)

// Two taps to delete, so a stray tap can't lose a score.
function remove(e) {
  if (confirming.value !== e.at) {
    confirming.value = e.at
    return
  }
  deleteScore(e.date, e.blockId, e.at)
  entries.value = allScores()
  confirming.value = null
}
</script>

<template>
  <p v-if="!canSave" class="warn">Scores can't be saved on this device (storage is blocked).</p>

  <section class="card">
    <h2>Personal bests</h2>
    <p v-if="!bests.length" class="muted">Log your heaviest set on a strength workout (e.g. 80kg) and your best lifts appear here.</p>
    <ul v-else class="pbs">
      <li v-for="b in bests" :key="b.lift">
        <span class="dot" :style="{ background: LEVELS[b.level]?.color }" />
        <span class="lift">{{ b.lift }}</span>
        <strong>{{ b.kg }}kg</strong>
        <span class="when">{{ formatLong(b.date) }}</span>
      </li>
    </ul>
  </section>

  <section>
    <h2 class="section-title">History</h2>
    <p v-if="!entries.length" class="muted">No scores yet. Tap "Chalk It!" on a workout to log one.</p>
    <article v-for="e in entries" :key="e.at" class="card entry" :style="{ '--level': LEVELS[e.level]?.color }">
      <header>
        <button class="day" @click="$emit('open-day', e.date)">{{ formatLong(e.date) }} ›</button>
        <span class="level">{{ LEVELS[e.level]?.label }}</span>
      </header>
      <h3>{{ e.title ?? (e.blockId === 'A' ? 'Strength' : 'Conditioning') }}</h3>
      <p v-if="e.lines" class="workout">{{ [...(e.heading ?? []), ...e.lines].join(' · ') }}</p>
      <p class="score">{{ e.score }}<span v-if="e.notes" class="muted"> — {{ e.notes }}</span></p>
      <button class="delete" @click="remove(e)">{{ confirming === e.at ? 'Tap again to delete' : 'Delete' }}</button>
    </article>
  </section>
</template>

<style scoped>
.card { background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 16px 18px; margin-bottom: 16px; }
h2 { margin: 0 0 10px; font-size: 18px; }
.section-title { margin: 8px 2px 10px; }
.muted { color: var(--muted); }
.warn { color: var(--accent); }
.pbs { list-style: none; padding: 0; margin: 0; }
.pbs li { display: grid; grid-template-columns: auto 1fr auto; gap: 2px 10px; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--line); }
.pbs li:last-child { border-bottom: 0; }
.pbs strong { font-size: 18px; color: var(--accent); }
.when { grid-column: 2 / 4; color: var(--muted); font-size: 12px; }
.dot { width: 14px; height: 14px; border-radius: 50%; box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.28); }
.entry { border-top: 4px solid var(--level); }
.entry header { display: flex; justify-content: space-between; align-items: center; }
.day { background: none; border: 0; padding: 0; color: var(--accent); font-size: 13px; }
.level { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
h3 { margin: 8px 0 4px; font-size: 16px; }
.workout { color: var(--muted); font-size: 14px; margin: 0 0 8px; }
.score { font-size: 20px; font-weight: 800; margin: 0; }
.score .muted { font-size: 14px; font-weight: 400; }
.delete { background: none; border: 0; padding: 8px 0 0; color: var(--muted); font-size: 13px; }
</style>
