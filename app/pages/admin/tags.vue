<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
const { t } = useI18n()
const toast = useToast()
const tagsFetch = useFetch('/api/admin/tags')
const data = tagsFetch.data
const refresh = tagsFetch.refresh
const form = reactive({ name: '', isHot: false })
const saving = ref(false)

await tagsFetch

async function createTag() {
  saving.value = true
  try {
    await $fetch('/api/admin/tags', { method: 'POST', body: form })
    form.name = ''
    form.isHot = false
    toast.success(t('admin.actionDone'))
    await refresh()
  } catch (error) {
    toast.fromError(error)
  } finally {
    saving.value = false
  }
}

async function toggleHot(tag: { id: string; isHot: boolean }) {
  try {
    await $fetch(`/api/admin/tags/${tag.id}`, { method: 'PATCH', body: { isHot: !tag.isHot } })
    await refresh()
  } catch (error) {
    toast.fromError(error)
  }
}

async function deleteTag(tag: { id: string }) {
  try {
    await $fetch(`/api/admin/tags/${tag.id}`, { method: 'DELETE' })
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
      <h1 class="text-2xl font-semibold">{{ t('admin.tags') }}</h1>
      <form class="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_auto]" @submit.prevent="createTag">
        <FormInput v-model="form.name" :label="t('admin.tagName')" required maxlength="24" />
        <label class="flex items-end gap-2 pb-3 text-sm font-semibold">
          <input v-model="form.isHot" type="checkbox">
          {{ t('admin.hotTag') }}
        </label>
        <button class="h-12 self-end rounded-xl border border-cyan-300/40 bg-cyan-300/18 px-4 text-sm font-semibold text-cyan-950 backdrop-blur dark:text-cyan-50" :disabled="saving">
          {{ t('ui.add') }}
        </button>
      </form>
    </UiGlassCard>

    <div class="grid gap-2">
      <div v-for="tag in data?.tags || []" :key="tag.id" class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/45 bg-white/35 p-3 shadow-lg shadow-slate-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
        <div class="flex items-center gap-2">
          <UiTagPill :label="tag.name" />
          <span class="text-sm text-slate-500">{{ tag._count.codes }} codes</span>
          <span v-if="tag.isHot" class="rounded-full border border-amber-300/40 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-300">{{ t('admin.hotTag') }}</span>
        </div>
        <div class="flex gap-2">
          <button class="h-9 rounded-xl border border-white/45 bg-white/35 px-3 text-sm font-semibold backdrop-blur dark:border-white/10 dark:bg-white/10" @click="toggleHot(tag)">
            {{ tag.isHot ? t('admin.unsetHot') : t('admin.setHot') }}
          </button>
          <button class="h-9 rounded-xl border border-rose-300/35 bg-rose-300/12 px-3 text-sm font-semibold text-rose-700 dark:text-rose-200" :disabled="tag._count.codes > 0" @click="deleteTag(tag)">
            {{ t('admin.delete') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
