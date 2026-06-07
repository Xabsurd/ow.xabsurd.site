<script setup lang="ts">
defineProps<{ title: string; description?: string }>()
</script>

<template>
  <div class="rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
    <h3 class="font-semibold">{{ title }}</h3>
    <p v-if="description" class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ description }}</p>
  </div>
</template>
