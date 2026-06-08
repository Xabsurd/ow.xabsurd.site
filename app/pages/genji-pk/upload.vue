<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { t } = useI18n()
const toast = useToast()
const router = useRouter()
const form = reactive({
  workshopCode: '',
  title: '',
  authorName: '',
  levelCount: 1,
  description: '',
  difficulty: 'Medium',
  tags: ['源氏跑酷'] as string[],
  timerSupported: false,
  beginnerFriendly: false,
  averageClearTime: '',
  mapName: '',
  notes: ''
})
const submitting = ref(false)
const levelInputClass = controlClasses()

watch(
  () => form.workshopCode,
  (value) => {
    const normalized = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)
    if (value !== normalized) form.workshopCode = normalized
  }
)

function clientError() {
  if (!form.workshopCode) return t('validation.workshopCodeRequired')
  if (!form.authorName.trim()) return t('validation.authorRequired')
  if (!form.levelCount || form.levelCount < 1) return t('validation.levelCountRequired')
  if (!form.tags.length) return t('validation.tagsRequired')
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
    await $fetch('/api/genji-pk', { method: 'POST', body: form })
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
      <h1 class="text-2xl font-semibold">{{ t('nav.genjiPk') }} · {{ t('nav.upload') }}</h1>
      <form class="mt-6 grid gap-4" @submit.prevent="submit">
        <div class="grid gap-4 sm:grid-cols-2">
          <FormInput v-model="form.workshopCode" :label="t('forms.workshopCode')" required />
          <FormInput v-model="form.title" :label="t('forms.title')" />
          <FormInput v-model="form.authorName" :label="t('forms.authorName')" required />
          <FormMapPicker v-model="form.mapName" />
          <label>
            <span class="text-sm font-medium">{{ t('forms.levelCount') }}</span>
            <input v-model.number="form.levelCount" type="number" min="1" :class="['mt-1 w-full', levelInputClass]" >
          </label>
          <FormDifficultyPicker v-model="form.difficulty" />
        </div>
        <FormTextarea v-model="form.description" :label="t('forms.description')" />
        <div><span class="text-sm font-medium">{{ t('forms.tags') }}</span><FormTagInput v-model="form.tags" class="mt-1" /></div>
        <div class="flex flex-wrap gap-4 text-sm">
          <label><input v-model="form.timerSupported" type="checkbox" class="mr-2" >{{ t('forms.timerSupported') }}</label>
          <label><input v-model="form.beginnerFriendly" type="checkbox" class="mr-2" >{{ t('forms.beginnerFriendly') }}</label>
        </div>
        <FormInput v-model="form.averageClearTime" :label="t('forms.averageClearTime')" />
        <FormTextarea v-model="form.notes" :label="t('forms.notes')" :rows="3" />
        <UiActionButton type="submit" variant="primary" class="h-12 px-5" :disabled="submitting">
          {{ t('forms.submit') }}
        </UiActionButton>
      </form>
    </UiGlassCard>
  </div>
</template>
