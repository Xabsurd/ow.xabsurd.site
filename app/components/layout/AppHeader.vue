<script setup lang="ts">
const { t } = useI18n()
const { user, loaded, refresh, logout } = useAuth()
const route = useRoute()
const canAdmin = computed(() => Boolean(user.value && ['ADMIN', 'MODERATOR'].includes(user.value.role)))
const isGuest = computed(() => loaded.value && !user.value)
const isMember = computed(() => loaded.value && user.value)

onMounted(() => {
  refresh().catch(() => undefined)
})

if (!loaded.value) await refresh().catch(() => undefined)

const desktopNav = [
  { to: '/', label: 'nav.home' },
  { to: '/codes', label: 'nav.codes' },
  { to: '/genji-pk', label: 'nav.genjiPk' }
]

const mobileNav = [
  ...desktopNav,
  { to: '/upload', label: 'nav.upload' }
]

function isActive(to: string) {
  if (to === '/') return route.path === '/'
  return route.path === to || route.path.startsWith(`${to}/`)
}
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-white/45 bg-white/72 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/72">
    <div class="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
      <NuxtLink to="/" class="mr-2 flex items-center gap-2 font-semibold">
        <span class="grid h-10 w-10 place-items-center rounded-xl border border-cyan-500/35 bg-cyan-500/10 text-sm text-cyan-950 backdrop-blur dark:border-cyan-300/25 dark:bg-cyan-300/10 dark:text-cyan-50">OW</span>
        <span class="max-w-32 truncate sm:max-w-none">{{ t('brand') }}</span>
      </NuxtLink>
      <nav class="hidden flex-1 items-center gap-1 md:flex">
        <NuxtLink
          v-for="item in desktopNav"
          :key="item.to"
          :to="item.to"
          class="rounded-xl border px-3 py-2 text-sm font-medium backdrop-blur transition-colors duration-100"
          :class="isActive(item.to) ? 'border-cyan-500/45 bg-cyan-500/10 text-cyan-950 dark:border-cyan-300/30 dark:bg-cyan-300/10 dark:text-cyan-50' : 'border-transparent text-slate-600 hover:border-slate-900/10 hover:bg-slate-900/5 dark:text-slate-300 dark:hover:border-white/10 dark:hover:bg-white/8'"
        >
          {{ t(item.label) }}
        </NuxtLink>
      </nav>
      <div class="ml-auto flex items-center gap-2">
        <UiLocaleSwitcher class="hidden sm:block" />
        <UiThemeToggle />
        <span v-if="!loaded" class="hidden h-10 w-28 rounded-xl border border-white/45 bg-white/35 backdrop-blur dark:border-white/10 dark:bg-white/10 sm:block" aria-hidden="true" />
        <NuxtLink v-if="isMember" to="/upload" class="hidden h-10 items-center rounded-xl border border-cyan-500/35 bg-cyan-500/10 px-3 text-sm font-semibold text-cyan-950 backdrop-blur transition-colors duration-100 hover:bg-cyan-500/15 dark:border-cyan-300/25 dark:bg-cyan-300/10 dark:text-cyan-50 dark:hover:bg-cyan-300/15 lg:inline-flex">{{ t('nav.upload') }}</NuxtLink>
        <NuxtLink v-if="isGuest" to="/login" class="hidden h-10 items-center rounded-xl border border-white/45 bg-white/35 px-3 text-sm font-medium backdrop-blur transition-colors duration-100 hover:bg-white/55 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15 sm:inline-flex">{{ t('auth.login') }}</NuxtLink>
        <NuxtLink v-if="isGuest" to="/register" class="inline-flex h-10 items-center rounded-xl border border-cyan-500/35 bg-cyan-500/10 px-3 text-sm font-semibold text-cyan-950 backdrop-blur transition-colors duration-100 hover:bg-cyan-500/15 dark:border-cyan-300/25 dark:bg-cyan-300/10 dark:text-cyan-50 dark:hover:bg-cyan-300/15">{{ t('auth.register') }}</NuxtLink>
        <NuxtLink v-if="canAdmin" to="/admin" class="inline-flex h-10 items-center rounded-xl border border-cyan-500/35 bg-cyan-500/10 px-3 text-sm font-semibold text-cyan-950 backdrop-blur transition-colors duration-100 hover:bg-cyan-500/15 dark:border-cyan-300/25 dark:bg-cyan-300/10 dark:text-cyan-50 dark:hover:bg-cyan-300/15">{{ t('nav.admin') }}</NuxtLink>
        <NuxtLink v-if="isMember" to="/me" class="hidden h-10 items-center rounded-xl border border-white/45 bg-white/35 px-3 text-sm font-medium backdrop-blur transition-colors duration-100 hover:bg-white/55 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15 sm:inline-flex">{{ user?.gameId }}</NuxtLink>
        <button v-if="isMember" class="h-10 rounded-xl border border-white/45 bg-white/35 px-3 text-sm font-medium backdrop-blur transition-colors duration-100 hover:bg-white/55 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15" @click="logout">{{ t('auth.logout') }}</button>
      </div>
    </div>
    <nav class="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-3 text-sm md:hidden">
      <NuxtLink
        v-for="item in mobileNav"
        :key="item.to"
        :to="item.to"
        class="shrink-0 rounded-xl border px-3 py-2 font-medium backdrop-blur transition-colors duration-100"
        :class="isActive(item.to) ? 'border-cyan-500/45 bg-cyan-500/10 text-cyan-950 dark:border-cyan-300/30 dark:bg-cyan-300/10 dark:text-cyan-50' : 'border-slate-900/10 bg-slate-900/5 text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-slate-200'"
      >
        {{ t(item.label) }}
      </NuxtLink>
      <NuxtLink v-if="canAdmin" to="/admin" class="shrink-0 rounded-xl border border-white/45 bg-white/35 px-3 py-2 font-medium text-slate-700 backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
        {{ t('nav.admin') }}
      </NuxtLink>
      <NuxtLink v-if="isMember" to="/me" class="shrink-0 rounded-xl border border-white/45 bg-white/35 px-3 py-2 font-medium text-slate-700 backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
        {{ user?.gameId }}
      </NuxtLink>
      <NuxtLink v-if="isGuest" to="/login" class="shrink-0 rounded-xl border border-white/45 bg-white/35 px-3 py-2 font-medium text-slate-700 backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
        {{ t('auth.login') }}
      </NuxtLink>
    </nav>
  </header>
</template>
