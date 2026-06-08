<script setup lang="ts">
defineProps<{ html?: string; fallback?: string }>()
</script>

<template>
  <div v-if="html?.trim()" class="prose-safe max-w-none" v-html="html" />
  <p v-else class="text-sm leading-7 text-slate-600 dark:text-slate-300">
    {{ fallback || $t('ui.noDescription') }}
  </p>
</template>
