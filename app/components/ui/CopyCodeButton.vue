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
  <UiActionButton variant="primary" class="h-10 px-3" @click="copy">
    {{ copied ? t('ui.copied') : t('ui.copyCode') }}
  </UiActionButton>
</template>
