<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { timerState, formatClock, addLap } from '../lib/timer.js'
import { beep } from '../lib/beep.js'

// Docked to the bottom of the screen (no dark overlay) so the workout stays readable above it.
const props = defineProps({ title: String, timer: Object })
defineEmits(['close'])

const elapsed = ref(0)
const running = ref(false)
const laps = ref([])
const dock = ref(null)
let startedAt = 0
let banked = 0
let tick = null
let wakeLock = null
let resize = null
let prev = timerState(props.timer, 0)

const state = computed(() => timerState(props.timer, elapsed.value))
const detail = computed(() => {
  const s = state.value
  if (s.done) return 'Time!'
  const parts = []
  if (s.phase === 'rest') parts.push('Rest')
  if (s.round) parts.push(`Round ${s.round} / ${props.timer.rounds}`)
  if (s.remaining) parts.push(`${s.remaining} left`)
  return parts.join(' · ')
})

function update() {
  elapsed.value = banked + (Date.now() - startedAt) / 1000
  const s = state.value
  if (s.phase === 'work' && s.round !== prev.round && s.round > 1) beep(990, 300)
  else if (s.phase === 'work' && prev.phase === 'rest') beep(990, 300)
  else if (s.phase === 'rest' && prev.phase === 'work') beep(660, 300)
  if (s.done && !prev.done) {
    beep(520, 700)
    pause()
  }
  prev = s
}

async function start() {
  if (elapsed.value === 0) beep(990, 300)
  else beep(0, 1) // unlock audio on user gesture
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
  laps.value = []
  prev = timerState(props.timer, 0)
}

function lap() {
  laps.value = addLap(laps.value, elapsed.value)
}

// Reserve a screen's worth of space at the bottom of the page, so even the last card
// can scroll right to the top and sit fully above the dock.
function reserveSpace() {
  document.body.style.paddingBottom = `${Math.max(dock.value.offsetHeight + 16, window.innerHeight)}px`
}

onMounted(() => {
  reserveSpace()
  resize = new ResizeObserver(reserveSpace)
  resize.observe(dock.value)
})
onBeforeUnmount(() => {
  pause()
  resize?.disconnect()
  document.body.style.paddingBottom = ''
})
</script>

<template>
  <section ref="dock" class="dock" :class="state.phase" role="region" :aria-label="`${title} timer`">
    <header>
      <span class="title">{{ title }}</span>
      <button class="icon-btn" aria-label="Close timer" @click="$emit('close')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
    </header>
    <p class="clock">{{ state.display }}</p>
    <p class="detail">{{ detail || ' ' }}</p>
    <div class="controls">
      <button v-if="!running" class="btn" :disabled="state.done" @click="start">{{ elapsed ? 'Resume' : 'Start' }}</button>
      <button v-else class="btn" @click="pause">Pause</button>
      <button class="btn ghost" :disabled="!running" @click="lap">Lap</button>
      <button class="btn ghost" @click="reset">Reset</button>
    </div>
    <ol v-if="laps.length" class="laps">
      <li v-for="l in [...laps].reverse()" :key="l.n">
        <span>Lap {{ l.n }}</span>
        <strong>{{ formatClock(l.lap) }}</strong>
        <span class="total">{{ formatClock(l.total) }}</span>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.dock { position: fixed; left: 0; right: 0; bottom: 0; z-index: 10; max-width: 560px; margin: 0 auto; background: var(--card); border: 1px solid var(--line); border-top: 3px solid var(--accent); border-radius: 18px 18px 0 0; padding: 10px 18px calc(14px + env(safe-area-inset-bottom)); box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.35); }
.dock.rest { border-top-color: var(--muted); }
header { display: flex; justify-content: space-between; align-items: center; }
.title { font-weight: 700; }
.icon-btn svg { width: 24px; height: 24px; }
.clock { font-size: 52px; font-weight: 800; font-variant-numeric: tabular-nums; text-align: center; margin: 0; line-height: 1.1; }
.detail { text-align: center; color: var(--muted); margin: 2px 0 10px; font-variant-numeric: tabular-nums; }
.rest .detail, .done .detail { color: var(--accent); font-weight: 700; }
.controls { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.controls .btn:disabled { opacity: 0.4; }
.laps { list-style: none; margin: 10px 0 0; padding: 0; max-height: 92px; overflow-y: auto; font-variant-numeric: tabular-nums; }
.laps li { display: grid; grid-template-columns: 1fr auto auto; gap: 14px; padding: 5px 2px; border-top: 1px solid var(--line); font-size: 14px; }
.laps .total { color: var(--muted); }
</style>
