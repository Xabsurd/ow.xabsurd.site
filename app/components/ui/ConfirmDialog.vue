<script setup lang="ts">
defineProps<{ open: boolean; title: string; message: string }>()
defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
  <div v-if="open" class="modal-scrim fixed inset-0 z-50 grid place-items-center p-4">
    <div class="modal-panel max-w-sm rounded-xl p-5">
      <h3 class="font-semibold">{{ title }}</h3>
      <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">{{ message }}</p>
      <div class="mt-5 flex justify-end gap-2">
        <button class="rounded-lg px-3 py-2 text-sm" @click="$emit('cancel')">Cancel</button>
        <button class="rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white" @click="$emit('confirm')">Confirm</button>
      </div>
    </div>
  </div>
</template>
