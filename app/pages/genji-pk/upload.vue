<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
await navigateTo({ path: '/upload', query: { type: '跑酷', hero: 'genji' } }, { replace: true })
</script>

<template>
  <UiLoadingState />
</template>
