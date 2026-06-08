<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
const { t } = useI18n()
const toast = useToast()
const { data, refresh } = await useFetch('/api/admin/users')

type UserItem = {
  id: string
  email: string
  gameId: string
  role: string
  isBanned: boolean
  banReason?: string | null
  _count: { uploads: number }
}

const editing = ref<UserItem | null>(null)
const saving = ref(false)
const roleOptions = ['USER', 'MODERATOR', 'ADMIN'].map((value) => ({ value, label: value }))
const form = reactive({ email: '', gameId: '', role: 'USER', isBanned: false, banReason: '' })

function openEdit(item: UserItem) {
  editing.value = item
  form.email = item.email
  form.gameId = item.gameId
  form.role = item.role
  form.isBanned = item.isBanned
  form.banReason = item.banReason || ''
}

async function ban(id: string) {
  const reason = window.prompt('Ban reason')
  if (!reason) return
  try {
    await $fetch(`/api/admin/users/${id}/ban`, { method: 'PATCH', body: { reason } })
    toast.success(t('admin.actionDone'))
    await refresh()
  } catch (error) {
    toast.fromError(error)
  }
}
async function unban(id: string) {
  try {
    await $fetch(`/api/admin/users/${id}/unban`, { method: 'PATCH' })
    toast.success(t('admin.actionDone'))
    await refresh()
  } catch (error) {
    toast.fromError(error)
  }
}

async function save() {
  if (!editing.value) return
  saving.value = true
  try {
    await $fetch(`/api/admin/users/${editing.value.id}`, {
      method: 'PATCH',
      body: { ...form, banReason: form.banReason || null }
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
  if (!window.confirm('确认删除这个用户？有上传内容的用户会被数据库拒绝删除。')) return
  try {
    await $fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
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
      <h1 class="text-2xl font-semibold">{{ t('admin.users') }}</h1>
      <AdminTable class="mt-5">
        <tbody>
          <tr v-for="item in data?.users || []" :key="item.id" class="border-t border-slate-900/10 dark:border-white/10">
            <td class="p-3 font-medium">{{ item.gameId }}<span class="block text-xs text-slate-500">{{ item.email }}</span></td>
            <td class="p-3">{{ item.role }}</td>
            <td class="p-3">{{ item._count.uploads }}</td>
            <td class="p-3 text-right">
              <div class="flex justify-end gap-2">
                <UiActionButton size="compact" @click="openEdit(item)">{{ t('admin.edit') }}</UiActionButton>
                <UiActionButton v-if="!item.isBanned" size="compact" class="border-rose-300/35 bg-rose-300/12 text-rose-700 dark:text-rose-200" @click="ban(item.id)">{{ t('admin.ban') }}</UiActionButton>
                <UiActionButton v-else size="compact" class="border-emerald-300/35 bg-emerald-300/12 text-emerald-700 dark:text-emerald-200" @click="unban(item.id)">{{ t('admin.unban') }}</UiActionButton>
                <UiActionButton size="compact" class="border-rose-300/35 bg-rose-300/12 text-rose-700 dark:text-rose-200" @click="remove(item.id)">{{ t('admin.delete') }}</UiActionButton>
              </div>
            </td>
          </tr>
        </tbody>
      </AdminTable>
    </UiGlassCard>

    <Teleport to="body">
      <div v-if="editing" class="modal-scrim fixed inset-0 z-50 grid place-items-center p-4" @click.self="editing = null">
        <UiSurface as="form" class="w-full max-w-xl p-4" @submit.prevent="save">
          <div class="mb-4 flex items-center justify-between gap-3">
            <h2 class="text-lg font-semibold">{{ t('admin.edit') }} · {{ editing.gameId }}</h2>
            <UiActionButton @click="editing = null">{{ t('ui.close') }}</UiActionButton>
          </div>
          <div class="grid gap-3">
            <FormInput v-model="form.email" label="Email" required />
            <FormInput v-model="form.gameId" label="Game ID" required />
            <FormSelectPicker v-model="form.role" label="Role" placeholder="Role" :options="roleOptions" />
            <FormCheckbox v-model="form.isBanned" :label="t('admin.ban')" />
            <FormInput v-model="form.banReason" label="Ban reason" />
            <UiActionButton type="submit" variant="primary" class="h-12" :disabled="saving">{{ t('settings.saveProfile') }}</UiActionButton>
          </div>
        </UiSurface>
      </div>
    </Teleport>
  </div>
</template>
