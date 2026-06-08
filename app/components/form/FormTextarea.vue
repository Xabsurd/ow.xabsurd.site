<script setup lang="ts">
defineProps<{ label: string; required?: boolean; rows?: number }>()
const model = defineModel<string>({ default: '' })
const textareaClass = controlClasses({ multiline: true })
</script>

<template>
  <FormField :label="label" :required="required">
    <textarea v-model="model" :required="required" :rows="rows || 6" :class="textareaClass" />
  </FormField>
</template>
