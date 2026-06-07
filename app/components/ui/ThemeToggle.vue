<script setup lang="ts">
import { Icon } from '@iconify/vue'

const colorMode = useColorMode()
const { t } = useI18n()
const next = computed(() => (colorMode.preference === 'dark' ? 'light' : 'dark'))
</script>

<template>
  <button class="focus-ring h-10 rounded-xl border border-white/45 bg-white/35 px-3 text-sm font-semibold shadow-sm backdrop-blur transition hover:bg-white/55 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15" :aria-label="t('ui.theme')" @click="colorMode.preference = next">
    <Icon :icon="colorMode.preference === 'dark' ? 'lucide:moon' : 'lucide:sun'" class="h-4 w-4" />
  </button>
</template>
