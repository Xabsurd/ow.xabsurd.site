<script setup lang="ts">
import { codeTypes } from '~/utils/catalog'

definePageMeta({ middleware: 'auth' })
const { t } = useI18n()
const toast = useToast()
const router = useRouter()
const form = reactive({
  workshopCode: '',
  title: '',
  description: '',
  type: '娱乐',
  difficulty: 'Medium',
  mapName: '',
  tags: [] as string[],
  authorName: '',
  version: '',
  region: 'Global',
  playerCount: '',
  language: 'zh-CN'
})
const submitting = ref(false)
const types = codeTypes
const typeOptions = computed(() => types.map((item) => ({ value: item, label: item })))

watch(
  () => form.workshopCode,
  (value) => {
    const normalized = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)
    if (value !== normalized) form.workshopCode = normalized
  }
)

function clientError() {
  if (!form.workshopCode) return t('validation.workshopCodeRequired')
  if (form.title.trim().length < 2) return t('validation.titleTooShort')
  if (form.description.trim().length < 10) return t('validation.descriptionTooShort')
  if (!form.mapName) return t('validation.mapRequired')
  return ''
}

async function submit() {
  const error = clientError()
  if (error) {
    toast.error(error)
    return
  }
  submitting.value = true
  try {
    await $fetch('/api/codes', { method: 'POST', body: form })
    toast.success(t('pages.uploadSuccess'))
    await router.push('/me/uploads')
  } catch (err: unknown) {
    toast.fromError(err)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <UiGlassCard>
      <h1 class="text-2xl font-semibold">{{ t('nav.upload') }}</h1>
      <form class="mt-6 grid gap-4" @submit.prevent="submit">
        <FormInput v-model="form.workshopCode" :label="t('forms.workshopCode')" required />
        <FormInput v-model="form.title" :label="t('forms.title')" required />
        <FormTextarea v-model="form.description" :label="t('forms.description')" required />
        <div class="grid gap-4 sm:grid-cols-2">
          <FormSelectPicker v-model="form.type" :label="t('forms.type')" :placeholder="t('forms.type')" :options="typeOptions" />
          <FormDifficultyPicker v-model="form.difficulty" />
          <FormMapPicker v-model="form.mapName" />
          <FormInput v-model="form.authorName" :label="t('forms.authorName')" />
          <FormInput v-model="form.version" :label="t('forms.version')" />
          <FormInput v-model="form.playerCount" :label="t('forms.playerCount')" />
        </div>
        <div><span class="text-sm font-medium">{{ t('forms.tags') }}</span><FormTagInput v-model="form.tags" class="mt-1" /></div>
        <button
          class="h-12 rounded-xl border border-cyan-300/40 bg-cyan-300/18 px-5 text-sm font-semibold text-cyan-950 shadow-lg shadow-cyan-500/10 backdrop-blur-xl transition hover:bg-cyan-300/28 disabled:cursor-not-allowed disabled:opacity-60 dark:text-cyan-50"
          :disabled="submitting"
        >
          {{ t('forms.submit') }}
        </button>
      </form>
    </UiGlassCard>
  </div>
</template>
