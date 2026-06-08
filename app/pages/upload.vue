<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { t } = useI18n()
const toast = useToast()
const router = useRouter()
const route = useRoute()
const submitting = ref(false)

type CodeFormValue = {
  workshopCode: string
  title: string
  description: string
  type: string
  difficulty: string
  mapName: string
  tags: string[]
  authorName: string
  version: string
  region: string
  playerCount: string
  language: string
  parkour: {
    hero: string
    levelCount: number
    difficultyStart: string
    timerSupported: boolean
    beginnerFriendly: boolean
    averageClearTime: string
    notes: string
  }
}

function clientError(form: CodeFormValue) {
  if (!form.workshopCode) return t('validation.workshopCodeRequired')
  if (form.title.trim().length < 2) return t('validation.titleTooShort')
  if (form.description.trim().length < 10) return t('validation.descriptionTooShort')
  if (!form.mapName) return t('validation.mapRequired')
  if (form.type === '跑酷' && (!form.parkour.levelCount || form.parkour.levelCount < 1)) return t('validation.levelCountRequired')
  return ''
}

async function submit(form: CodeFormValue) {
  const error = clientError(form)
  if (error) {
    toast.error(error)
    return
  }
  submitting.value = true
  try {
    const body = form.type === '跑酷' ? form : { ...form, parkour: undefined }
    await $fetch('/api/codes', { method: 'POST', body })
    toast.success(t('pages.uploadSuccess'))
    await router.push('/me/uploads')
  } catch (err: unknown) {
    toast.fromError(err)
  } finally {
    submitting.value = false
  }
}

const initial = computed(() => {
  const type = String(route.query.type || '')
  const hero = String(route.query.hero || '')
  return {
    ...(type ? { type } : {}),
    ...(hero === 'genji' ? { tags: ['源氏跑酷'] } : {}),
    ...(hero ? { parkour: { hero } } : {})
  }
})
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <UiGlassCard>
      <h1 class="text-2xl font-semibold">{{ t('nav.upload') }}</h1>
      <CodeForm class="mt-6" :initial="initial" :submit-label="t('forms.submit')" :busy="submitting" @submit="submit" />
    </UiGlassCard>
  </div>
</template>
