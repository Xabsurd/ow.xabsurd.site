<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { workshopTags } from '~/utils/catalog'

const { t } = useI18n()
const props = withDefaults(defineProps<{
  availableTags?: { name: string; color: string; count?: number }[]
  allowCustom?: boolean
}>(), {
  availableTags: () => [...workshopTags],
  allowCustom: true
})
const model = defineModel<string[]>({ default: [] })
const draft = ref('')
const open = ref(false)
const tagList = computed(() => props.availableTags.length ? props.availableTags : [...workshopTags])
const summary = computed(() => model.value.length ? model.value.join('、') : t('forms.chooseTags'))
const triggerClass = controlTriggerClass

function add() {
  const value = draft.value.trim()
  if (!value || model.value.includes(value) || model.value.length >= 10) return
  model.value = [...model.value, value]
  draft.value = ''
}

function toggle(tag: string) {
  if (model.value.includes(tag)) {
    model.value = model.value.filter((item) => item !== tag)
    return
  }
  if (model.value.length >= 10) return
  model.value = [...model.value, tag]
}

function tagStyle(color: string, active: boolean) {
  return {
    borderColor: `${color}aa`,
    background: [
      'linear-gradient(135deg, rgba(15, 23, 42, 0.34), rgba(15, 23, 42, 0.18))',
      active ? `${color}66` : `${color}44`
    ].join(', '),
    color: '#fff',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.45)'
  }
}
</script>

<template>
  <div>
    <button
      type="button"
      :class="triggerClass"
      @click="open = true"
    >
      <span class="min-w-0 truncate font-semibold">{{ summary }}</span>
      <Icon icon="lucide:chevron-down" class="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-300" />
    </button>

    <div v-if="model.length" class="mt-2 flex flex-wrap gap-2">
      <button v-for="tag in model" :key="tag" type="button" class="rounded-full border border-cyan-300/30 bg-cyan-400/12 px-2.5 py-1 text-xs font-semibold text-cyan-700 shadow-sm backdrop-blur dark:text-cyan-200" @click="model = model.filter((item) => item !== tag)">
        {{ tag }} <Icon icon="lucide:x" class="inline h-3 w-3 align-[-2px]" />
      </button>
    </div>

    <Teleport to="body">
      <div v-if="open" class="modal-scrim fixed inset-0 z-50 grid place-items-center p-3 sm:p-6" @keydown.esc="open = false" @click.self="open = false">
        <div class="modal-panel flex max-h-[88dvh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl p-3 sm:p-4">
          <div class="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 class="text-lg font-semibold">{{ $t('forms.chooseTags') }}</h2>
              <p class="modal-subtle mt-1 text-sm">{{ $t('forms.chooseTagsHint') }}</p>
            </div>
            <button type="button" class="modal-control h-10 rounded-xl px-3 text-sm font-semibold shadow-lg shadow-black/10 transition hover:bg-white/45 dark:hover:bg-white/15" @click="open = false">
              {{ $t('ui.close') }}
            </button>
          </div>
          <div class="min-h-0 overflow-y-auto pr-1">
            <div class="grid grid-cols-2 gap-2 p-1 sm:grid-cols-3 lg:grid-cols-4">
              <button
                v-for="tag in tagList"
                :key="tag.name"
                type="button"
                class="min-h-11 rounded-xl border px-3 py-2 text-left text-xs font-semibold shadow-lg shadow-black/10 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                :class="model.includes(tag.name) ? 'ring-2 ring-white/70' : ''"
                :style="tagStyle(tag.color, model.includes(tag.name))"
                :disabled="!model.includes(tag.name) && model.length >= 10"
                @click="toggle(tag.name)"
              >
                {{ tag.name }}<span v-if="tag.count" class="ml-1 opacity-70">{{ tag.count }}</span>
              </button>
            </div>
            <div v-if="props.allowCustom" class="mt-3 flex gap-2">
              <input v-model="draft" class="modal-control focus-ring h-12 min-w-0 flex-1 rounded-xl px-3 text-sm shadow-lg shadow-black/10 backdrop-blur-xl placeholder:text-slate-500 transition hover:bg-white/45 dark:hover:bg-white/15" :placeholder="$t('forms.customTag')" @keydown.enter.prevent="add" >
              <button type="button" class="modal-control h-12 shrink-0 rounded-xl px-4 text-sm font-semibold shadow-lg shadow-black/10 backdrop-blur-xl transition hover:bg-white/45 dark:hover:bg-white/15" @click="add">{{ $t('ui.add') }}</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
