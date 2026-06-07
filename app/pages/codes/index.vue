<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const state = reactive({
  keyword: String(route.query.keyword || ''),
  type: String(route.query.type || ''),
  difficulty: String(route.query.difficulty || ''),
  mapName: String(route.query.mapName || ''),
  tags: String(route.query.tags || ''),
  sort: String(route.query.sort || 'latest')
})
const page = ref(Number(route.query.page || 1))

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
    page.value = 1
  }
)

useSeoMeta({ title: () => `${t('nav.codes')} · ${t('brand')}`, description: () => t('hero.description') })

const { data, pending, refresh } = await useFetch('/api/codes', { query, watch: false })
refreshCodes = refresh
</script>

<template>
  <div class="space-y-4">
    <div class="rounded-2xl border border-white/45 bg-white/40 p-4 shadow-xl shadow-slate-950/5 backdrop-blur-md dark:border-white/10 dark:bg-white/10">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 class="text-2xl font-semibold">{{ t('nav.codes') }}</h1>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {{ data?.total || 0 }} 个工坊代码 · 当前第 {{ page }} 页
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <NuxtLink to="/upload" class="inline-flex h-12 items-center rounded-xl border border-cyan-300/40 bg-cyan-300/18 px-4 text-sm font-semibold text-cyan-950 shadow-lg shadow-cyan-500/10 backdrop-blur-xl transition hover:bg-cyan-300/28 dark:text-cyan-50">{{ t('nav.upload') }}</NuxtLink>
        </div>
      </div>
    </div>

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
