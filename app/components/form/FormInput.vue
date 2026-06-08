<script setup lang="ts">
defineOptions({ inheritAttrs: false })
defineProps<{ label: string; type?: string; required?: boolean }>()
const model = defineModel<string>({ default: '' })
const attrs = useAttrs()
const inputClass = controlClasses()
</script>

<template>
  <FormField :label="label" :required="required">
    <input
      v-bind="attrs"
      v-model="model"
      :type="type || 'text'"
      :required="required"
      :class="['w-full', inputClass]"
    >
  </FormField>
</template>
