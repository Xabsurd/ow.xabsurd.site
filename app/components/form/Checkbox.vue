<script setup lang="ts">
defineProps<{ label: string }>()
const model = defineModel<boolean>({ default: false })
</script>

<template>
  <label class="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/45 bg-white/25 px-3 text-sm font-semibold shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10">
    <input v-model="model" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-cyan-500 focus:ring-cyan-300">
    <span>{{ label }}</span>
  </label>
</template>
