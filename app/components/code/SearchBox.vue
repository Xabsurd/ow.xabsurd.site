<script setup lang="ts">
const model = defineModel<string>({ default: '' })
const { t } = useI18n()
</script>

<template>
  <label class="block">
    <span class="sr-only">{{ t('filters.search') }}</span>
    <input v-model="model" class="focus-ring h-12 w-full rounded-xl border border-white/45 bg-white/35 px-4 text-sm shadow-lg shadow-slate-950/5 backdrop-blur-xl transition hover:bg-white/55 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15" :placeholder="t('filters.searchPlaceholder')" >
  </label>
</template>
