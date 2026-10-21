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
