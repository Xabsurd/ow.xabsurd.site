<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { t } = useI18n()
const { data } = await useFetch('/api/me/uploads')
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between rounded-2xl border border-white/45 bg-white/40 p-4 shadow-xl shadow-slate-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
      <div>
        <h1 class="text-2xl font-semibold">{{ t('pages.myUploads') }}</h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ data?.items?.length || 0 }} 条提交</p>
      </div>
      <NuxtLink to="/upload" class="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">{{ t('nav.upload') }}</NuxtLink>
    </div>

    <div v-if="data?.items?.length" class="overflow-hidden rounded-xl border border-white/45 bg-white/35 shadow-lg shadow-slate-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
      <table class="min-w-full text-sm">
        <thead class="bg-white/40 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-white/5">
          <tr>
            <th class="px-4 py-3">标题</th>
            <th class="px-4 py-3">代码</th>
            <th class="px-4 py-3">类型</th>
            <th class="px-4 py-3">难度</th>
            <th class="px-4 py-3">状态</th>
            <th class="px-4 py-3">反馈</th>
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
            <td class="px-4 py-3"><UiDifficultyBadge :value="item.difficulty" /></td>
            <td class="px-4 py-3"><StatusBadge :status="item.status" /></td>
            <td class="max-w-80 px-4 py-3 text-slate-500"><span class="line-clamp-1">{{ item.reviewNote || '-' }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
    <UiEmptyState v-else :title="t('ui.empty')" />
  </div>
</template>
