<script setup lang="ts">
import { Icon } from '@iconify/vue'

const colorMode = useColorMode()
const { t } = useI18n()
const next = computed(() => (colorMode.preference === 'dark' ? 'light' : 'dark'))
</script>

<template>
  <UiActionButton :aria-label="t('ui.theme')" @click="colorMode.preference = next">
    <Icon :icon="colorMode.preference === 'dark' ? 'lucide:moon' : 'lucide:sun'" class="h-4 w-4" />
  </UiActionButton>
</template>
