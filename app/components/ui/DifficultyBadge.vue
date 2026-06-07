<script setup lang="ts">
import { difficultyOptions } from '~/utils/catalog'

const props = defineProps<{ value: string }>()
const option = computed(() => difficultyOptions.find((item) => item.value === props.value))
</script>

<template>
  <span
    class="inline-flex rounded-md border px-2 py-1 text-xs font-semibold"
    :style="option ? { borderColor: `${option.color}66`, backgroundColor: `${option.color}1f`, color: option.color } : undefined"
    :class="option ? '' : 'border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-200'"
  >
    {{ option ? `${option.label} · ${option.subtitle}` : value }}
  </span>
</template>
