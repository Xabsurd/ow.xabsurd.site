<script setup lang="ts">
defineProps<{ label: string; required?: boolean; rows?: number }>()
const model = defineModel<string>({ default: '' })
const textareaClass = controlClasses({ multiline: true })
</script>

<template>
  <label class="block">
    <span class="text-sm font-medium">{{ label }}</span>
    <textarea v-model="model" :required="required" :rows="rows || 6" :class="['mt-1', textareaClass]" />
  </label>
</template>
