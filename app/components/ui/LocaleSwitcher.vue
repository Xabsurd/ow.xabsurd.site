<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const open = ref(false)
const root = ref<HTMLElement | null>(null)
const menu = ref<HTMLElement | null>(null)
const menuStyle = reactive({
  left: '0px',
  top: '0px',
  minWidth: '9rem'
})

const items = computed(() => locales.value.map((item) => ({
  code: typeof item === 'string' ? item : item.code,
  name: typeof item === 'string' ? item : item.name
})))
const current = computed(() => items.value.find((item) => item.code === locale.value))

async function choose(code: string) {
  localStorage.setItem('ow_locale', code)
  await setLocale(code)
  const path = switchLocalePath(code)
  if (path) await navigateTo(path)
  open.value = false
}

function updateMenuPosition() {
  if (!root.value) return
  const rect = root.value.getBoundingClientRect()
  const width = Math.max(144, rect.width)
  menuStyle.left = `${Math.min(window.innerWidth - width - 8, Math.max(8, rect.right - width))}px`
  menuStyle.top = `${rect.bottom + 8}px`
  menuStyle.minWidth = `${width}px`
}

async function toggle() {
  open.value = !open.value
  if (!open.value) return
  await nextTick()
  updateMenuPosition()
}

function onPointerDown(event: PointerEvent) {
  if (!open.value || !root.value) return
  const target = event.target as Node
  if (!root.value.contains(target) && !menu.value?.contains(target)) open.value = false
}

onMounted(() => {
  document.addEventListener('pointerdown', onPointerDown)
  window.addEventListener('resize', updateMenuPosition)
  window.addEventListener('scroll', updateMenuPosition, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown)
  window.removeEventListener('resize', updateMenuPosition)
  window.removeEventListener('scroll', updateMenuPosition, true)
})
</script>

<template>
  <div ref="root" class="relative" @keydown.esc="open = false">
    <UiActionButton
      type="button"
      aria-label="Language"
      :aria-expanded="open"
      @click="toggle"
    >
      {{ current?.name || locale }}
    </UiActionButton>
    <Teleport to="body">
      <div v-if="open" ref="menu" class="locale-menu fixed z-[95] grid gap-1 rounded-2xl p-2" :style="menuStyle">
        <button
          v-for="item in items"
          :key="item.code"
          type="button"
          class="rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-800 transition hover:bg-blue-500/10 dark:text-slate-50 dark:hover:bg-white/10"
          :class="item.code === locale ? 'bg-cyan-400/16 text-cyan-800 ring-1 ring-cyan-400/40 dark:text-cyan-100' : ''"
          @click="choose(item.code)"
        >
          {{ item.name }}
        </button>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.locale-menu {
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.82), rgba(226, 232, 240, 0.58)),
    rgba(241, 245, 249, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.32);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.68),
    inset 0 -1px 0 rgba(15, 23, 42, 0.05),
    0 20px 44px rgba(30, 64, 175, 0.16);
  -webkit-backdrop-filter: blur(22px) saturate(1.22);
  backdrop-filter: blur(22px) saturate(1.22);
  isolation: isolate;
  contain: paint;
  transform: translateZ(0);
  backface-visibility: hidden;
}

.dark .locale-menu {
  background:
    linear-gradient(135deg, rgba(51, 65, 85, 0.5), rgba(15, 23, 42, 0.34)),
    rgba(15, 23, 42, 0.34);
  border-color: rgba(125, 211, 252, 0.18);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.16),
    inset 0 -1px 0 rgba(0, 0, 0, 0.18),
    0 20px 44px rgba(0, 0, 0, 0.3);
}
</style>
