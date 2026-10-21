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
