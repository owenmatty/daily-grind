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
