<script setup lang="ts">
import type { ActionSize, ActionVariant } from '~/utils/actionStyles'
import { actionClasses } from '~/utils/actionStyles'

const props = withDefaults(defineProps<{
  active?: boolean
  variant?: ActionVariant
  size?: ActionSize
  type?: 'button' | 'submit' | 'reset'
}>(), {
  active: false,
  variant: 'glass',
  size: 'md',
  type: 'button'
})

const classes = computed(() => actionClasses(props))
</script>

<template>
  <button :type="type" :class="classes">
    <slot />
  </button>
</template>
