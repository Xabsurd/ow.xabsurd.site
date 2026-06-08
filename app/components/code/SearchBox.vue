<script setup lang="ts">
const model = defineModel<string>({ default: '' })
const { t } = useI18n()
const inputClass = controlClasses()
</script>

<template>
  <label class="block">
    <span class="sr-only">{{ t('filters.search') }}</span>
    <input v-model="model" :class="['w-full', inputClass]" :placeholder="t('filters.searchPlaceholder')" >
  </label>
</template>
