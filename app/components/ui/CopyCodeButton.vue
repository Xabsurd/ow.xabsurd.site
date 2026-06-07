<script setup lang="ts">
const props = defineProps<{ code: string }>()
const { t } = useI18n()
const copied = ref(false)

async function copy() {
  await navigator.clipboard.writeText(props.code)
  copied.value = true
  window.setTimeout(() => (copied.value = false), 1600)
}
</script>

<template>
  <button class="focus-ring rounded-lg border border-cyan-300/40 bg-cyan-300/18 px-3 py-2 text-sm font-semibold text-cyan-950 shadow-lg shadow-cyan-500/10 backdrop-blur transition hover:bg-cyan-300/28 dark:text-cyan-50" @click="copy">
    {{ copied ? t('ui.copied') : t('ui.copyCode') }}
  </button>
</template>
