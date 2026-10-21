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
    <span class="label">{{ LEVELS[modelValue].label }}</span>
  </div>
</template>

<style scoped>
.levels { display: flex; align-items: center; gap: 12px; margin: 18px 0 8px; flex-wrap: wrap; }
.dot { width: 34px; height: 34px; border-radius: 50%; border: 0; padding: 0; box-shadow: inset 0 0 0 1.5px rgba(255, 255, 255, 0.28); transition: transform 0.15s; }
.dot.active { transform: scale(1.15); outline: 2.5px solid var(--text); outline-offset: 3px; }
.label { color: var(--muted); font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin-left: 4px; }
</style>
