<script setup>
import Modal from './Modal.vue'
defineProps({ title: String, lines: Array })
defineEmits(['close'])
const url = (name) => `https://www.youtube.com/results?search_query=${encodeURIComponent(`${name} exercise demo`)}`
</script>

<template>
  <Modal :title="`Demos — ${title}`" @close="$emit('close')">
    <ul>
      <li v-for="l in lines" :key="l.movementId">
        <a :href="url(l.demo)" target="_blank" rel="noopener">▶ {{ l.demo }}</a>
      </li>
    </ul>
  </Modal>
</template>

<style scoped>
ul { list-style: none; padding: 0; }
li { padding: 12px 0; border-bottom: 1px solid var(--line); }
a { color: var(--accent); text-decoration: none; font-size: 18px; }
</style>
