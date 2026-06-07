<script setup lang="ts">
defineProps<{ status: string }>()
</script>

<template>
  <span
class="inline-flex rounded-md border px-2 py-1 text-xs font-medium" :class="{
    'border-amber-400/30 bg-amber-400/10 text-amber-700 dark:text-amber-200': status === 'PENDING',
    'border-emerald-400/30 bg-emerald-400/10 text-emerald-700 dark:text-emerald-200': status === 'APPROVED',
    'border-rose-400/30 bg-rose-400/10 text-rose-700 dark:text-rose-200': ['REJECTED', 'HIDDEN', 'DELETED'].includes(status)
  }">
    {{ status }}
  </span>
</template>
