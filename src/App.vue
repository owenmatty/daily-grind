<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { generateDay } from './generator/generateDay.js'
import { toISODate, addDays, rollover } from './lib/dates.js'
import { loadLevel, saveLevel } from './lib/storage.js'
import DayNav from './components/DayNav.vue'
import BlockCard from './components/BlockCard.vue'

const today = ref(toISODate(new Date()))
const date = ref(today.value)
const day = computed(() => generateDay(date.value))
const preferredLevel = ref(loadLevel())

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
