<script setup lang="ts">
defineOptions({ inheritAttrs: false })
defineProps<{ label: string; type?: string; required?: boolean }>()
const model = defineModel<string>({ default: '' })
const attrs = useAttrs()
</script>

<template>
  <label class="block">
    <span class="text-sm font-medium">{{ label }}</span>
    <input
      v-bind="attrs"
      v-model="model"
      :type="type || 'text'"
      :required="required"
      class="focus-ring mt-1 h-12 w-full rounded-xl border border-white/45 bg-white/35 px-3 text-sm shadow-lg shadow-slate-950/5 backdrop-blur-xl transition hover:bg-white/55 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15"
    >
  </label>
</template>
