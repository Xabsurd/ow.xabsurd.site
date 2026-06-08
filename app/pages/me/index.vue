<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { t } = useI18n()
const { user } = useAuth()
const statsFetch = useFetch('/api/me/stats')
const data = statsFetch.data

const actions = computed(() => [
  { to: '/upload', title: t('profile.uploadCode'), description: t('profile.uploadCodeHint') },
  { to: '/upload?type=跑酷&hero=genji', title: t('profile.uploadGenji'), description: t('profile.uploadGenjiHint') },
  { to: '/me/uploads', title: t('pages.myUploads'), description: t('profile.uploadsHint') },
  { to: '/me/favorites', title: t('pages.favorites'), description: t('profile.favoritesHint') }
])

await statsFetch
</script>

<template>
  <div class="space-y-4">
    <div class="rounded-2xl border border-white/45 bg-white/40 p-4 shadow-xl shadow-slate-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-2xl font-semibold">{{ user?.gameId }}</h1>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ user?.email }} · {{ user?.role }}</p>
        </div>
        <NuxtLink to="/me/settings" class="rounded-xl border border-slate-900/10 px-4 py-2 text-sm font-semibold hover:bg-slate-900/5 dark:border-white/10 dark:hover:bg-white/10">{{ t('pages.settings') }}</NuxtLink>
      </div>
      <div class="mt-4 grid gap-2 sm:grid-cols-4">
        <div class="rounded-xl bg-white/45 p-3 dark:bg-white/5"><b class="text-xl">{{ data?.uploads || 0 }}</b><span class="block text-xs text-slate-500">{{ t('pages.myUploads') }}</span></div>
        <div class="rounded-xl bg-white/45 p-3 dark:bg-white/5"><b class="text-xl">{{ data?.approved || 0 }}</b><span class="block text-xs text-slate-500">{{ t('profile.approved') }}</span></div>
        <div class="rounded-xl bg-white/45 p-3 dark:bg-white/5"><b class="text-xl">{{ data?.pending || 0 }}</b><span class="block text-xs text-slate-500">{{ t('profile.pending') }}</span></div>
        <div class="rounded-xl bg-white/45 p-3 dark:bg-white/5"><b class="text-xl">{{ data?.favorites || 0 }}</b><span class="block text-xs text-slate-500">{{ t('pages.favorites') }}</span></div>
      </div>
    </div>

    <div class="grid gap-3 md:grid-cols-2">
      <NuxtLink
        v-for="action in actions"
        :key="action.to"
        :to="action.to"
        class="rounded-xl border border-white/45 bg-white/35 p-4 shadow-lg shadow-slate-950/5 backdrop-blur-xl transition-colors duration-150 hover:bg-white/55 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15"
      >
        <span class="block font-semibold">{{ action.title }}</span>
        <span class="mt-1 block text-sm text-slate-500 dark:text-slate-400">{{ action.description }}</span>
      </NuxtLink>
    </div>
  </div>
</template>
