<script setup lang="ts">
const { t } = useI18n()
const { refresh } = useAuth()
const toast = useToast()
const form = reactive({ email: '', gameId: '', password: '', emailCode: '', captchaAnswer: '' })
const captcha = reactive({ question: '', loading: false })
const sendingCode = ref(false)
const submitting = ref(false)
const codeCooldown = ref(0)
let codeCooldownTimer: ReturnType<typeof setInterval> | undefined

const codeButtonDisabled = computed(() => sendingCode.value || codeCooldown.value > 0 || !form.email || !form.captchaAnswer)
const codeButtonText = computed(() => {
  if (sendingCode.value) return t('auth.sendingCode')
  if (codeCooldown.value > 0) return t('auth.codeCooldown', { seconds: codeCooldown.value })
  return t('auth.sendCode')
})

function startCodeCooldown(seconds = 60) {
  codeCooldown.value = seconds
  if (codeCooldownTimer) clearInterval(codeCooldownTimer)
  codeCooldownTimer = setInterval(() => {
    codeCooldown.value = Math.max(0, codeCooldown.value - 1)
    if (codeCooldown.value === 0 && codeCooldownTimer) {
      clearInterval(codeCooldownTimer)
      codeCooldownTimer = undefined
    }
  }, 1000)
}

async function refreshCaptcha() {
  captcha.loading = true
  try {
    const data = await $fetch<{ question: string }>('/api/auth/captcha')
    captcha.question = data.question
    form.captchaAnswer = ''
  } finally {
    captcha.loading = false
  }
}

async function sendCode() {
  sendingCode.value = true
  try {
    await $fetch('/api/auth/send-register-code', {
      method: 'POST',
      body: { email: form.email, captchaAnswer: form.captchaAnswer }
    })
    toast.success(t('auth.codeSent'))
    startCodeCooldown()
  } catch (err: unknown) {
    toast.fromError(err)
    if ((err as { data?: { data?: { code?: string } } })?.data?.data?.code === 'EMAIL_COOLDOWN') {
      startCodeCooldown()
    }
    await refreshCaptcha()
  } finally {
    sendingCode.value = false
  }
}

async function submit() {
  submitting.value = true
  try {
    await $fetch('/api/auth/register', { method: 'POST', body: form })
    await refresh()
    await navigateTo('/me')
  } catch (err: unknown) {
    toast.fromError(err)
  } finally {
    submitting.value = false
  }
}

onMounted(refreshCaptcha)
onUnmounted(() => {
  if (codeCooldownTimer) clearInterval(codeCooldownTimer)
})
</script>

<template>
  <AuthFormShell :title="t('auth.register')">
    <form class="grid gap-4" @submit.prevent="submit">
      <FormInput v-model="form.email" :label="t('auth.email')" type="email" required />
      <div class="rounded-2xl border border-white/50 bg-white/35 p-3 shadow-xl shadow-slate-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
        <div class="grid grid-cols-[minmax(0,1fr)_3rem] items-end gap-3 sm:grid-cols-[1fr_112px_3rem]">
          <div class="col-span-2 sm:col-span-1">
            <div class="mb-1 flex items-center justify-between gap-3">
              <span class="text-sm font-medium">{{ t('auth.humanCheck') }}</span>
              <button
                type="button"
                class="rounded-lg border border-white/40 bg-white/30 px-2 py-1 text-xs font-medium text-sky-800 shadow-sm backdrop-blur transition hover:bg-white/60 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/10 dark:text-sky-200 dark:hover:bg-white/15"
                :disabled="captcha.loading"
                @click="refreshCaptcha"
              >
                {{ t('auth.refreshCaptcha') }}
              </button>
            </div>
            <div class="flex h-12 items-center rounded-xl border border-white/50 bg-white/50 px-3 text-sm font-semibold tracking-wide text-slate-900 shadow-inner shadow-white/40 backdrop-blur dark:border-white/10 dark:bg-slate-950/30 dark:text-white dark:shadow-none">
              {{ captcha.question || t('auth.loadingCaptcha') }}
            </div>
          </div>
          <FormInput v-model="form.captchaAnswer" :label="t('auth.captchaAnswer')" inputmode="numeric" required />
          <button
            type="button"
            class="h-12 w-12 rounded-xl border border-white/50 bg-white/35 text-sm font-semibold text-slate-700 shadow-lg shadow-slate-950/5 backdrop-blur transition hover:bg-white/60 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15 dark:hover:text-sky-300"
            :disabled="captcha.loading"
            @click="refreshCaptcha"
          >
            ↻
          </button>
        </div>
      </div>
      <button
        type="button"
        class="h-12 rounded-xl border border-cyan-300/50 bg-cyan-500/25 px-4 text-sm font-semibold text-cyan-950 shadow-xl shadow-cyan-700/10 backdrop-blur-xl transition hover:border-cyan-300/70 hover:bg-cyan-400/35 disabled:cursor-not-allowed disabled:border-slate-300/40 disabled:bg-slate-300/20 disabled:text-slate-500 disabled:shadow-none dark:border-cyan-200/20 dark:bg-cyan-300/15 dark:text-cyan-50 dark:hover:bg-cyan-300/25 dark:disabled:border-white/10 dark:disabled:bg-white/5 dark:disabled:text-slate-500"
        :disabled="codeButtonDisabled"
        @click="sendCode"
      >
        {{ codeButtonText }}
      </button>
      <FormInput v-model="form.emailCode" :label="t('auth.emailCode')" required />
      <FormInput v-model="form.gameId" :label="t('auth.gameId')" required />
      <FormInput v-model="form.password" :label="t('auth.password')" type="password" required />
      <button
        class="h-12 rounded-xl border border-cyan-300/40 bg-cyan-300/18 px-4 text-sm font-semibold text-cyan-950 shadow-lg shadow-cyan-500/10 backdrop-blur-xl transition hover:bg-cyan-300/28 disabled:cursor-not-allowed disabled:opacity-60 dark:text-cyan-50"
        :disabled="submitting"
      >
        {{ t('auth.register') }}
      </button>
    </form>
  </AuthFormShell>
</template>
