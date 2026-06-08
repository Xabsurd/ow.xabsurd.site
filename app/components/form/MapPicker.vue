<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { localizedMapMode, localizedMapName, mapSearchTerms, overwatchMaps } from '~/utils/catalog'

const props = withDefaults(defineProps<{ modelValue?: string; required?: boolean; allowEmpty?: boolean; emptyLabel?: string }>(), {
  modelValue: '',
  required: false,
  allowEmpty: false,
  emptyLabel: ''
})
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const open = ref(false)
const search = ref('')
const searchInput = ref<HTMLInputElement | null>(null)
const { locale } = useI18n()
const failedImages = ref<Set<string>>(new Set())
const mapFetch = useFetch('/api/maps')
const mapData = mapFetch.data
const maps = computed(() => mapData.value?.maps || overwatchMaps)
const triggerClass = controlTriggerClass

const selectedMap = computed(() => maps.value.find((map) => map.name === props.modelValue || map.zhName === props.modelValue || map.slug === props.modelValue))
const selectedLabel = computed(() => selectedMap.value ? localizedMapName(selectedMap.value, locale.value) : '')
const filteredMaps = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  if (!keyword) return maps.value
  return maps.value.filter((map) => mapSearchTerms(map).some((value) => value.toLowerCase().includes(keyword)))
})

watch(open, async (value) => {
  if (!value) return
  search.value = ''
  await nextTick()
  searchInput.value?.focus()
})

function choose(name: string) {
  emit('update:modelValue', name)
  open.value = false
}

function clear() {
  emit('update:modelValue', '')
  open.value = false
}

function markImageFailed(slug: string) {
  failedImages.value = new Set([...failedImages.value, slug])
}

function hasImage(slug: string) {
  return !failedImages.value.has(slug)
}

await mapFetch
</script>

<template>
  <div>
    <span class="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">{{ $t('forms.mapName') }}</span>
    <button
      type="button"
      :class="triggerClass"
      @click="open = true"
    >
      <span class="min-w-0 truncate font-semibold">{{ selectedLabel || (props.allowEmpty ? props.emptyLabel || $t('filters.allMaps') : $t('forms.chooseMap')) }}</span>
      <Icon icon="lucide:chevron-down" class="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-300" />
    </button>

    <Teleport to="body">
      <div v-if="open" class="modal-scrim fixed inset-0 z-[80] grid place-items-center p-3 sm:p-6" @keydown.esc="open = false" @click.self="open = false">
        <div class="modal-panel flex max-h-[88dvh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl sm:max-h-[84dvh]">
          <div class="border-b border-white/12 p-3 sm:p-4">
            <div class="flex items-center gap-2 sm:gap-3">
              <input
                ref="searchInput"
                v-model="search"
                type="search"
                class="modal-control focus-ring h-12 min-w-0 flex-1 rounded-xl px-4 text-sm shadow-inner shadow-white/20 placeholder:text-slate-500 dark:shadow-white/5 dark:placeholder:text-slate-400"
                :placeholder="$t('forms.searchMap')"
              >
              <button type="button" class="modal-control h-12 shrink-0 rounded-xl px-3 text-sm font-semibold shadow-lg shadow-slate-950/10 transition hover:bg-white/50 dark:shadow-black/20 dark:hover:bg-white/18 sm:px-4" @click="open = false">
                {{ $t('ui.close') }}
              </button>
            </div>
          </div>
          <div class="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
            <button
              v-if="props.allowEmpty"
              type="button"
              class="modal-control mb-3 flex h-12 w-full items-center rounded-xl px-4 text-left text-sm font-semibold shadow-lg shadow-slate-950/10 transition hover:bg-white/50 dark:shadow-black/20 dark:hover:bg-white/15"
              @click="clear"
            >
              {{ props.emptyLabel || $t('filters.allMaps') }}
            </button>
            <div class="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 xl:grid-cols-4">
              <button
                v-for="map in filteredMaps"
                :key="map.slug"
                type="button"
                class="group overflow-hidden rounded-xl border text-left shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:border-cyan-300/70"
                :class="map.name === modelValue ? 'border-cyan-300 bg-cyan-300/15' : 'border-white/10 bg-white/5'"
                @click="choose(map.name)"
              >
                <div class="relative aspect-video overflow-hidden">
                  <img v-if="hasImage(map.slug)" :src="map.image" :alt="localizedMapName(map, locale)" class="h-full w-full object-cover transition duration-300 group-hover:scale-105" @error="markImageFailed(map.slug)">
                  <div v-else class="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 via-blue-950 to-slate-950 px-3 text-center text-xs font-semibold text-white/70">
                    {{ localizedMapName(map, locale) }}
                  </div>
                  <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <div class="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3">
                    <div class="truncate text-sm font-bold text-white sm:text-base">{{ localizedMapName(map, locale) }}</div>
                    <div v-if="locale.startsWith('zh')" class="truncate text-[0.7rem] font-medium text-white/65">{{ map.name }}</div>
                    <div class="mt-1 max-w-full truncate rounded-full bg-black/50 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-cyan-100 backdrop-blur sm:inline-flex sm:text-[0.7rem]">{{ localizedMapMode(map, locale) }}</div>
                  </div>
                </div>
              </button>
            </div>
            <UiEmptyState v-if="filteredMaps.length === 0" :title="$t('ui.empty')" />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
