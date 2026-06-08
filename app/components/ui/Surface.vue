<script setup lang="ts">
import type { SurfaceVariant } from '~/utils/surfaceStyles'
import { surfaceClasses } from '~/utils/surfaceStyles'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  as?: string
  variant?: SurfaceVariant
}>(), {
  as: 'div',
  variant: 'panel'
})

const attrs = useAttrs()
const classes = computed(() => surfaceClasses(props.variant))
const forwardedAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <component :is="as" v-bind="forwardedAttrs" :class="[classes, attrs.class]">
    <slot />
  </component>
</template>
