<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <UiGlassCard>
    <h1 class="text-2xl font-semibold">Profile</h1>
    <p class="mt-2 text-sm text-slate-500">{{ route.params.id }}</p>
  </UiGlassCard>
</template>
