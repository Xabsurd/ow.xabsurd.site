<script setup lang="ts">
import { Icon } from '@iconify/vue'

type Option = {
  value: string
  label: string
  description?: string
}

const props = withDefaults(defineProps<{
  label: string
  options: Option[]
  placeholder?: string
}>(), {
  placeholder: ''
})
const model = defineModel<string>({ default: '' })
const open = ref(false)
const root = ref<HTMLElement | null>(null)
const menu = ref<HTMLElement | null>(null)
const menuStyle = reactive({
  left: '0px',
  top: '0px',
  width: '0px',
  maxHeight: '18rem'
})
const selected = computed(() => props.options.find((item) => item.value === model.value))
const triggerClass = controlTriggerClass

function choose(value: string) {
  model.value = value
  open.value = false
}

function onPointerDown(event: PointerEvent) {
  if (!open.value || !root.value) return
  const target = event.target as Node
  if (!root.value.contains(target) && !menu.value?.contains(target)) open.value = false
}

function updateMenuPosition() {
  if (!root.value) return
  const rect = root.value.getBoundingClientRect()
  const gap = 8
  const spaceBelow = window.innerHeight - rect.bottom - gap
  const spaceAbove = rect.top - gap
  const maxHeight = Math.min(288, Math.max(160, Math.max(spaceBelow, spaceAbove) - 8))
  const opensUp = spaceBelow < 180 && spaceAbove > spaceBelow

  menuStyle.left = `${rect.left}px`
  menuStyle.width = `${rect.width}px`
  menuStyle.maxHeight = `${maxHeight}px`
  menuStyle.top = opensUp
    ? `${Math.max(8, rect.top - gap - maxHeight)}px`
    : `${rect.bottom + gap}px`
}

async function toggle() {
  open.value = !open.value
  if (!open.value) return
  await nextTick()
  updateMenuPosition()
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
    <FormField :label="label">
      <button
        type="button"
        :class="triggerClass"
        :aria-expanded="open"
        @click="toggle"
      >
        <span class="min-w-0 truncate font-semibold">{{ selected?.label || placeholder }}</span>
        <Icon icon="lucide:chevron-down" class="h-4 w-4 shrink-0 text-slate-500 transition dark:text-slate-300" :class="open ? 'rotate-180' : ''" />
      </button>
    </FormField>

    <Teleport to="body">
      <div v-if="open" ref="menu" class="select-picker-menu fixed z-[90] overflow-y-auto rounded-2xl py-2" :style="menuStyle">
        <button
          v-for="item in options"
          :key="item.value"
          type="button"
          class="select-picker-option flex min-h-11 w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm text-slate-800 transition dark:text-slate-50"
          :class="item.value === model ? 'select-picker-option-active' : ''"
          @click="choose(item.value)"
        >
          <span class="min-w-0">
            <span class="block truncate font-semibold">{{ item.label }}</span>
            <span v-if="item.description" class="block truncate text-xs text-slate-500 dark:text-slate-400">{{ item.description }}</span>
          </span>
          <Icon v-if="item.value === model" icon="lucide:check" class="h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-200" />
        </button>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.select-picker-menu {
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

.dark .select-picker-menu {
  background:
    linear-gradient(135deg, rgba(51, 65, 85, 0.5), rgba(15, 23, 42, 0.34)),
    rgba(15, 23, 42, 0.34);
  border-color: rgba(125, 211, 252, 0.18);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.16),
    inset 0 -1px 0 rgba(0, 0, 0, 0.18),
    0 20px 44px rgba(0, 0, 0, 0.3);
}

.select-picker-option {
  position: relative;
  background: rgba(255, 255, 255, 0);
}

.select-picker-option:hover {
  background: rgba(59, 130, 246, 0.11);
}

.select-picker-option-active {
  background: rgba(14, 165, 233, 0.16);
  color: rgb(7, 89, 133);
}

.dark .select-picker-option-active {
  color: rgb(207, 250, 254);
}
</style>
