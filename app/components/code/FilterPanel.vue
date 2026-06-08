<script setup lang="ts">
import { codeTypes, localizedCodeType, parkourHeroes, workshopTags } from '~/utils/catalog'
import FormSelectPicker from '~/components/form/SelectPicker.vue'

const query = defineModel<Record<string, string>>({ default: {} })
const props = withDefaults(defineProps<{ showType?: boolean; compact?: boolean }>(), {
  showType: true,
  compact: false
})
const { locale, t } = useI18n()
const types = codeTypes
const typeOptions = computed(() => [
  { value: '', label: t('filters.allTypes') },
  ...types.map((type) => ({ value: type, label: localizedCodeType(type, locale.value) }))
])
const sortOptions = computed(() => [
  { value: 'latest', label: t('sort.latest') },
  { value: 'hot', label: t('sort.hot') },
  { value: 'favorites', label: t('sort.favorites') },
  { value: 'views', label: t('sort.views') }
])
const isParkour = computed(() => query.value.type === '跑酷')
const heroOptions = computed(() => [
  { value: '', label: t('filters.allHeroes') },
  ...parkourHeroes.map((hero) => ({ value: hero.value, label: t(`parkourHeroes.${hero.value}`) }))
])
const booleanOptions = computed(() => [
  { value: '', label: t('filters.any') },
  { value: 'true', label: t('ui.yes') },
  { value: 'false', label: t('ui.no') }
])
const mainGridClass = computed(() => [
  'grid grid-cols-2 items-end gap-3 sm:grid-cols-4',
  props.showType ? 'lg:grid-cols-[minmax(12rem,1fr)_11rem_11rem_11rem]' : 'lg:grid-cols-[minmax(12rem,1fr)_11rem_11rem]'
])
watch(isParkour, (enabled) => {
  if (enabled) return
  query.value.difficulty = ''
  query.value.hero = ''
  query.value.levelMin = ''
  query.value.levelMax = ''
  query.value.timerSupported = ''
  query.value.beginnerFriendly = ''
}, { immediate: true })
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
  query.value.hero = ''
  query.value.levelMin = ''
  query.value.levelMax = ''
  query.value.timerSupported = ''
  query.value.beginnerFriendly = ''
  query.value.tags = ''
  query.value.sort = 'latest'
}

await tagFetch
</script>

<template>
  <UiSurface as="form" class="p-4" @submit.prevent>
    <div v-if="!compact" class="mb-4 flex items-center justify-between gap-3">
      <div>
        <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-50">{{ t('filters.title') }}</h2>
        <p class="mt-1 text-xs text-slate-500/90 dark:text-slate-400">{{ t('filters.hint') }}</p>
      </div>
      <UiActionButton size="compact" class="h-9 text-xs" @click="reset">
        {{ t('ui.reset') }}
      </UiActionButton>
    </div>
    <div :class="mainGridClass">
      <div class="col-span-2 sm:col-span-4 lg:col-span-1">
        <span class="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">{{ t('filters.search') }}</span>
        <CodeSearchBox v-model="query.keyword" />
      </div>
      <FormSelectPicker v-if="showType" v-model="query.type" :label="t('forms.type')" :placeholder="t('filters.allTypes')" :options="typeOptions" />
      <FormMapPicker v-model="query.mapName" allow-empty :empty-label="t('filters.allMaps')" />
      <FormSelectPicker v-model="query.sort" :label="t('filters.sort')" :placeholder="t('sort.latest')" :options="sortOptions" />
    </div>
    <div class="mt-4">
      <span class="mb-2 block text-xs font-semibold text-slate-500 dark:text-slate-400">{{ t('forms.tags') }}</span>
      <FormTagInput v-model="tagModel" :available-tags="tags" :allow-custom="false" />
    </div>
    <div v-if="isParkour" class="mt-4 grid grid-cols-2 items-end gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <FormSelectPicker v-model="query.hero" :label="t('filters.parkourHero')" :placeholder="t('filters.allHeroes')" :options="heroOptions" />
      <FormDifficultyPicker v-model="query.difficulty" allow-empty :empty-label="t('filters.allDifficulties')" />
      <!-- <label>
        <span class="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">最少关卡</span>
        <input v-model="query.levelMin" inputmode="numeric" class="h-11 w-full rounded-xl border border-white/45 bg-white/35 px-3 text-sm shadow-sm backdrop-blur transition hover:bg-white/55 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15">
      </label>
      <label>
        <span class="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">最多关卡</span>
        <input v-model="query.levelMax" inputmode="numeric" class="h-11 w-full rounded-xl border border-white/45 bg-white/35 px-3 text-sm shadow-sm backdrop-blur transition hover:bg-white/55 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15">
      </label> -->
      <FormSelectPicker v-model="query.timerSupported" :label="t('forms.timerSupported')" :placeholder="t('filters.any')" :options="booleanOptions" />
      <FormSelectPicker v-model="query.beginnerFriendly" :label="t('forms.beginnerFriendly')" :placeholder="t('filters.any')" :options="booleanOptions" />
    </div>
  </UiSurface>
</template>
