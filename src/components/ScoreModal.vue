<script setup>
import { ref } from 'vue'
import Modal from './Modal.vue'
import { LEVELS } from '../lib/levels.js'
import { addScore, loadScores, storageAvailable } from '../lib/storage.js'

const props = defineProps({ title: String, date: String, blockId: String, level: Number })
defineEmits(['close'])

const canSave = storageAvailable()
const score = ref('')
const notes = ref('')
const history = ref(loadScores(props.date, props.blockId))

function save() {
  if (!score.value.trim()) return
  addScore(props.date, props.blockId, { score: score.value.trim(), notes: notes.value.trim(), level: props.level, at: Date.now() })
  history.value = loadScores(props.date, props.blockId)
  score.value = ''
  notes.value = ''
}
</script>

<template>
  <Modal :title="`Chalk It! — ${title}`" @close="$emit('close')">
    <p v-if="!canSave" class="warn">Scores can't be saved on this device (storage is blocked).</p>
    <form @submit.prevent="save">
      <label>Score <input v-model="score" placeholder="e.g. 6+12, 14:32, 80kg" /></label>
      <label>Notes <textarea v-model="notes" rows="2" placeholder="Optional" /></label>
      <p class="level">Level: <span class="dot" :style="{ background: LEVELS[level].color }" /> {{ LEVELS[level].label }}</p>
      <button class="btn" type="submit" :disabled="!canSave">Save score</button>
    </form>
    <section v-if="history.length">
      <h4>Your scores</h4>
      <ul>
        <li v-for="h in [...history].reverse()" :key="h.at">
          <span class="dot" :style="{ background: LEVELS[h.level]?.color }" />
          <strong>{{ h.score }}</strong>
          <span v-if="h.notes" class="muted"> — {{ h.notes }}</span>
        </li>
      </ul>
    </section>
  </Modal>
</template>

<style scoped>
form { display: flex; flex-direction: column; gap: 12px; margin-top: 12px; }
label { display: flex; flex-direction: column; gap: 4px; color: var(--muted); font-size: 14px; }
input, textarea { background: var(--bg); color: var(--text); border: 1px solid var(--line); border-radius: 8px; padding: 10px; font: inherit; }
.level { margin: 0; display: flex; align-items: center; gap: 6px; }
.dot { display: inline-block; width: 14px; height: 14px; border-radius: 50%; vertical-align: middle; margin-right: 6px; }
ul { list-style: none; padding: 0; }
li { padding: 8px 0; border-bottom: 1px solid var(--line); }
.muted { color: var(--muted); }
.warn { color: var(--accent); }
</style>
