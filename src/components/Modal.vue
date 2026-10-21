<script setup>
defineProps({ title: String })
defineEmits(['close'])
</script>

<template>
  <div class="backdrop" @click.self="$emit('close')">
    <div class="sheet" role="dialog" :aria-label="title">
      <header>
        <h3>{{ title }}</h3>
        <button class="icon-btn" aria-label="Close" @click="$emit('close')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </header>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.backdrop { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.7); display: flex; align-items: flex-end; justify-content: center; z-index: 10; }
.sheet { background: var(--card); width: 100%; max-width: 560px; border-radius: 18px 18px 0 0; padding: 16px 18px calc(24px + env(safe-area-inset-bottom)); max-height: 90vh; overflow: auto; }
header { display: flex; justify-content: space-between; align-items: center; }
h3 { margin: 0; }
</style>
