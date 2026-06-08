<script setup lang="ts">
defineOptions({ inheritAttrs: false })
defineProps<{ label: string; type?: string; required?: boolean }>()
const model = defineModel<string>({ default: '' })
const attrs = useAttrs()
const inputClass = controlClasses()
</script>

<template>
  <label class="block">
    <span class="text-sm font-medium">{{ label }}</span>
    <input
      v-bind="attrs"
      v-model="model"
      :type="type || 'text'"
      :required="required"
      :class="['mt-1 w-full', inputClass]"
    >
  </label>
</template>
