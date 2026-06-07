<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
const { t } = useI18n()
const toast = useToast()
const { data, refresh } = await useFetch('/api/admin/codes')
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
</script>

<template>
  <UiGlassCard>
    <h1 class="text-2xl font-semibold">{{ t('admin.codes') }}</h1>
    <AdminTable class="mt-5"><tbody><tr v-for="item in data?.items || []" :key="item.id" class="border-t border-slate-900/10 dark:border-white/10"><td class="p-3 font-medium">{{ item.title }}</td><td class="p-3"><StatusBadge :status="item.status" /></td><td class="p-3 text-right"><button class="rounded-lg border px-3 py-2 text-sm" @click="item.status === 'HIDDEN' ? restore(item.id) : hide(item.id)">{{ item.status === 'HIDDEN' ? 'Restore' : 'Hide' }}</button></td></tr></tbody></AdminTable>
  </UiGlassCard>
</template>
