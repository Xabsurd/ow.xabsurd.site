<script setup lang="ts">
defineProps<{ error: { statusCode?: number; statusMessage?: string; message?: string } }>()
</script>

<template>
  <NuxtLayout>
    <div class="mx-auto max-w-xl py-16">
      <UiGlassCard>
        <p class="text-sm font-semibold text-cyan-600 dark:text-cyan-300">{{ error.statusCode || 500 }}</p>
        <h1 class="mt-3 text-3xl font-semibold">{{ error.statusMessage || error.message || 'Something went wrong' }}</h1>
        <NuxtLink to="/" class="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">Back home</NuxtLink>
      </UiGlassCard>
    </div>
  </NuxtLayout>
</template>
