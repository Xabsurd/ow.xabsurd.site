<script setup lang="ts">
defineProps<{ title: string; description?: string }>()
</script>

<template>
  <div class="mx-auto max-w-md">
    <UiGlassCard>
      <h1 class="text-2xl font-semibold">{{ title }}</h1>
      <p v-if="description" class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ description }}</p>
      <div class="mt-6">
        <slot />
      </div>
    </UiGlassCard>
  </div>
</template>
