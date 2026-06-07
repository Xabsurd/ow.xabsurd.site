<script setup lang="ts">
import { codeTypes, workshopTags } from '~/utils/catalog'
import FormSelectPicker from '~/components/form/SelectPicker.vue'

const query = defineModel<Record<string, string>>({ default: {} })
withDefaults(defineProps<{ showType?: boolean; compact?: boolean }>(), {
  showType: true,
  compact: false
})
const { t } = useI18n()
const types = codeTypes
const typeOptions = computed(() => [
  { value: '', label: t('filters.allTypes') },
  ...types.map((type) => ({ value: type, label: type }))
])
const sortOptions = computed(() => [
  { value: 'latest', label: t('sort.latest') },
  { value: 'hot', label: t('sort.hot') },
  { value: 'favorites', label: t('sort.favorites') },
  { value: 'views', label: t('sort.views') }
])
const tagFetch = useFetch('/api/tags')
const tagData = tagFetch.data
const tagColor = new Map(workshopTags.map((tag) => [tag.name, tag.color]))
const tags = computed(() => {
  const dbTags = tagData.value?.tags || []
  const merged = new Map<string, { name: string; color: string; count: number }>()
  for (const tag of dbTags) {
    merged.set(tag.name, {
      name: tag.name,
      color: tagColor.get(tag.name) || '#06b6d4',
      count: tag._count.codes
    })
  }
  for (const tag of workshopTags) {
    if (!merged.has(tag.name)) merged.set(tag.name, { name: tag.name, color: tag.color, count: 0 })
  }
  return [...merged.values()]
})
const tagModel = computed({
  get: () => (query.value.tags || '').split(',').filter(Boolean),
  set: (value: string[]) => {
    query.value.tags = value.join(',')
  }
})

function reset() {
  query.value.keyword = ''
  query.value.type = ''
  query.value.difficulty = ''
  query.value.mapName = ''
  query.value.tags = ''
  query.value.sort = 'latest'
}

await tagFetch
</script>

<template>
  <form class="rounded-2xl border border-white/45 bg-white/40 p-4 shadow-xl shadow-slate-950/5 backdrop-blur-md dark:border-white/10 dark:bg-white/10" @submit.prevent>
    <div v-if="!compact" class="mb-4 flex items-center justify-between gap-3">
      <div>
        <h2 class="text-lg font-semibold">{{ t('filters.title') }}</h2>
        <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">{{ t('filters.hint') }}</p>
      </div>
      <button type="button" class="h-9 rounded-xl border border-white/45 bg-white/35 px-3 text-xs font-semibold shadow-sm backdrop-blur transition hover:bg-white/55 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15" @click="reset">
        {{ t('ui.reset') }}
      </button>
    </div>
    <div class="grid grid-cols-2 items-end gap-3 sm:grid-cols-4 lg:grid-cols-[minmax(12rem,1fr)_11rem_11rem_11rem_11rem]">
      <div class="col-span-2 sm:col-span-4 lg:col-span-1">
        <span class="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">{{ t('filters.search') }}</span>
        <CodeSearchBox v-model="query.keyword" />
      </div>
      <FormSelectPicker v-if="showType" v-model="query.type" :label="t('forms.type')" :placeholder="t('filters.allTypes')" :options="typeOptions" />
      <FormDifficultyPicker v-model="query.difficulty" allow-empty :empty-label="t('filters.allDifficulties')" />
      <FormMapPicker v-model="query.mapName" allow-empty :empty-label="t('filters.allMaps')" />
      <FormSelectPicker v-model="query.sort" :label="t('filters.sort')" :placeholder="t('sort.latest')" :options="sortOptions" />
    </div>
    <div class="mt-4">
      <span class="mb-2 block text-xs font-semibold text-slate-500 dark:text-slate-400">{{ t('forms.tags') }}</span>
      <FormTagInput v-model="tagModel" :available-tags="tags" :allow-custom="false" />
    </div>
  </form>
</template>
