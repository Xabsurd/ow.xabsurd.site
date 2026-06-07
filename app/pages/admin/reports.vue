<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
const { t } = useI18n()
const toast = useToast()
const { data, refresh } = await useFetch('/api/admin/reports')
async function resolve(id: string, status: string) {
  try {
    await $fetch(`/api/admin/reports/${id}/resolve`, { method: 'PATCH', body: { status } })
    toast.success(t('admin.actionDone'))
    await refresh()
  } catch (error) {
    toast.fromError(error)
  }
}
</script>

<template>
  <UiGlassCard>
    <h1 class="text-2xl font-semibold">{{ t('admin.reports') }}</h1>
    <AdminTable class="mt-5"><tbody><tr v-for="item in data?.reports || []" :key="item.id" class="border-t border-slate-900/10 dark:border-white/10"><td class="p-3">{{ item.reason }}<span class="block text-xs text-slate-500">{{ item.workshopCode.title }}</span></td><td class="p-3">{{ item.status }}</td><td class="p-3 text-right"><button class="rounded-lg bg-emerald-600 px-3 py-2 text-white" @click="resolve(item.id, 'RESOLVED')">Resolve</button><button class="ml-2 rounded-lg border px-3 py-2" @click="resolve(item.id, 'REJECTED')">Reject</button></td></tr></tbody></AdminTable>
  </UiGlassCard>
</template>
