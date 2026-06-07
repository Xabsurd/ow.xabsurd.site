<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
const { t } = useI18n()
const toast = useToast()
const { data, refresh } = await useFetch('/api/admin/users')

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
</script>

<template>
  <UiGlassCard>
    <h1 class="text-2xl font-semibold">{{ t('admin.users') }}</h1>
    <AdminTable class="mt-5">
      <tbody>
        <tr v-for="item in data?.users || []" :key="item.id" class="border-t border-slate-900/10 dark:border-white/10">
          <td class="p-3 font-medium">{{ item.gameId }}<span class="block text-xs text-slate-500">{{ item.email }}</span></td>
          <td class="p-3">{{ item.role }}</td>
          <td class="p-3">{{ item._count.uploads }}</td>
          <td class="p-3 text-right">
            <button v-if="!item.isBanned" class="rounded-lg bg-rose-600 px-3 py-2 text-white" @click="ban(item.id)">{{ t('admin.ban') }}</button>
            <button v-else class="rounded-lg bg-emerald-600 px-3 py-2 text-white" @click="unban(item.id)">{{ t('admin.unban') }}</button>
          </td>
        </tr>
      </tbody>
    </AdminTable>
  </UiGlassCard>
</template>
