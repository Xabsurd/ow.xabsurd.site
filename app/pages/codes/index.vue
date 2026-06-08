<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const state = reactive({
  keyword: String(route.query.keyword || ''),
  type: String(route.query.type || ''),
  difficulty: String(route.query.difficulty || ''),
  mapName: String(route.query.mapName || ''),
  hero: String(route.query.hero || ''),
  difficultyStart: String(route.query.difficultyStart || ''),
  levelMin: String(route.query.levelMin || ''),
  levelMax: String(route.query.levelMax || ''),
  timerSupported: String(route.query.timerSupported || ''),
  beginnerFriendly: String(route.query.beginnerFriendly || ''),
  tags: String(route.query.tags || ''),
  sort: String(route.query.sort || 'latest')
})
const page = ref(Number(route.query.page || 1))
let syncingFromRoute = false

function queryStringValue(value: unknown, fallback = '') {
  return Array.isArray(value) ? String(value[0] || fallback) : String(value || fallback)
}

function syncStateFromRoute() {
  syncingFromRoute = true
  state.keyword = queryStringValue(route.query.keyword)
  state.type = queryStringValue(route.query.type)
  state.difficulty = queryStringValue(route.query.difficulty)
  state.mapName = queryStringValue(route.query.mapName)
  state.hero = queryStringValue(route.query.hero)
  state.difficultyStart = queryStringValue(route.query.difficultyStart)
  state.levelMin = queryStringValue(route.query.levelMin)
  state.levelMax = queryStringValue(route.query.levelMax)
  state.timerSupported = queryStringValue(route.query.timerSupported)
  state.beginnerFriendly = queryStringValue(route.query.beginnerFriendly)
  state.tags = queryStringValue(route.query.tags)
  state.sort = queryStringValue(route.query.sort, 'latest')
  page.value = Number(route.query.page || 1)
  nextTick(() => {
    syncingFromRoute = false
  })
}

const query = computed(() => ({
  ...state,
  page: page.value,
  pageSize: 24
}))

let refreshCodes: () => Promise<unknown> = async () => undefined
useCodeQuerySync(query, () => refreshCodes())

watch(
  () => [state.keyword, state.type, state.difficulty, state.mapName, state.tags, state.sort],
  () => {
    if (syncingFromRoute) return
    page.value = 1
  }
)

watch(
  () => [state.hero, state.difficultyStart, state.levelMin, state.levelMax, state.timerSupported, state.beginnerFriendly],
  () => {
    if (syncingFromRoute) return
    page.value = 1
  }
)

watch(
  () => route.query,
  () => {
    syncStateFromRoute()
  }
)

useSeoMeta({ title: () => `${t('nav.codes')} · ${t('brand')}`, description: () => t('hero.description') })

const { data, pending, refresh } = await useFetch('/api/codes', { query, watch: false })
refreshCodes = refresh
</script>

<template>
  <div class="space-y-4">
    <UiSurface class="p-4">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-slate-800 dark:text-slate-50">{{ t('nav.codes') }}</h1>
          <p class="mt-1 text-sm text-slate-500/90 dark:text-slate-400">
            {{ data?.total || 0 }} 个工坊代码 · 当前第 {{ page }} 页
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <UiActionLink to="/codes?type=跑酷&hero=genji" variant="primary" class="h-12 px-4">{{ t('nav.genjiPk') }}</UiActionLink>
          <UiActionLink to="/upload" variant="primary" class="h-12 px-4">{{ t('nav.upload') }}</UiActionLink>
        </div>
      </div>
    </UiSurface>

    <CodeFilterPanel v-model="state" />

    <section class="min-w-0">
      <UiLoadingState v-if="pending" />
      <template v-else>
        <CodeList :items="data?.items || []" :empty-title="t('ui.empty')" />
        <CodePagination :page="page" :page-size="24" :total="data?.total || 0" @change="page = $event" />
      </template>
    </section>
  </div>
</template>
