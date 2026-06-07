<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
const { t } = useI18n()
const toast = useToast()
const submissionsFetch = useFetch('/api/admin/submissions')
const data = submissionsFetch.data
const refresh = submissionsFetch.refresh
const rejecting = reactive({ open: false, id: '', title: '', note: '' })
const busyId = ref('')

await submissionsFetch

async function approve(id: string) {
  busyId.value = id
  try {
    await $fetch(`/api/admin/submissions/${id}/approve`, { method: 'PATCH' })
    toast.success(t('admin.actionDone'))
    await refresh()
  } catch (error) {
    toast.fromError(error)
  } finally {
    busyId.value = ''
  }
}

function openReject(item: { id: string; title: string }) {
  rejecting.open = true
  rejecting.id = item.id
  rejecting.title = item.title
  rejecting.note = ''
}

async function reject() {
  if (!rejecting.note.trim()) {
    toast.error(t('admin.rejectNoteRequired'))
    return
  }
  busyId.value = rejecting.id
  try {
    await $fetch(`/api/admin/submissions/${rejecting.id}/reject`, { method: 'PATCH', body: { note: rejecting.note } })
    toast.success(t('admin.actionDone'))
    rejecting.open = false
    await refresh()
  } catch (error) {
    toast.fromError(error)
  } finally {
    busyId.value = ''
  }
}
</script>

<template>
  <div>
    <UiGlassCard>
      <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="text-2xl font-semibold">{{ t('admin.submissions') }}</h1>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ t('admin.pendingCount', { count: data?.items?.length || 0 }) }}</p>
        </div>
      </div>
      <AdminTable class="mt-5">
        <tbody>
          <tr v-for="item in data?.items || []" :key="item.id" class="border-t border-slate-900/10 dark:border-white/10">
            <td class="p-3 font-medium">
              <div class="max-w-lg">
                <p class="line-clamp-1">{{ item.title }} <code class="ml-2">{{ item.workshopCode }}</code></p>
                <div class="mt-2 flex flex-wrap gap-1.5">
                  <UiTagPill :label="item.type" />
                  <UiTagPill v-for="entry in item.tags" :key="entry.tag.slug" :label="entry.tag.name" />
                </div>
              </div>
            </td>
            <td class="p-3">
              <span class="font-medium">{{ item.uploader.gameId }}</span>
              <span class="block text-xs text-slate-500">{{ item.uploader.email }}</span>
            </td>
            <td class="p-3"><UiDifficultyBadge :value="item.difficulty" /></td>
            <td class="p-3 text-right">
              <NuxtLink :to="`/profile/${item.uploader.id}`" class="mr-2 inline-flex rounded-lg border border-white/45 bg-white/35 px-3 py-2 text-sm font-semibold dark:border-white/10 dark:bg-white/10">{{ t('admin.uploader') }}</NuxtLink>
              <button class="rounded-lg bg-emerald-600 px-3 py-2 text-white disabled:opacity-50" :disabled="busyId === item.id" @click="approve(item.id)">{{ t('admin.approve') }}</button>
              <button class="ml-2 rounded-lg bg-rose-600 px-3 py-2 text-white disabled:opacity-50" :disabled="busyId === item.id" @click="openReject(item)">{{ t('admin.reject') }}</button>
            </td>
          </tr>
        </tbody>
      </AdminTable>
      <UiEmptyState v-if="!data?.items?.length" class="mt-5" :title="t('ui.empty')" />
    </UiGlassCard>

    <Teleport to="body">
      <div v-if="rejecting.open" class="modal-scrim fixed inset-0 z-50 grid place-items-center p-4" @click.self="rejecting.open = false">
        <form class="modal-panel w-full max-w-lg rounded-2xl p-4" @submit.prevent="reject">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h2 class="text-lg font-semibold">{{ t('admin.reject') }}</h2>
              <p class="modal-subtle mt-1 line-clamp-1 text-sm">{{ rejecting.title }}</p>
            </div>
            <button type="button" class="modal-control rounded-xl px-3 py-2 text-sm font-semibold hover:bg-white/45 dark:hover:bg-white/15" @click="rejecting.open = false">{{ t('ui.close') }}</button>
          </div>
          <label class="mt-4 block">
            <span class="text-sm font-medium">{{ t('admin.rejectNote') }}</span>
            <textarea v-model="rejecting.note" required rows="5" class="modal-control mt-1 w-full rounded-xl px-3 py-2 text-sm outline-none ring-cyan-300/40 focus:ring-2" :placeholder="t('admin.rejectNotePlaceholder')" />
          </label>
          <button class="mt-4 h-11 w-full rounded-xl bg-rose-500 px-4 text-sm font-semibold text-white disabled:opacity-50" :disabled="busyId === rejecting.id">
            {{ t('admin.reject') }}
          </button>
        </form>
      </div>
    </Teleport>
  </div>
</template>
