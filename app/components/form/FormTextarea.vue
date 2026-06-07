<script setup lang="ts">
defineProps<{ label: string; required?: boolean; rows?: number }>()
const model = defineModel<string>({ default: '' })
</script>

<template>
  <label class="block">
    <span class="text-sm font-medium">{{ label }}</span>
    <textarea v-model="model" :required="required" :rows="rows || 6" class="focus-ring mt-1 w-full rounded-xl border border-white/45 bg-white/35 px-3 py-3 text-sm shadow-lg shadow-slate-950/5 backdrop-blur-xl transition hover:bg-white/55 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15" />
  </label>
</template>
