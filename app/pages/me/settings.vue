<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { t } = useI18n()
const toast = useToast()
const { user, refresh } = useAuth()
const statsFetch = useFetch('/api/me/stats')
const stats = statsFetch.data
const profileForm = reactive({ gameId: user.value?.gameId || '' })
const passwordForm = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' })
const savingProfile = ref(false)
const savingPassword = ref(false)

watch(
  () => user.value?.gameId,
  (gameId) => {
    profileForm.gameId = gameId || ''
  }
)

await statsFetch

async function saveProfile() {
  if (profileForm.gameId.trim() === user.value?.gameId) {
    toast.info(t('settings.noChanges'))
    return
  }
  savingProfile.value = true
  try {
    await $fetch('/api/me/settings', { method: 'PATCH', body: { gameId: profileForm.gameId } })
    await refresh()
    toast.success(t('settings.profileSaved'))
  } catch (error) {
    toast.fromError(error)
  } finally {
    savingProfile.value = false
  }
}

async function savePassword() {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    toast.error(t('settings.passwordMismatch'))
    return
  }
  savingPassword.value = true
  try {
    await $fetch('/api/me/settings', {
      method: 'PATCH',
      body: {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      }
    })
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    toast.success(t('settings.passwordSaved'))
  } catch (error) {
    toast.fromError(error)
  } finally {
    savingPassword.value = false
  }
}
</script>

<template>
  <div class="space-y-5">
    <section class="rounded-2xl border border-white/45 bg-white/40 p-5 shadow-xl shadow-slate-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
      <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 class="text-2xl font-semibold">{{ t('pages.settings') }}</h1>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ t('settings.subtitle') }}</p>
        </div>
        <NuxtLink to="/me" class="inline-flex h-10 items-center rounded-xl border border-white/45 bg-white/35 px-3 text-sm font-semibold shadow-sm backdrop-blur transition-colors hover:bg-white/55 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15">
          {{ t('settings.backToProfile') }}
        </NuxtLink>
      </div>

      <div class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-xl border border-white/45 bg-white/35 p-3 dark:border-white/10 dark:bg-white/10">
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">{{ t('auth.email') }}</span>
          <b class="mt-1 block truncate">{{ user?.email }}</b>
        </div>
        <div class="rounded-xl border border-white/45 bg-white/35 p-3 dark:border-white/10 dark:bg-white/10">
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">{{ t('settings.role') }}</span>
          <b class="mt-1 block">{{ user?.role }}</b>
        </div>
        <div class="rounded-xl border border-white/45 bg-white/35 p-3 dark:border-white/10 dark:bg-white/10">
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">{{ t('pages.myUploads') }}</span>
          <b class="mt-1 block">{{ stats?.uploads || 0 }}</b>
        </div>
        <div class="rounded-xl border border-white/45 bg-white/35 p-3 dark:border-white/10 dark:bg-white/10">
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">{{ t('pages.favorites') }}</span>
          <b class="mt-1 block">{{ stats?.favorites || 0 }}</b>
        </div>
      </div>
    </section>

    <div class="grid gap-5 lg:grid-cols-2">
      <form class="rounded-2xl border border-white/45 bg-white/40 p-5 shadow-xl shadow-slate-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/10" @submit.prevent="saveProfile">
        <h2 class="text-lg font-semibold">{{ t('settings.profileTitle') }}</h2>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ t('settings.profileHint') }}</p>
        <div class="mt-5 grid gap-4">
          <FormInput v-model="profileForm.gameId" :label="t('auth.gameId')" required maxlength="40" />
          <FormInput :model-value="user?.email || ''" :label="t('auth.email')" disabled />
          <p class="text-xs leading-5 text-slate-500 dark:text-slate-400">{{ t('settings.emailReadonly') }}</p>
          <button class="h-12 rounded-xl border border-cyan-300/40 bg-cyan-300/18 px-4 text-sm font-semibold text-cyan-950 shadow-lg shadow-cyan-500/10 backdrop-blur transition-colors hover:bg-cyan-300/28 disabled:cursor-not-allowed disabled:opacity-60 dark:text-cyan-50" :disabled="savingProfile">
            {{ t('settings.saveProfile') }}
          </button>
        </div>
      </form>

      <form class="rounded-2xl border border-white/45 bg-white/40 p-5 shadow-xl shadow-slate-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/10" @submit.prevent="savePassword">
        <h2 class="text-lg font-semibold">{{ t('settings.passwordTitle') }}</h2>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ t('settings.passwordHint') }}</p>
        <div class="mt-5 grid gap-4">
          <FormInput v-model="passwordForm.currentPassword" :label="t('settings.currentPassword')" type="password" required autocomplete="current-password" />
          <FormInput v-model="passwordForm.newPassword" :label="t('settings.newPassword')" type="password" required autocomplete="new-password" />
          <FormInput v-model="passwordForm.confirmPassword" :label="t('settings.confirmPassword')" type="password" required autocomplete="new-password" />
          <button class="h-12 rounded-xl border border-cyan-300/40 bg-cyan-300/18 px-4 text-sm font-semibold text-cyan-950 shadow-lg shadow-cyan-500/10 backdrop-blur transition-colors hover:bg-cyan-300/28 disabled:cursor-not-allowed disabled:opacity-60 dark:text-cyan-50" :disabled="savingPassword">
            {{ t('settings.savePassword') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
