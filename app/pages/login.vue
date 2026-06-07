<script setup lang="ts">
const { t } = useI18n()
const { refresh } = useAuth()
const toast = useToast()
const route = useRoute()
const form = reactive({ emailOrGameId: '', password: '' })
const submitting = ref(false)

async function submit() {
  submitting.value = true
  try {
    await $fetch('/api/auth/login', { method: 'POST', body: form })
    await refresh()
    await navigateTo(String(route.query.redirect || '/me'))
  } catch (err: unknown) {
    toast.fromError(err)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AuthFormShell :title="t('auth.login')">
    <form class="grid gap-4" @submit.prevent="submit">
      <FormInput v-model="form.emailOrGameId" :label="t('auth.emailOrGameId')" required />
      <FormInput v-model="form.password" :label="t('auth.password')" type="password" required />
      <button
        class="rounded-xl border border-cyan-300/40 bg-cyan-300/18 px-4 py-3 text-sm font-semibold text-cyan-950 shadow-lg shadow-cyan-500/10 backdrop-blur-xl transition hover:bg-cyan-300/28 disabled:cursor-not-allowed disabled:opacity-60 dark:text-cyan-50"
        :disabled="submitting"
      >
        {{ t('auth.login') }}
      </button>
      <NuxtLink to="/register" class="text-sm text-cyan-700 dark:text-cyan-300">{{ t('auth.register') }}</NuxtLink>
    </form>
  </AuthFormShell>
</template>
