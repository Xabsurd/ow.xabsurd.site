<script setup lang="ts">
defineProps<{ html: string }>()
</script>

<template>
  <div class="prose-safe max-w-none" v-html="html" />
</template>
