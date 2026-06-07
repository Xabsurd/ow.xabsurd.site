<script setup lang="ts">
const { t } = useI18n()
useSeoMeta({
  title: () => t('brand'),
  description: () => t('hero.description'),
  ogTitle: () => t('brand'),
  ogDescription: () => t('hero.description')
})

const { data } = await useFetch('/api/codes', {
  query: { pageSize: 6, sort: 'latest' }
})

const tags = ['源氏跑酷', '训练', 'PVE', '计时', '多人', '教学']
const categories = ['娱乐', '竞技', '训练', '跑酷', 'PVE', '小游戏']
</script>

<template>
  <div class="space-y-8">
    <section class="grid gap-6 py-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
      <div>
        <p class="text-sm font-semibold uppercase tracking-wide text-cyan-600 dark:text-cyan-300">Overwatch Workshop</p>
        <h1 class="mt-4 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">{{ t('hero.title') }}</h1>
        <p class="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">{{ t('hero.description') }}</p>
        <div class="mt-6 flex flex-wrap gap-3">
          <NuxtLink to="/register" class="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-600/20 dark:bg-cyan-400 dark:text-slate-950">{{ t('auth.register') }}</NuxtLink>
          <NuxtLink to="/login" class="rounded-xl border border-slate-900/10 px-5 py-3 text-sm font-semibold dark:border-white/10">{{ t('auth.login') }}</NuxtLink>
          <NuxtLink to="/codes" class="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">{{ t('nav.codes') }}</NuxtLink>
          <NuxtLink to="/genji-pk" class="rounded-xl border border-slate-900/10 px-5 py-3 text-sm font-semibold dark:border-white/10">{{ t('nav.genjiPk') }}</NuxtLink>
        </div>
      </div>
      <UiGlassCard>
        <h2 class="text-xl font-semibold">{{ t('pages.genjiIntro') }}</h2>
        <div class="mt-5 grid grid-cols-3 gap-3 text-center">
          <div class="rounded-lg bg-white/50 p-3 dark:bg-white/5"><b>10</b><span class="block text-xs text-slate-500">code chars</span></div>
          <div class="rounded-lg bg-white/50 p-3 dark:bg-white/5"><b>2</b><span class="block text-xs text-slate-500">locales</span></div>
          <div class="rounded-lg bg-white/50 p-3 dark:bg-white/5"><b>100%</b><span class="block text-xs text-slate-500">reviewed</span></div>
        </div>
      </UiGlassCard>
    </section>

    <section>
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-2xl font-semibold">{{ t('pages.latest') }}</h2>
        <NuxtLink to="/codes" class="text-sm font-medium text-cyan-700 dark:text-cyan-300">{{ t('ui.viewAll') }}</NuxtLink>
      </div>
      <CodeList :items="data?.items || []" :empty-title="t('ui.empty')" />
    </section>

    <section class="grid gap-4 lg:grid-cols-2">
      <UiGlassCard>
        <h2 class="text-xl font-semibold">{{ t('pages.hotTags') }}</h2>
        <div class="mt-4 flex flex-wrap gap-2">
          <UiTagPill v-for="tag in tags" :key="tag" :label="tag" />
        </div>
      </UiGlassCard>
      <UiGlassCard>
        <h2 class="text-xl font-semibold">{{ t('pages.categories') }}</h2>
        <div class="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <NuxtLink v-for="cat in categories" :key="cat" :to="{ path: '/codes', query: { type: cat } }" class="rounded-lg border border-slate-900/10 px-3 py-3 text-sm font-medium dark:border-white/10">{{ cat }}</NuxtLink>
        </div>
      </UiGlassCard>
    </section>
  </div>
</template>
