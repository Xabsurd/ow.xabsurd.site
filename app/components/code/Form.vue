<script setup lang="ts">
import { codeTypes, parkourHeroes } from '~/utils/catalog'

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

const props = withDefaults(defineProps<{
  initial?: Partial<CodeFormValue>
  submitLabel: string
  busy?: boolean
}>(), {
  initial: () => ({}),
  busy: false
})
const emit = defineEmits<{ submit: [value: CodeFormValue] }>()
const { t } = useI18n()
const levelInputClass = controlClasses()

function defaults(): CodeFormValue {
  return {
    workshopCode: '',
    title: '',
    description: '',
    type: '娱乐',
    difficulty: 'Medium',
    mapName: '',
    tags: [],
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
  }
}

const form = reactive<CodeFormValue>(defaults())
const typeOptions = computed(() => codeTypes.map((item) => ({ value: item, label: item })))
const heroOptions = computed(() => parkourHeroes.map((hero) => ({ value: hero.value, label: hero.label })))

function applyInitial(value: Partial<CodeFormValue>) {
  const next = { ...value }
  if (next.type === '源氏跑酷') {
    next.type = '跑酷'
    next.parkour = { ...(next.parkour || {}), hero: 'genji' }
  }
  Object.assign(form, defaults(), next, {
    parkour: { ...defaults().parkour, ...(next.parkour || {}) }
  })
}

watch(
  () => props.initial,
  (value) => applyInitial(value || {}),
  { immediate: true, deep: true }
)

watch(
  () => form.workshopCode,
  (value) => {
    const normalized = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)
    if (value !== normalized) form.workshopCode = normalized
  }
)

function submit() {
  emit('submit', JSON.parse(JSON.stringify(form)))
}
</script>

<template>
  <form class="grid gap-4" @submit.prevent="submit">
    <div class="grid gap-4 sm:grid-cols-2">
      <FormInput v-model="form.workshopCode" :label="t('forms.workshopCode')" required />
      <FormInput v-model="form.title" :label="t('forms.title')" required />
      <FormSelectPicker v-model="form.type" :label="t('forms.type')" :placeholder="t('forms.type')" :options="typeOptions" />
      <FormDifficultyPicker v-model="form.difficulty" />
      <FormMapPicker v-model="form.mapName" />
      <FormInput v-model="form.authorName" :label="t('forms.authorName')" />
      <FormInput v-model="form.version" :label="t('forms.version')" />
      <FormInput v-model="form.playerCount" :label="t('forms.playerCount')" />
    </div>

    <FormTextarea v-model="form.description" :label="t('forms.description')" required />
    <FormField :label="t('forms.tags')">
      <FormTagInput v-model="form.tags" class="mt-1" />
    </FormField>

    <FormSection v-if="form.type === '跑酷'" class="sm:grid-cols-2">
      <FormSelectPicker v-model="form.parkour.hero" label="跑酷角色" placeholder="跑酷角色" :options="heroOptions" />
      <FormField :label="t('forms.levelCount')">
        <input v-model.number="form.parkour.levelCount" type="number" min="1" :class="['mt-1 w-full', levelInputClass]">
      </FormField>
      <FormDifficultyPicker v-model="form.parkour.difficultyStart" allow-empty label="起始难度" empty-label="起始难度" />
      <FormInput v-model="form.parkour.averageClearTime" :label="t('forms.averageClearTime')" />
      <FormCheckbox v-model="form.parkour.timerSupported" :label="t('forms.timerSupported')" />
      <FormCheckbox v-model="form.parkour.beginnerFriendly" :label="t('forms.beginnerFriendly')" />
      <FormTextarea v-model="form.parkour.notes" :label="t('forms.notes')" :rows="3" class="sm:col-span-2" />
    </FormSection>

    <UiActionButton type="submit" variant="primary" class="h-12 px-5" :disabled="busy">
      {{ submitLabel }}
    </UiActionButton>
  </form>
</template>
