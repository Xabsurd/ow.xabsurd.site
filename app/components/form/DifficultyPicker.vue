<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { difficultyOptions, legacyDifficultyOptions } from '~/utils/catalog'

const props = withDefaults(defineProps<{ allowEmpty?: boolean; emptyLabel?: string; label?: string }>(), {
  allowEmpty: false,
  emptyLabel: '',
  label: ''
})
const model = defineModel<string>({ default: '' })
const open = ref(false)
const triggerClass = controlTriggerClass

const selected = computed(() => difficultyOptions.find((item) => item.value === model.value))

function choose(value: string) {
  model.value = value
  open.value = false
}

function clear() {
  model.value = ''
  open.value = false
}
</script>

<template>
  <div>
    <FormField :label="props.label || $t('forms.difficulty')">
      <button
        type="button"
        :class="triggerClass"
        @click="open = true"
      >
        <span class="min-w-0 truncate font-semibold">{{ selected?.label || model || (props.allowEmpty ? props.emptyLabel || $t('filters.allDifficulties') : $t('forms.chooseDifficulty')) }}</span>
        <Icon icon="lucide:chevron-down" class="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-300" />
      </button>
    </FormField>

    <Teleport to="body">
      <div v-if="open" class="modal-scrim fixed inset-0 z-50 grid place-items-center p-3 sm:p-6" @keydown.esc="open = false" @click.self="open = false">
        <div class="modal-panel flex max-h-[88dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl p-3 sm:max-h-[84dvh] sm:p-4">
          <div class="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 class="text-lg font-semibold sm:text-xl">{{ $t('forms.chooseDifficulty') }}</h2>
              <p class="modal-subtle mt-1 text-sm">{{ $t('forms.chooseDifficultyHint') }}</p>
            </div>
            <button type="button" class="modal-control h-11 shrink-0 rounded-xl px-3 text-sm font-semibold shadow-lg shadow-black/10 transition hover:bg-white/45 dark:hover:bg-white/15 sm:px-4" @click="open = false">
              {{ $t('ui.close') }}
            </button>
          </div>
          <div class="min-h-0 overflow-y-auto">
            <button
              v-if="props.allowEmpty"
              type="button"
              class="modal-control mb-3 flex h-12 w-full items-center rounded-xl px-4 text-left text-sm font-semibold shadow-lg shadow-black/10 transition hover:bg-white/45 dark:hover:bg-white/15"
              @click="clear"
            >
              {{ props.emptyLabel || $t('filters.allDifficulties') }}
            </button>
            <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
              <button
                v-for="item in difficultyOptions"
                :key="item.value"
                type="button"
                class="min-h-20 rounded-xl border px-2 py-3 text-center text-white shadow-lg transition hover:-translate-y-0.5 sm:min-h-24 sm:px-4 sm:py-4"
                :class="item.value === model ? 'ring-2 ring-white/80' : ''"
                :style="{ backgroundColor: item.color, borderColor: `${item.color}dd`, boxShadow: `inset 0 0 0 2px rgba(255,255,255,.15), 0 14px 28px ${item.color}30` }"
                @click="choose(item.value)"
              >
                <span class="block text-lg font-extrabold drop-shadow sm:text-2xl">{{ item.label }}</span>
                <span class="mt-1 block text-base font-bold drop-shadow sm:text-xl">{{ item.subtitle }}</span>
              </button>
            </div>
            <div v-if="legacyDifficultyOptions.includes(model as never)" class="modal-control mt-5 rounded-xl p-3 text-sm">
              {{ $t('forms.legacyDifficulty') }}：{{ model }}
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
