<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const state = reactive({
  keyword: String(route.query.keyword || ''),
  type: '',
  difficulty: String(route.query.difficulty || ''),
  mapName: String(route.query.mapName || ''),
  tags: String(route.query.tags || ''),
  sort: String(route.query.sort || 'latest')
})
const page = ref(Number(route.query.page || 1))
const query = computed(() => ({ keyword: state.keyword, difficulty: state.difficulty, mapName: state.mapName, tags: state.tags, sort: state.sort, page: page.value, pageSize: 12 }))
let refreshCodes: () => Promise<unknown> = async () => undefined
useCodeQuerySync(query, () => refreshCodes())
watch(
  () => [state.keyword, state.difficulty, state.mapName, state.tags, state.sort],
  () => {
    page.value = 1
  }
)
useSeoMeta({ title: () => `${t('nav.genjiPk')} · ${t('brand')}`, description: () => t('pages.genjiIntro') })
const { data, pending, refresh } = await useFetch('/api/genji-pk', { query, watch: false })
refreshCodes = refresh
</script>

<template>
  <div class="space-y-4">
    <div class="rounded-2xl border border-white/45 bg-white/40 p-4 shadow-xl shadow-slate-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 class="text-3xl font-semibold">{{ t('nav.genjiPk') }}</h1>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">{{ t('pages.genjiIntro') }}</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <NuxtLink to="/genji-pk/upload" class="inline-flex h-12 items-center rounded-xl border border-cyan-300/40 bg-cyan-300/18 px-5 text-sm font-semibold text-cyan-950 shadow-lg shadow-cyan-500/10 backdrop-blur-xl transition hover:bg-cyan-300/28 dark:text-cyan-50">{{ t('nav.upload') }}</NuxtLink>
        </div>
      </div>
    </div>

    <CodeFilterPanel v-model="state" :show-type="false" />

    <section>
      <UiLoadingState v-if="pending" />
      <template v-else>
        <CodeList :items="data?.items || []" :empty-title="t('ui.empty')" />
        <CodePagination :page="page" :page-size="12" :total="data?.total || 0" @change="page = $event" />
      </template>
    </section>
  </div>
</template>
