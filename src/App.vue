<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { generateDay } from './generator/generateDay.js'
import { toISODate, addDays, rollover } from './lib/dates.js'
import { loadLevel, saveLevel } from './lib/storage.js'
import DayNav from './components/DayNav.vue'
import BlockCard from './components/BlockCard.vue'
import ScoresPage from './components/ScoresPage.vue'

const today = ref(toISODate(new Date()))
const date = ref(today.value)
const day = computed(() => generateDay(date.value))
const preferredLevel = ref(loadLevel())
const view = ref('workouts') // 'workouts' | 'scores'

function openDay(d) {
  date.value = d
  view.value = 'workouts'
}

function onLevel(i) {
  preferredLevel.value = i
  saveLevel(i)
}

// Switch to the new day's workout at midnight, and when a backgrounded phone tab comes back.
function checkDate() {
  const next = rollover(date.value, today.value, toISODate(new Date()))
  today.value = next.today
  date.value = next.date
}

let clock = null
onMounted(() => {
  clock = setInterval(checkDate, 30000)
  document.addEventListener('visibilitychange', checkDate)
})
onBeforeUnmount(() => {
  clearInterval(clock)
  document.removeEventListener('visibilitychange', checkDate)
})
</script>

<template>
  <header class="brand">
    <h1>Daily <span>Grind</span></h1>
    <nav class="tabs">
      <button :class="{ active: view === 'workouts' }" @click="view = 'workouts'">Workouts</button>
      <button :class="{ active: view === 'scores' }" @click="view = 'scores'">My Scores</button>
    </nav>
  </header>
  <template v-if="view === 'workouts'">
    <DayNav :date="date" :is-today="date === today" @prev="date = addDays(date, -1)" @next="date = addDays(date, 1)" @today="date = today" />
    <main>
      <BlockCard v-for="b in day.blocks" :key="`${date}-${b.id}`" :block="b" :date="date" :initial-level="preferredLevel" @level="onLevel" />
    </main>
  </template>
  <main v-else class="scores"><ScoresPage @open-day="openDay" /></main>
</template>

<style scoped>
.brand { padding-top: calc(16px + env(safe-area-inset-top)); text-align: center; }
h1 { margin: 0; font-size: 26px; letter-spacing: 0.5px; text-transform: uppercase; }
h1 span { color: var(--accent); }
.tabs { display: inline-flex; gap: 4px; margin-top: 12px; padding: 4px; background: var(--card); border: 1px solid var(--line); border-radius: 999px; }
.tabs button { background: none; border: 0; color: var(--muted); padding: 6px 16px; border-radius: 999px; font-size: 14px; font-weight: 600; }
.tabs button.active { background: var(--accent); color: var(--on-accent); }
.scores { margin-top: 16px; }
</style>
