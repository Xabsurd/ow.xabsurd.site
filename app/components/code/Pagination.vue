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
    <button class="h-10 rounded-xl border border-white/45 bg-white/35 px-3 text-sm font-semibold shadow-sm backdrop-blur disabled:opacity-40 dark:border-white/10 dark:bg-white/10" :disabled="page <= 1" @click="emit('change', page - 1)">{{ t('ui.prev') }}</button>
    <button
      v-for="entry in visiblePages"
      :key="entry"
      class="h-10 min-w-10 rounded-xl border px-3 text-sm font-semibold shadow-sm backdrop-blur transition"
      :class="entry === page ? 'border-cyan-300/45 bg-cyan-300/18 text-cyan-950 ring-1 ring-cyan-300/30 dark:text-cyan-50' : 'border-white/45 bg-white/35 hover:bg-white/55 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15'"
      @click="emit('change', entry)"
    >
      {{ entry }}
    </button>
    <span class="px-2 text-sm text-slate-500">{{ page }} / {{ pages }}</span>
    <button class="h-10 rounded-xl border border-white/45 bg-white/35 px-3 text-sm font-semibold shadow-sm backdrop-blur disabled:opacity-40 dark:border-white/10 dark:bg-white/10" :disabled="page >= pages" @click="emit('change', page + 1)">{{ t('ui.next') }}</button>
  </div>
</template>
