<script setup lang="ts">
import { findOverwatchMap, localizedCodeType, localizedMapMode, localizedMapName } from '~/utils/catalog'

const route = useRoute()
const { t } = useI18n()
const { locale } = useI18n()
const toast = useToast()
const { user } = useAuth()
type CodeDetail = {
  code: {
    id: string
    workshopCode: string
    title: string
    description: string
    htmlDescription: string
    type: string
    difficulty: string
    mapName: string
    authorName?: string | null
    version?: string | null
    region?: string | null
    playerCount?: string | null
    language?: string | null
    viewCount: number
    favoriteCount: number
    favorited: boolean
    createdAt: string
    uploader: { id: string; gameId: string }
    tags: { tag: { name: string; slug: string } }[]
    genjiPk?: {
      levelCount: number
      timerSupported: boolean
      beginnerFriendly: boolean
      averageClearTime?: string | null
    } | null
  }
}
const codeFetch = useFetch<CodeDetail>(`/api/codes/${route.params.id}`)
const data = codeFetch.data
const error = codeFetch.error
const map = computed(() => findOverwatchMap(data.value?.code.mapName))
const mapImageFailed = ref(false)
const mapLabel = computed(() => map.value ? localizedMapName(map.value, locale.value) : data.value?.code.mapName || '')
const mapModeLabel = computed(() => map.value ? localizedMapMode(map.value, locale.value) : data.value?.code.region || 'Workshop')
const typeLabel = computed(() => localizedCodeType(data.value?.code.type, locale.value))
const levelLabel = computed(() => t('ui.levels', { count: data.value?.code.genjiPk?.levelCount || 0 }))
const sameMapQuery = computed(() => ({ path: '/codes', query: { mapName: data.value?.code.mapName || '' } }))
const favoriteBusy = ref(false)
const reportOpen = ref(false)
const reportReason = ref('')
const reportDetail = ref('')
const reporting = ref(false)

useSeoMeta({
  title: () => `${data.value?.code.title || t('nav.codes')} · ${t('brand')}`,
  description: () => data.value?.code.description?.slice(0, 150) || t('hero.description'),
  ogTitle: () => data.value?.code.title,
  ogDescription: () => data.value?.code.description?.slice(0, 150)
})

await codeFetch

if (error.value) {
  throw createError({ statusCode: error.value.statusCode || 404, statusMessage: 'Code not found' })
}

