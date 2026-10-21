import { ref } from 'vue'

// Only one timer dock is open at a time, whichever card opened it last.
export const activeTimer = ref(null)
