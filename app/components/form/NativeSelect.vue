<script setup lang="ts">
import { Icon } from '@iconify/vue'

type Option = {
  value: string
  label: string
}

defineProps<{
  label: string
  options: Option[]
}>()
const model = defineModel<string>({ default: '' })
const selectClass = controlClasses({ select: true })
</script>

<template>
  <label class="block">
    <span class="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">{{ label }}</span>
    <span class="relative block">
      <select
        v-model="model"
        :class="['w-full', selectClass]"
      >
        <option v-for="item in options" :key="item.value" :value="item.value">
          {{ item.label }}
        </option>
      </select>
      <Icon icon="lucide:chevron-down" class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-300" />
    </span>
  </label>
</template>
