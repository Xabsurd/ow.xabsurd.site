<script setup lang="ts">
type CodeCardItem = {
  id: string
  workshopCode: string
  title: string
  type?: string
  difficulty: string
  mapName: string
  authorName?: string | null
  viewCount: number
  favoriteCount: number
  createdAt: string
  tags?: { tag: { name: string; slug: string } }[]
  genjiPk?: { levelCount?: number; timerSupported?: boolean; beginnerFriendly?: boolean } | null
}

defineProps<{ items: CodeCardItem[]; emptyTitle: string }>()
</script>

<template>
  <div v-if="items.length" class="grid gap-3 xl:grid-cols-2">
    <CodeCard v-for="item in items" :key="item.id" :item="item" />
  </div>
  <UiEmptyState v-else :title="emptyTitle" />
</template>
