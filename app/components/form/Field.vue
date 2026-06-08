<script setup lang="ts">
defineProps<{
  label?: string
  hint?: string
  required?: boolean
}>()
</script>

<template>
  <label class="block">
    <span v-if="label" class="mb-1.5 block text-sm font-semibold text-slate-600 dark:text-slate-300">
      {{ label }}<span v-if="required" class="ml-0.5 text-cyan-600 dark:text-cyan-300">*</span>
    </span>
    <slot />
    <span v-if="hint" class="mt-1.5 block text-xs text-slate-500/90 dark:text-slate-400">{{ hint }}</span>
  </label>
</template>
