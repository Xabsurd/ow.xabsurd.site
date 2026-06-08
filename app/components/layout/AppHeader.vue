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
  // { to: '/', label: 'nav.home' },
  { to: '/codes', label: 'nav.codes' },
  // { to: '/codes?type=跑酷&hero=genji', label: 'nav.genjiPk' }
]

const mobileNav = [
  ...desktopNav,
  { to: '/upload', label: 'nav.upload' }
]

function isActive(to: string) {
  if (to.includes('?')) return route.fullPath === to
  const path = to.split('?')[0]
  if (to === '/') return route.path === '/'
  return route.path === path || route.path.startsWith(`${path}/`)
}
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-white/45 bg-white/72 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/72">
    <div class="mx-auto flex max-w-7xl items-center gap-1.5 px-3 py-3 min-[375px]:gap-2 min-[375px]:px-4 sm:gap-3 sm:px-6 lg:px-8">
      <NuxtLink to="/" class="mr-1 flex min-w-0 items-center gap-2 font-semibold sm:mr-2">
        <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-cyan-500/35 bg-cyan-500/10 text-sm text-cyan-950 backdrop-blur dark:border-cyan-300/25 dark:bg-cyan-300/10 dark:text-cyan-50">OW</span>
        <span class="max-w-20 truncate min-[480px]:max-w-32 sm:max-w-none">{{ t('brand') }}</span>
      </NuxtLink>
      <nav class="hidden flex-1 items-center gap-1 md:flex">
        <UiActionLink
          v-for="item in desktopNav"
          :key="item.to"
          :to="item.to"
          :active="isActive(item.to)"
        >
          {{ t(item.label) }}
        </UiActionLink>
      </nav>
      <div class="ml-auto flex min-w-0 items-center gap-1.5 sm:gap-2">
        <UiLocaleSwitcher class="shrink-0" />
        <UiThemeToggle />
        <span v-if="!loaded" class="hidden h-10 w-28 rounded-xl border border-white/45 bg-white/35 backdrop-blur dark:border-white/10 dark:bg-white/10 sm:block" aria-hidden="true" />
        <UiActionLink v-if="isMember" to="/upload" variant="primary" class="hidden lg:inline-flex">{{ t('nav.upload') }}</UiActionLink>
        <UiActionLink v-if="isGuest" to="/login" class="hidden md:inline-flex">{{ t('auth.login') }}</UiActionLink>
        <UiActionLink v-if="isGuest" to="/register" variant="primary" class="hidden md:inline-flex">{{ t('auth.register') }}</UiActionLink>
        <UiActionLink v-if="canAdmin" to="/admin" variant="primary" class="hidden md:inline-flex">{{ t('nav.admin') }}</UiActionLink>
        <UiActionLink v-if="isMember" to="/me" class="hidden md:inline-flex">{{ user?.gameId }}</UiActionLink>
        <UiActionButton v-if="isMember" class="shrink-0" @click="logout">{{ t('auth.logout') }}</UiActionButton>
      </div>
    </div>
    <nav class="mx-auto flex max-w-7xl flex-nowrap gap-2 overflow-hidden px-3 pb-3 text-[13px] min-[375px]:px-4 sm:text-sm md:hidden">
      <UiActionLink
        v-for="item in mobileNav"
        :key="item.to"
        :to="item.to"
        size="compact"
        class="shrink-0"
        :active="isActive(item.to)"
      >
        {{ t(item.label) }}
      </UiActionLink>
      <UiActionLink v-if="canAdmin" to="/admin" size="compact" class="shrink-0">
        {{ t('nav.admin') }}
      </UiActionLink>
      <UiActionLink v-if="isMember" to="/me" size="compact" class="max-w-[9rem] shrink truncate min-[375px]:max-w-[12rem]">
        {{ user?.gameId }}
      </UiActionLink>
      <UiActionLink v-if="isGuest" to="/login" size="compact" class="shrink-0">
        {{ t('auth.login') }}
      </UiActionLink>
      <UiActionLink v-if="isGuest" to="/register" variant="primary" size="compact" class="shrink-0">
        {{ t('auth.register') }}
      </UiActionLink>
    </nav>
  </header>
</template>
