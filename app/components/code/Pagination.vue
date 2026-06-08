<script setup lang="ts">
const props = defineProps<{ page: number; pageSize: number; total: number }>()
const emit = defineEmits<{ change: [page: number] }>()
const { t } = useI18n()
const pages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const visiblePages = computed(() => {
  const total = pages.value
  const start = Math.max(1, Math.min(props.page - 2, total - 4))
  const end = Math.min(total, start + 4)
  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
})
</script>

<template>
  <div v-if="pages > 1" class="mt-6 flex flex-wrap items-center justify-center gap-2">
    <UiActionButton :disabled="page <= 1" @click="emit('change', page - 1)">
      {{ t('ui.prev') }}
    </UiActionButton>
    <UiActionButton
      v-for="entry in visiblePages"
      :key="entry"
      class="min-w-10"
      :active="entry === page"
      @click="emit('change', entry)"
    >
      {{ entry }}
    </UiActionButton>
    <span class="px-2 text-sm text-slate-500">{{ page }} / {{ pages }}</span>
    <UiActionButton :disabled="page >= pages" @click="emit('change', page + 1)">
      {{ t('ui.next') }}
    </UiActionButton>
  </div>
</template>
