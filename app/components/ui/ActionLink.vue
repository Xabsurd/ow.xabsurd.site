<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import type { ActionSize, ActionVariant } from '~/utils/actionStyles'
import { actionClasses } from '~/utils/actionStyles'

const props = withDefaults(defineProps<{
  to: RouteLocationRaw
  active?: boolean
  variant?: ActionVariant
  size?: ActionSize
}>(), {
  active: false,
  variant: 'glass',
  size: 'md'
})

const classes = computed(() => actionClasses(props))
</script>

<template>
  <NuxtLink :to="to" :class="classes">
    <slot />
  </NuxtLink>
</template>
