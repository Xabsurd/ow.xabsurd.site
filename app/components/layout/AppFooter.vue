<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <footer class="mt-12 border-t border-slate-900/10 px-4 py-8 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
    <div class="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p>{{ t('footer.copy') }}</p>
      <p>{{ t('footer.note') }}</p>
    </div>
  </footer>
</template>
