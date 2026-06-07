<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
const { t, locale } = useI18n()
const toast = useToast()
const mapsFetch = useFetch('/api/admin/maps')
const data = mapsFetch.data
const refresh = mapsFetch.refresh
const broken = ref<Set<string>>(new Set())
const editing = reactive({ open: false, slug: '', name: '', zhName: '', mode: '', image: '', isEnabled: true })
const saving = ref(false)

await mapsFetch

function openEdit(map: { slug: string; name: string; zhName?: string | null; mode: string; image?: string | null; isEnabled: boolean }) {
  editing.open = true
  editing.slug = map.slug
  editing.name = map.name
  editing.zhName = map.zhName || ''
  editing.mode = map.mode
  editing.image = map.image || ''
  editing.isEnabled = map.isEnabled
}

function markBroken(slug: string) {
  broken.value = new Set([...broken.value, slug])
}

async function save() {
  saving.value = true
  try {
    await $fetch(`/api/admin/maps/${editing.slug}`, {
      method: 'PATCH',
      body: {
        name: editing.name,
        zhName: editing.zhName || null,
        mode: editing.mode,
        image: editing.image || null,
        isEnabled: editing.isEnabled
      }
    })
    toast.success(t('admin.actionDone'))
    editing.open = false
    await refresh()
  } catch (error) {
    toast.fromError(error)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <UiGlassCard>
      <h1 class="text-2xl font-semibold">{{ t('admin.maps') }}</h1>
      <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ t('admin.mapsHint') }}</p>
    </UiGlassCard>

    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <article v-for="map in data?.maps || []" :key="map.slug" class="overflow-hidden rounded-xl border border-white/45 bg-white/40 shadow-lg shadow-slate-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
        <div class="relative aspect-video bg-slate-950">
          <img v-if="map.image && !broken.has(map.slug)" :src="map.image" :alt="locale.startsWith('zh') ? map.zhName || map.name : map.name" class="h-full w-full object-cover" @error="markBroken(map.slug)">
          <div v-else class="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 px-4 text-center text-sm font-semibold text-white/70">
            {{ t('admin.imageMissing') }}
          </div>
          <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
          <div class="absolute bottom-3 left-3 right-3">
            <h2 class="truncate text-lg font-bold text-white">{{ locale.startsWith('zh') ? map.zhName || map.name : map.name }}</h2>
            <p class="truncate text-xs text-white/65">{{ map.name }} · {{ map.mode }}</p>
          </div>
        </div>
        <div class="flex items-center justify-between gap-3 p-3">
          <span class="rounded-full border px-2.5 py-1 text-xs font-semibold" :class="map.isEnabled ? 'border-emerald-400/30 text-emerald-600 dark:text-emerald-300' : 'border-slate-400/30 text-slate-500'">
            {{ map.isEnabled ? t('admin.enabled') : t('admin.disabled') }}
          </span>
          <button type="button" class="h-9 rounded-xl border border-white/45 bg-white/35 px-3 text-sm font-semibold backdrop-blur transition-colors hover:bg-white/55 dark:border-white/10 dark:bg-white/10" @click="openEdit(map)">
            {{ t('admin.edit') }}
          </button>
        </div>
      </article>
    </div>

    <Teleport to="body">
      <div v-if="editing.open" class="modal-scrim fixed inset-0 z-50 grid place-items-center p-4" @click.self="editing.open = false">
        <form class="modal-panel w-full max-w-xl rounded-2xl p-4" @submit.prevent="save">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-lg font-semibold">{{ t('admin.editMap') }}</h2>
            <button type="button" class="modal-control rounded-xl px-3 py-2 text-sm font-semibold hover:bg-white/45 dark:hover:bg-white/15" @click="editing.open = false">{{ t('ui.close') }}</button>
          </div>
          <div class="mt-4 grid gap-3">
            <label class="block"><span class="text-sm font-medium">{{ t('admin.mapEnglishName') }}</span><input v-model="editing.name" required class="modal-control mt-1 h-11 w-full rounded-xl px-3 text-sm outline-none focus:ring-2 focus:ring-cyan-300/40"></label>
            <label class="block"><span class="text-sm font-medium">{{ t('admin.mapChineseName') }}</span><input v-model="editing.zhName" class="modal-control mt-1 h-11 w-full rounded-xl px-3 text-sm outline-none focus:ring-2 focus:ring-cyan-300/40"></label>
            <label class="block"><span class="text-sm font-medium">{{ t('admin.mapMode') }}</span><input v-model="editing.mode" required class="modal-control mt-1 h-11 w-full rounded-xl px-3 text-sm outline-none focus:ring-2 focus:ring-cyan-300/40"></label>
            <label class="block"><span class="text-sm font-medium">{{ t('admin.mapImage') }}</span><input v-model="editing.image" type="url" class="modal-control mt-1 h-11 w-full rounded-xl px-3 text-sm outline-none focus:ring-2 focus:ring-cyan-300/40"></label>
            <label class="inline-flex items-center gap-2 text-sm"><input v-model="editing.isEnabled" type="checkbox">{{ t('admin.enabled') }}</label>
          </div>
          <button class="mt-4 h-11 w-full rounded-xl bg-cyan-300 px-4 text-sm font-semibold text-slate-950 disabled:opacity-50" :disabled="saving">
            {{ t('settings.saveProfile') }}
          </button>
        </form>
      </div>
    </Teleport>
  </div>
</template>
