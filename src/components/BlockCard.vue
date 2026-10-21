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
