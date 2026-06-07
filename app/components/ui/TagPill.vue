<script setup lang="ts">
import { workshopTags } from '~/utils/catalog'

const props = defineProps<{ label: string }>()
const tag = computed(() => workshopTags.find((item) => item.name === props.label))
</script>

<template>
  <span
    class="inline-flex rounded-full border px-2.5 py-1 text-xs font-medium"
    :style="tag ? { borderColor: `${tag.color}66`, backgroundColor: `${tag.color}1f`, color: tag.color } : undefined"
    :class="tag ? '' : 'border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200'"
  >
    {{ label }}
  </span>
</template>
