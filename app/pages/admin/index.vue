<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
const { t } = useI18n()
const { data } = await useFetch('/api/admin/stats')
const links = [
  ['/admin/users', 'admin.users'],
  ['/admin/submissions', 'admin.submissions'],
  ['/admin/codes', 'admin.codes'],
  ['/admin/maps', 'admin.maps'],
  ['/admin/reports', 'admin.reports'],
  ['/admin/tags', 'admin.tags'],
  ['/admin/audit-logs', 'admin.auditLogs']
]
</script>

<template>
  <div class="space-y-5">
    <h1 class="text-2xl font-semibold">{{ t('admin.overview') }}</h1>
    <div class="grid gap-4 sm:grid-cols-4">
      <UiGlassCard><b>{{ data?.users || 0 }}</b><span class="block text-sm text-slate-500">{{ t('admin.users') }}</span></UiGlassCard>
      <UiGlassCard><b>{{ data?.pending || 0 }}</b><span class="block text-sm text-slate-500">{{ t('admin.submissions') }}</span></UiGlassCard>
      <UiGlassCard><b>{{ data?.todayUploads || 0 }}</b><span class="block text-sm text-slate-500">Today</span></UiGlassCard>
      <UiGlassCard><b>{{ data?.reports || 0 }}</b><span class="block text-sm text-slate-500">{{ t('admin.reports') }}</span></UiGlassCard>
    </div>
    <UiGlassCard>
      <div class="grid gap-2 sm:grid-cols-3">
        <NuxtLink v-for="[to, label] in links" :key="to" :to="to" class="rounded-lg border border-slate-900/10 px-3 py-3 text-sm dark:border-white/10">{{ t(label) }}</NuxtLink>
      </div>
    </UiGlassCard>
  </div>
</template>
