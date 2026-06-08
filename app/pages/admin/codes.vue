<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
const { t } = useI18n()
const toast = useToast()
const { data, refresh } = await useFetch('/api/admin/codes')

type CodeItem = {
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
  uploader?: { gameId: string }
  parkour?: Record<string, unknown> | null
  tags?: { tag: { name: string } }[]
}

type CodeFormValue = {
  type: string
  parkour?: Record<string, unknown>
  [key: string]: unknown
}

const editing = ref<CodeItem | null>(null)
const saving = ref(false)
const statusOptions = ['PENDING', 'APPROVED', 'REJECTED', 'HIDDEN', 'DELETED'].map((value) => ({ value, label: value }))
const editMeta = reactive({ status: 'PENDING', reviewNote: '' })

function codeInitial(item: CodeItem) {
  return {
    ...item,
    tags: (item.tags || []).map((entry) => entry.tag.name),
    parkour: item.parkour || undefined
  }
}

function openEdit(item: CodeItem) {
  editing.value = item
  editMeta.status = item.status
  editMeta.reviewNote = item.reviewNote || ''
}

async function hide(id: string) {
  try {
    await $fetch(`/api/admin/codes/${id}/hide`, { method: 'PATCH' })
    toast.success(t('admin.actionDone'))
    await refresh()
  } catch (error) {
    toast.fromError(error)
  }
}
async function restore(id: string) {
  try {
    await $fetch(`/api/admin/codes/${id}/restore`, { method: 'PATCH' })
    toast.success(t('admin.actionDone'))
    await refresh()
  } catch (error) {
    toast.fromError(error)
  }
}
async function save(form: CodeFormValue) {
  if (!editing.value) return
  saving.value = true
  try {
    await $fetch(`/api/admin/codes/${editing.value.id}`, {
      method: 'PATCH',
      body: {
        ...form,
        status: editMeta.status,
        reviewNote: editMeta.reviewNote || null,
        parkour: form.type === '跑酷' ? form.parkour : undefined
      }
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

async function remove(id: string) {
  if (!window.confirm('确认删除这个工坊代码？')) return
  try {
    await $fetch(`/api/admin/codes/${id}`, { method: 'DELETE' })
    toast.success(t('admin.actionDone'))
    await refresh()
  } catch (error) {
    toast.fromError(error)
  }
}
</script>

<template>
  <div>
    <UiGlassCard>
      <h1 class="text-2xl font-semibold">{{ t('admin.codes') }}</h1>
      <AdminTable class="mt-5">
        <tbody>
          <tr v-for="item in data?.items || []" :key="item.id" class="border-t border-slate-900/10 dark:border-white/10">
            <td class="p-3 font-medium">{{ item.title }}<span class="block text-xs text-slate-500">{{ item.workshopCode }} · {{ item.uploader?.gameId }}</span></td>
            <td class="p-3"><StatusBadge :status="item.status" /></td>
            <td class="p-3 text-right">
              <div class="flex justify-end gap-2">
                <UiActionButton size="compact" @click="openEdit(item)">{{ t('admin.edit') }}</UiActionButton>
                <UiActionButton size="compact" @click="item.status === 'HIDDEN' ? restore(item.id) : hide(item.id)">{{ item.status === 'HIDDEN' ? 'Restore' : 'Hide' }}</UiActionButton>
                <UiActionButton size="compact" class="border-rose-300/35 bg-rose-300/12 text-rose-700 dark:text-rose-200" @click="remove(item.id)">{{ t('admin.delete') }}</UiActionButton>
              </div>
            </td>
          </tr>
        </tbody>
      </AdminTable>
    </UiGlassCard>

    <Teleport to="body">
      <div v-if="editing" class="modal-scrim fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6" @click.self="editing = null">
        <UiSurface class="mx-auto max-w-4xl p-4">
          <div class="mb-4 flex items-center justify-between gap-3">
            <h2 class="text-lg font-semibold">{{ t('admin.edit') }} · {{ editing.title }}</h2>
            <UiActionButton @click="editing = null">{{ t('ui.close') }}</UiActionButton>
          </div>
          <div class="mb-4 grid gap-3 sm:grid-cols-2">
            <FormSelectPicker v-model="editMeta.status" label="状态" placeholder="状态" :options="statusOptions" />
            <FormInput v-model="editMeta.reviewNote" label="审核备注" />
          </div>
          <CodeForm :initial="codeInitial(editing)" :submit-label="t('settings.saveProfile')" :busy="saving" @submit="save" />
        </UiSurface>
      </div>
    </Teleport>
  </div>
</template>
