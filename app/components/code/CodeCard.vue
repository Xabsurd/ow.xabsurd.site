<script setup lang="ts">
import { findOverwatchMap, localizedCodeType, localizedMapName, localizedMapValue, parkourHeroLabel } from '~/utils/catalog'

const props = defineProps<{
  item: {
    id: string
    workshopCode: string
    title: string
    type?: string
    difficulty: string
    mapName: string
    authorName?: string | null
    viewCount: number
    favoriteCount: number
    createdAt: string
    tags?: { tag: { name: string; slug: string } }[]
    parkour?: { hero?: string; levelCount?: number; timerSupported?: boolean; beginnerFriendly?: boolean; difficultyStart?: string | null } | null
  }
}>()

const map = computed(() => findOverwatchMap(props.item.mapName))
const { locale, t } = useI18n()
const imageFailed = ref(false)
const mapLabel = computed(() => map.value ? localizedMapName(map.value, locale.value) : localizedMapValue(props.item.mapName, locale.value))
const typeLabel = computed(() => localizedCodeType(props.item.type, locale.value))
const levelLabel = computed(() => t('ui.levels', { count: props.item.parkour?.levelCount || 0 }))
const heroLabel = computed(() => parkourHeroLabel(props.item.parkour?.hero))
const isParkour = computed(() => props.item.type === '跑酷' || Boolean(props.item.parkour))
</script>

<template>
  <UiSurface as="article" variant="card" class="h-full overflow-hidden">
    <div class="grid h-full min-h-36 grid-cols-[7.5rem_1fr] items-stretch sm:grid-cols-[10rem_1fr]">
      <NuxtLink :to="`/codes/${item.id}`" class="relative block min-h-36 self-stretch overflow-hidden bg-slate-900">
        <img v-if="map && !imageFailed" :src="map.image" :alt="mapLabel" class="absolute inset-0 h-full w-full object-cover" @error="imageFailed = true">
        <div v-else class="absolute inset-0 flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-cyan-950 text-xs font-semibold text-white/60">
          {{ mapLabel || 'MAP' }}
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <span class="absolute bottom-2 left-2 right-2 truncate text-xs font-semibold text-white">{{ mapLabel }}</span>
      </NuxtLink>

      <div class="flex min-w-0 flex-col p-3">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <NuxtLink :to="`/codes/${item.id}`" class="block truncate text-base font-semibold text-slate-800 hover:text-cyan-700 dark:text-slate-50 dark:hover:text-cyan-300">{{ item.title }}</NuxtLink>
            <p class="mt-1 truncate text-xs text-slate-500/90 dark:text-slate-400">{{ item.authorName || t('ui.unknown') }} · {{ typeLabel }}</p>
          </div>
          <code class="shrink-0 rounded-lg bg-slate-800 px-2.5 py-1.5 text-sm font-bold text-white shadow-sm dark:bg-white dark:text-slate-950">{{ item.workshopCode }}</code>
        </div>

        <div class="mt-3 flex flex-wrap gap-1.5">
          <UiDifficultyBadge v-if="isParkour" :value="item.difficulty" />
          <UiTagPill v-if="heroLabel" :label="heroLabel" />
          <UiTagPill v-if="item.parkour?.levelCount" :label="levelLabel" />
          <UiTagPill v-for="entry in (item.tags || []).slice(0, 4)" :key="entry.tag.slug" :label="entry.tag.name" />
          <span v-if="(item.tags || []).length > 4" class="rounded-full border border-slate-300/50 px-2 py-1 text-xs text-slate-500 dark:border-white/10">+{{ (item.tags || []).length - 4 }}</span>
        </div>

        <div class="mt-auto flex items-center justify-between gap-3 pt-3 text-xs text-slate-500 dark:text-slate-400">
          <span>{{ t('ui.viewCount', { count: item.viewCount }) }} · {{ t('ui.favoriteCount', { count: item.favoriteCount }) }}</span>
          <UiCopyCodeButton :code="item.workshopCode" />
        </div>
      </div>
    </div>
  </UiSurface>
</template>
