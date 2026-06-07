<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
const { t } = useI18n()
const { data } = await useFetch('/api/admin/audit-logs')
</script>

<template>
  <UiGlassCard><h1 class="text-2xl font-semibold">{{ t('admin.auditLogs') }}</h1><div class="mt-5 grid gap-2 text-sm"><div v-for="log in data?.logs || []" :key="log.id" class="rounded-lg border border-slate-900/10 p-3 dark:border-white/10"><b>{{ log.action }}</b><span class="ml-2 text-slate-500">{{ log.actor.gameId }} · {{ log.targetType }}:{{ log.targetId }}</span></div></div></UiGlassCard>
</template>
