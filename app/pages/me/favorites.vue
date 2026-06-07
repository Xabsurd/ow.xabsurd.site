<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { t } = useI18n()
const { data, pending } = await useFetch('/api/me/favorites')
</script>

<template>
  <div class="space-y-4">
    <div class="rounded-2xl border border-white/45 bg-white/40 p-4 shadow-xl shadow-slate-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
      <h1 class="text-2xl font-semibold">{{ t('pages.favorites') }}</h1>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ t('profile.favoriteCount', { count: data?.items?.length || 0 }) }}</p>
    </div>
    <UiLoadingState v-if="pending" />
    <CodeList v-else :items="data?.items || []" :empty-title="t('ui.empty')" />
  </div>
</template>
