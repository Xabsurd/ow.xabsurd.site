<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { t } = useI18n()
const toast = useToast()
const { data, refresh } = await useFetch('/api/me/uploads')

type UploadItem = {
  id: string
  workshopCode: string
  title: string
  description: string
  type: string
  difficulty: string
  mapName: string
  authorName?: string | null
  version?: string | null
  region?: string | null
  playerCount?: string | null
  language?: string | null
  status: string
  reviewNote?: string | null
  parkour?: Record<string, unknown> | null
  tags?: { tag: { name: string } }[]
}

type CodeFormValue = {
  type: string
  parkour?: Record<string, unknown>
  [key: string]: unknown
}

const editing = ref<UploadItem | null>(null)
const saving = ref(false)
const actionHint = '编辑已通过内容后会重新进入待审核；删除会从公开列表移除。'

function codeInitial(item: UploadItem) {
  return {
    ...item,
    tags: (item.tags || []).map((entry) => entry.tag.name),
    parkour: item.parkour || undefined
  }
}

async function save(form: CodeFormValue) {
  if (!editing.value) return
  saving.value = true
  try {
    await $fetch(`/api/me/uploads/${editing.value.id}`, {
      method: 'PATCH',
      body: { ...form, parkour: form.type === '跑酷' ? form.parkour : undefined }
    })
    toast.success(t('admin.actionDone'))
    editing.value = null
    await refresh()
  } catch (error) {
    toast.fromError(error)
  } finally {
    saving.value = false
  }
}

async function remove(item: UploadItem) {
  if (!window.confirm('确认删除这条提交？')) return
  try {
    await $fetch(`/api/me/uploads/${item.id}`, { method: 'DELETE' })
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
      <UiSurface class="flex items-center justify-between p-4">
        <div>
          <h1 class="text-2xl font-semibold">{{ t('pages.myUploads') }}</h1>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ data?.items?.length || 0 }} 条提交 · {{ actionHint }}</p>
        </div>
        <UiActionLink to="/upload" variant="primary">{{ t('nav.upload') }}</UiActionLink>
      </UiSurface>

      <UiSurface v-if="data?.items?.length" variant="subtle" class="overflow-hidden">
        <table class="min-w-full text-sm">
          <thead class="bg-white/40 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-white/5">
            <tr>
              <th class="px-4 py-3">标题</th>
              <th class="px-4 py-3">代码</th>
              <th class="px-4 py-3">类型</th>
              <th class="px-4 py-3">难度</th>
              <th class="px-4 py-3">状态</th>
              <th class="px-4 py-3">反馈</th>
              <th class="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in data.items" :key="item.id" class="border-t border-slate-900/10 dark:border-white/10">
              <td class="max-w-72 px-4 py-3 font-medium">
                <NuxtLink v-if="item.status === 'APPROVED'" :to="`/codes/${item.id}`" class="block truncate hover:text-cyan-600">{{ item.title }}</NuxtLink>
                <span v-else class="block truncate">{{ item.title }}</span>
              </td>
              <td class="px-4 py-3"><code class="rounded bg-slate-950 px-2 py-1 font-bold text-white dark:bg-white dark:text-slate-950">{{ item.workshopCode }}</code></td>
              <td class="px-4 py-3"><UiTagPill :label="item.type" /></td>
              <td class="px-4 py-3">
                <UiDifficultyBadge v-if="item.type === '跑酷'" :value="item.difficulty" />
                <span v-else class="text-slate-400">-</span>
              </td>
              <td class="px-4 py-3"><StatusBadge :status="item.status" /></td>
              <td class="max-w-80 px-4 py-3 text-slate-500"><span class="line-clamp-1">{{ item.reviewNote || '-' }}</span></td>
              <td class="px-4 py-3 text-right">
                <div class="flex justify-end gap-2">
                  <UiActionButton size="compact" @click="editing = item">{{ t('admin.edit') }}</UiActionButton>
                  <UiActionButton size="compact" class="border-rose-300/35 bg-rose-300/12 text-rose-700 dark:text-rose-200" @click="remove(item)">{{ t('admin.delete') }}</UiActionButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </UiSurface>
      <UiEmptyState v-else :title="t('ui.empty')" />
    </div>

    <Teleport to="body">
      <div v-if="editing" class="modal-scrim fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6" @click.self="editing = null">
        <UiSurface class="mx-auto max-w-4xl p-4">
          <div class="mb-4 flex items-center justify-between gap-3">
            <h2 class="text-lg font-semibold">{{ t('admin.edit') }} · {{ editing.title }}</h2>
            <UiActionButton @click="editing = null">{{ t('ui.close') }}</UiActionButton>
          </div>
          <CodeForm :initial="codeInitial(editing)" :submit-label="t('settings.saveProfile')" :busy="saving" @submit="save" />
        </UiSurface>
      </div>
    </Teleport>
  </div>
</template>
