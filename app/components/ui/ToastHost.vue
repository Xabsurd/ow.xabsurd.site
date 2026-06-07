<script setup lang="ts">
const toast = useToast()
const messages = computed(() => toast.messages.value)

const styles = {
  success: 'border-emerald-500/30 bg-emerald-50/95 text-emerald-950 dark:bg-emerald-950/95 dark:text-emerald-50',
  error: 'border-rose-500/30 bg-rose-50/95 text-rose-950 dark:bg-rose-950/95 dark:text-rose-50',
  info: 'border-sky-500/30 bg-sky-50/95 text-sky-950 dark:bg-sky-950/95 dark:text-sky-50'
}
</script>

<template>
  <Teleport to="body">
    <div class="pointer-events-none fixed inset-x-0 top-4 z-[100] flex justify-center px-4">
      <TransitionGroup name="toast" tag="div" class="grid w-full max-w-md gap-2">
        <button
          v-for="message in messages"
          :key="message.id"
          type="button"
          class="pointer-events-auto rounded-xl border px-4 py-3 text-left text-sm font-medium shadow-2xl shadow-slate-950/10 backdrop-blur-xl transition hover:scale-[1.01]"
          :class="styles[message.type]"
          @click="toast.dismiss(message.id)"
        >
          {{ message.title }}
        </button>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 180ms ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}
</style>
