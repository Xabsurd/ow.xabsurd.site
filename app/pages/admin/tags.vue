<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
const { t } = useI18n()
const toast = useToast()
const tagsFetch = useFetch('/api/admin/tags')
const data = tagsFetch.data
const refresh = tagsFetch.refresh
const form = reactive({ name: '', isHot: false })
const editing = reactive({ open: false, id: '', name: '', isHot: false })
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

function openEdit(tag: { id: string; name: string; isHot: boolean }) {
  editing.open = true
  editing.id = tag.id
  editing.name = tag.name
  editing.isHot = tag.isHot
}

async function saveEdit() {
  saving.value = true
  try {
    await $fetch(`/api/admin/tags/${editing.id}`, {
      method: 'PATCH',
      body: { name: editing.name, isHot: editing.isHot }
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
  <div>
    <div class="space-y-4">
      <UiGlassCard>
        <h1 class="text-2xl font-semibold">{{ t('admin.tags') }}</h1>
        <form class="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_auto]" @submit.prevent="createTag">
          <FormInput v-model="form.name" :label="t('admin.tagName')" required maxlength="24" />
          <label class="flex items-end gap-2 pb-3 text-sm font-semibold">
            <input v-model="form.isHot" type="checkbox">
            {{ t('admin.hotTag') }}
          </label>
          <UiActionButton type="submit" variant="primary" class="h-12 self-end px-4" :disabled="saving">
            {{ t('ui.add') }}
          </UiActionButton>
        </form>
      </UiGlassCard>

      <div class="grid gap-2">
        <UiSurface v-for="tag in data?.tags || []" :key="tag.id" variant="subtle" class="flex flex-wrap items-center justify-between gap-3 p-3">
          <div class="flex items-center gap-2">
            <UiTagPill :label="tag.name" />
            <span class="text-sm text-slate-500">{{ tag._count.codes }} codes</span>
            <span v-if="tag.isHot" class="rounded-full border border-amber-300/40 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-300">{{ t('admin.hotTag') }}</span>
          </div>
          <div class="flex gap-2">
            <UiActionButton size="compact" @click="openEdit(tag)">
              {{ t('admin.edit') }}
            </UiActionButton>
            <UiActionButton size="compact" @click="toggleHot(tag)">
              {{ tag.isHot ? t('admin.unsetHot') : t('admin.setHot') }}
            </UiActionButton>
            <UiActionButton size="compact" class="border-rose-300/35 bg-rose-300/12 text-rose-700 dark:text-rose-200" :disabled="tag._count.codes > 0" @click="deleteTag(tag)">
              {{ t('admin.delete') }}
            </UiActionButton>
          </div>
        </UiSurface>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="editing.open" class="modal-scrim fixed inset-0 z-50 grid place-items-center p-4" @click.self="editing.open = false">
        <UiSurface as="form" class="w-full max-w-md p-4" @submit.prevent="saveEdit">
          <div class="mb-4 flex items-center justify-between gap-3">
            <h2 class="text-lg font-semibold">{{ t('admin.edit') }}</h2>
            <UiActionButton @click="editing.open = false">{{ t('ui.close') }}</UiActionButton>
          </div>
          <div class="grid gap-3">
            <FormInput v-model="editing.name" :label="t('admin.tagName')" required maxlength="24" />
            <FormCheckbox v-model="editing.isHot" :label="t('admin.hotTag')" />
            <UiActionButton type="submit" variant="primary" class="h-12" :disabled="saving">{{ t('settings.saveProfile') }}</UiActionButton>
          </div>
        </UiSurface>
      </div>
    </Teleport>
  </div>
</template>
