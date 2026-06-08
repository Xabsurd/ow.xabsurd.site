<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
const { t, locale } = useI18n()
const toast = useToast()
const mapsFetch = useFetch('/api/admin/maps')
const data = mapsFetch.data
const refresh = mapsFetch.refresh
const broken = ref<Set<string>>(new Set())
const editing = reactive({ open: false, slug: '', name: '', zhName: '', mode: '', image: '', isEnabled: true })
const creating = reactive({ open: false, slug: '', name: '', zhName: '', mode: '', image: '', isEnabled: true })
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

async function createMap() {
  saving.value = true
  try {
    await $fetch('/api/admin/maps', { method: 'POST', body: creating })
    toast.success(t('admin.actionDone'))
    creating.open = false
    creating.slug = ''
    creating.name = ''
    creating.zhName = ''
    creating.mode = ''
    creating.image = ''
    creating.isEnabled = true
    await refresh()
  } catch (error) {
    toast.fromError(error)
  } finally {
    saving.value = false
  }
}

async function deleteOverride(slug: string) {
  if (!window.confirm('确认删除这个地图覆盖？内置地图会恢复默认数据。')) return
  try {
    await $fetch(`/api/admin/maps/${slug}`, { method: 'DELETE' })
    toast.success(t('admin.actionDone'))
    await refresh()
  } catch (error) {
    toast.fromError(error)
  }
}
</script>

<template>
  <div class="space-y-4">
    <UiGlassCard>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-semibold">{{ t('admin.maps') }}</h1>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ t('admin.mapsHint') }}</p>
        </div>
        <UiActionButton variant="primary" @click="creating.open = true">{{ t('ui.add') }}</UiActionButton>
      </div>
    </UiGlassCard>

    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <UiSurface v-for="map in data?.maps || []" :key="map.slug" as="article" variant="card" class="overflow-hidden">
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
          <div class="flex gap-2">
            <UiActionButton size="compact" @click="openEdit(map)">{{ t('admin.edit') }}</UiActionButton>
            <UiActionButton size="compact" class="border-rose-300/35 bg-rose-300/12 text-rose-700 dark:text-rose-200" @click="deleteOverride(map.slug)">{{ t('admin.delete') }}</UiActionButton>
          </div>
        </div>
      </UiSurface>
    </div>

    <Teleport to="body">
      <div v-if="editing.open" class="modal-scrim fixed inset-0 z-50 grid place-items-center p-4" @click.self="editing.open = false">
        <UiSurface as="form" class="w-full max-w-xl p-4" @submit.prevent="save">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-lg font-semibold">{{ t('admin.editMap') }}</h2>
            <UiActionButton @click="editing.open = false">{{ t('ui.close') }}</UiActionButton>
          </div>
          <div class="mt-4 grid gap-3">
            <FormInput v-model="editing.name" :label="t('admin.mapEnglishName')" required />
            <FormInput v-model="editing.zhName" :label="t('admin.mapChineseName')" />
            <FormInput v-model="editing.mode" :label="t('admin.mapMode')" required />
            <FormInput v-model="editing.image" :label="t('admin.mapImage')" type="url" />
            <FormCheckbox v-model="editing.isEnabled" :label="t('admin.enabled')" />
          </div>
          <UiActionButton type="submit" variant="primary" class="mt-4 h-11 w-full" :disabled="saving">
            {{ t('settings.saveProfile') }}
          </UiActionButton>
        </UiSurface>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="creating.open" class="modal-scrim fixed inset-0 z-50 grid place-items-center p-4" @click.self="creating.open = false">
        <UiSurface as="form" class="w-full max-w-xl p-4" @submit.prevent="createMap">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-lg font-semibold">{{ t('ui.add') }} {{ t('admin.maps') }}</h2>
            <UiActionButton @click="creating.open = false">{{ t('ui.close') }}</UiActionButton>
          </div>
          <div class="mt-4 grid gap-3">
            <FormInput v-model="creating.slug" label="Slug" required />
            <FormInput v-model="creating.name" :label="t('admin.mapEnglishName')" required />
            <FormInput v-model="creating.zhName" :label="t('admin.mapChineseName')" />
            <FormInput v-model="creating.mode" :label="t('admin.mapMode')" required />
            <FormInput v-model="creating.image" :label="t('admin.mapImage')" type="url" />
            <FormCheckbox v-model="creating.isEnabled" :label="t('admin.enabled')" />
          </div>
          <UiActionButton type="submit" variant="primary" class="mt-4 h-11 w-full" :disabled="saving">
            {{ t('ui.add') }}
          </UiActionButton>
        </UiSurface>
      </div>
    </Teleport>
  </div>
</template>
