<script setup lang="ts">
import { codeTypes, parkourHeroes } from '~/utils/catalog'

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
  language: 'zh-CN',
  parkour: {
    hero: 'genji',
    levelCount: 1,
    difficultyStart: '',
    timerSupported: false,
    beginnerFriendly: false,
    averageClearTime: '',
    notes: ''
  }
})
const submitting = ref(false)
const types = codeTypes
const typeOptions = computed(() => types.map((item) => ({ value: item, label: item })))
const heroOptions = computed(() => parkourHeroes.map((hero) => ({ value: hero.value, label: hero.label })))
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
  if (form.title.trim().length < 2) return t('validation.titleTooShort')
  if (form.description.trim().length < 10) return t('validation.descriptionTooShort')
  if (!form.mapName) return t('validation.mapRequired')
  if (form.type === '跑酷' && (!form.parkour.levelCount || form.parkour.levelCount < 1)) return t('validation.levelCountRequired')
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
        <UiSurface v-if="form.type === '跑酷'" variant="subtle" class="grid gap-4 p-4 sm:grid-cols-2">
          <FormSelectPicker v-model="form.parkour.hero" label="跑酷角色" placeholder="跑酷角色" :options="heroOptions" />
          <label>
            <span class="text-sm font-medium">{{ t('forms.levelCount') }}</span>
            <input v-model.number="form.parkour.levelCount" type="number" min="1" :class="['mt-1 w-full', levelInputClass]">
          </label>
          <FormDifficultyPicker v-model="form.parkour.difficultyStart" allow-empty empty-label="起始难度" />
          <FormInput v-model="form.parkour.averageClearTime" :label="t('forms.averageClearTime')" />
          <label class="flex items-center gap-2 text-sm"><input v-model="form.parkour.timerSupported" type="checkbox">{{ t('forms.timerSupported') }}</label>
          <label class="flex items-center gap-2 text-sm"><input v-model="form.parkour.beginnerFriendly" type="checkbox">{{ t('forms.beginnerFriendly') }}</label>
        </UiSurface>
        <UiActionButton type="submit" variant="primary" class="h-12 px-5" :disabled="submitting">
          {{ t('forms.submit') }}
        </UiActionButton>
      </form>
    </UiGlassCard>
  </div>
</template>