async function toggleFavorite() {
  if (!data.value?.code) return
  if (!user.value) {
    await navigateTo({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  favoriteBusy.value = true
  const code = data.value.code
  try {
    if (code.favorited) {
      await $fetch(`/api/codes/${code.id}/favorite`, { method: 'DELETE' })
      code.favorited = false
      code.favoriteCount = Math.max(0, code.favoriteCount - 1)
    } else {
      await $fetch(`/api/codes/${code.id}/favorite`, { method: 'POST' })
      code.favorited = true
      code.favoriteCount += 1
    }
  } catch (err) {
    toast.fromError(err)
  } finally {
    favoriteBusy.value = false
  }
}

async function shareCode() {
  if (!import.meta.client) return
  const url = window.location.href
  try {
    if (navigator.share && data.value?.code) {
      await navigator.share({ title: data.value.code.title, text: data.value.code.workshopCode, url })
      return
    }
    await navigator.clipboard.writeText(url)
    toast.success(t('ui.linkCopied'))
  } catch {
    await navigator.clipboard.writeText(url)
    toast.success(t('ui.linkCopied'))
  }
}

async function submitReport() {
  if (!data.value?.code) return
  if (!user.value) {
    await navigateTo({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  reporting.value = true
  try {
    await $fetch(`/api/codes/${data.value.code.id}/report`, {
      method: 'POST',
      body: { reason: reportReason.value, detail: reportDetail.value || undefined }
    })
    toast.success(t('ui.reportSent'))
    reportOpen.value = false
    reportReason.value = ''
    reportDetail.value = ''
  } catch (err) {
    toast.fromError(err)
  } finally {
    reporting.value = false
  }
}
</script>

<template>
  <article v-if="data?.code" class="space-y-5">
    <NuxtLink to="/codes" class="inline-flex h-10 items-center rounded-xl border border-white/45 bg-white/35 px-3 text-sm font-semibold shadow-sm backdrop-blur transition hover:bg-white/55 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15">
      {{ t('nav.codes') }}
    </NuxtLink>

    <section class="overflow-hidden rounded-2xl border border-white/45 bg-white/40 shadow-xl shadow-slate-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
      <div class="grid lg:grid-cols-[minmax(0,1.25fr)_minmax(22rem,.75fr)]">
        <div class="relative min-h-72 bg-slate-950 lg:min-h-[28rem]">
          <img v-if="map && !mapImageFailed" :src="map.image" :alt="mapLabel" class="absolute inset-0 h-full w-full object-cover" @error="mapImageFailed = true">
          <div v-else class="absolute inset-0 bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
          <div class="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-6">
            <div class="mb-3 flex flex-wrap gap-2">
              <UiDifficultyBadge :value="data.code.difficulty" />
              <UiTagPill :label="typeLabel" />
              <UiTagPill v-if="data.code.genjiPk" :label="levelLabel" />
            </div>
            <h1 class="max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl">{{ data.code.title }}</h1>
            <p class="mt-2 text-sm text-white/75">{{ data.code.authorName || data.code.uploader.gameId }} · {{ mapLabel }}</p>
          </div>
        </div>
        <aside class="flex flex-col gap-4 p-5 sm:p-6">
          <div class="rounded-2xl border border-white/45 bg-white/45 p-4 shadow-lg shadow-slate-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
            <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">{{ t('forms.workshopCode') }}</span>
            <div class="mt-2 flex items-center gap-2">
              <code class="min-w-0 flex-1 rounded-xl bg-slate-950 px-4 py-3 text-center text-2xl font-black tracking-wide text-white dark:bg-white dark:text-slate-950">{{ data.code.workshopCode }}</code>
              <UiCopyCodeButton :code="data.code.workshopCode" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 text-sm">
            <div class="rounded-xl border border-white/45 bg-white/35 p-3 dark:border-white/10 dark:bg-white/10">
              <b>{{ data.code.viewCount }}</b>
              <span class="block text-xs text-slate-500">{{ t('ui.views') }}</span>
            </div>
            <div class="rounded-xl border border-white/45 bg-white/35 p-3 dark:border-white/10 dark:bg-white/10">
              <b>{{ data.code.favoriteCount }}</b>
              <span class="block text-xs text-slate-500">{{ t('ui.favorites') }}</span>
            </div>
            <div class="rounded-xl border border-white/45 bg-white/35 p-3 dark:border-white/10 dark:bg-white/10">
              <b>{{ data.code.version || '-' }}</b>
              <span class="block text-xs text-slate-500">{{ t('forms.version') }}</span>
            </div>
            <div class="rounded-xl border border-white/45 bg-white/35 p-3 dark:border-white/10 dark:bg-white/10">
              <b>{{ data.code.playerCount || '-' }}</b>
              <span class="block text-xs text-slate-500">{{ t('forms.playerCount') }}</span>
            </div>
          </div>

          <div class="grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <button
              type="button"
              class="h-11 rounded-xl border border-white/45 bg-white/35 px-3 text-sm font-semibold shadow-sm backdrop-blur transition hover:bg-white/55 disabled:opacity-50 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15"
              :disabled="favoriteBusy"
              @click="toggleFavorite"
            >
              {{ data.code.favorited ? t('ui.unfavorite') : t('ui.favorite') }}
            </button>
            <button type="button" class="h-11 rounded-xl border border-white/45 bg-white/35 px-3 text-sm font-semibold shadow-sm backdrop-blur transition hover:bg-white/55 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15" @click="shareCode">
              {{ t('ui.share') }}
            </button>
            <button type="button" class="h-11 rounded-xl border border-rose-300/35 bg-rose-300/12 px-3 text-sm font-semibold text-rose-700 shadow-sm backdrop-blur transition hover:bg-rose-300/20 dark:text-rose-200" @click="reportOpen = true">
              {{ t('ui.report') }}
            </button>
          </div>

          <div class="rounded-2xl border border-white/45 bg-white/35 p-4 dark:border-white/10 dark:bg-white/10">
            <h2 class="text-sm font-semibold">{{ t('forms.mapName') }}</h2>
            <p class="mt-1 text-lg font-bold">{{ mapLabel }}</p>
            <p v-if="locale.startsWith('zh') && map" class="mt-1 text-xs text-slate-500">{{ map.name }}</p>
            <p class="mt-1 text-xs text-slate-500">{{ mapModeLabel }}</p>
            <NuxtLink :to="sameMapQuery" class="mt-3 inline-flex h-10 items-center rounded-xl border border-white/45 bg-white/35 px-3 text-sm font-semibold transition hover:bg-white/55 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15">
              {{ t('ui.viewSameMap') }}
            </NuxtLink>
          </div>
        </aside>
      </div>
    </section>

    <section class="grid gap-5 lg:grid-cols-[1fr_22rem]">
      <div class="rounded-2xl border border-white/45 bg-white/40 p-5 shadow-xl shadow-slate-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
        <h2 class="mb-4 text-xl font-semibold">{{ t('forms.description') }}</h2>
        <MarkdownRenderer :html="data.code.htmlDescription" />
      </div>

      <aside class="space-y-5">
        <div v-if="data.code.genjiPk" class="rounded-2xl border border-white/45 bg-white/40 p-5 shadow-xl shadow-slate-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
          <h2 class="mb-4 text-lg font-semibold">{{ t('nav.genjiPk') }}</h2>
          <div class="grid gap-3">
            <div class="flex items-center justify-between rounded-xl bg-white/35 p-3 dark:bg-white/10"><span>{{ t('forms.levelCount') }}</span><b>{{ data.code.genjiPk.levelCount }}</b></div>
            <div class="flex items-center justify-between rounded-xl bg-white/35 p-3 dark:bg-white/10"><span>{{ t('forms.timerSupported') }}</span><b>{{ data.code.genjiPk.timerSupported ? 'Yes' : 'No' }}</b></div>
            <div class="flex items-center justify-between rounded-xl bg-white/35 p-3 dark:bg-white/10"><span>{{ t('forms.beginnerFriendly') }}</span><b>{{ data.code.genjiPk.beginnerFriendly ? 'Yes' : 'No' }}</b></div>
            <div class="flex items-center justify-between rounded-xl bg-white/35 p-3 dark:bg-white/10"><span>{{ t('forms.averageClearTime') }}</span><b>{{ data.code.genjiPk.averageClearTime || '-' }}</b></div>
          </div>
        </div>

        <div class="rounded-2xl border border-white/45 bg-white/40 p-5 shadow-xl shadow-slate-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
          <h2 class="mb-3 text-lg font-semibold">{{ t('forms.tags') }}</h2>
          <div class="flex flex-wrap gap-2">
            <NuxtLink
              v-for="entry in data.code.tags"
              :key="entry.tag.slug"
              :to="{ path: '/codes', query: { tags: entry.tag.name } }"
            >
              <UiTagPill :label="entry.tag.name" />
            </NuxtLink>
          </div>
        </div>
      </aside>
    </section>

    <Teleport to="body">
      <div v-if="reportOpen" class="modal-scrim fixed inset-0 z-50 grid place-items-center p-4" @click.self="reportOpen = false">
        <form class="modal-panel w-full max-w-lg rounded-2xl p-4" @submit.prevent="submitReport">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-lg font-semibold">{{ t('ui.report') }}</h2>
            <button type="button" class="modal-control rounded-xl px-3 py-2 text-sm font-semibold hover:bg-white/45 dark:hover:bg-white/15" @click="reportOpen = false">{{ t('ui.close') }}</button>
          </div>
          <label class="mt-4 block">
            <span class="text-sm font-medium">{{ t('ui.reportReason') }}</span>
            <input v-model="reportReason" required minlength="2" maxlength="80" class="modal-control mt-1 h-12 w-full rounded-xl px-3 text-sm outline-none ring-cyan-300/40 focus:ring-2" :placeholder="t('ui.reportReasonPlaceholder')" >
          </label>
          <label class="mt-3 block">
            <span class="text-sm font-medium">{{ t('ui.reportDetail') }}</span>
            <textarea v-model="reportDetail" rows="4" maxlength="1000" class="modal-control mt-1 w-full rounded-xl px-3 py-2 text-sm outline-none ring-cyan-300/40 focus:ring-2" :placeholder="t('ui.reportDetailPlaceholder')" />
          </label>
          <button class="mt-4 h-11 w-full rounded-xl bg-cyan-300/90 px-4 text-sm font-semibold text-slate-950 disabled:opacity-50" :disabled="reporting">
            {{ t('ui.submitReport') }}
          </button>
        </form>
      </div>
    </Teleport>
  </article>
</template>
