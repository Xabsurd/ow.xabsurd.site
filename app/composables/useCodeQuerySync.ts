import type { LocationQueryRaw } from 'vue-router'
import type { ComputedRef } from 'vue'

export function useCodeQuerySync<T extends Record<string, string | number>>(
  source: ComputedRef<T>,
  refresh: () => Promise<unknown>,
  delay = 350
) {
  const router = useRouter()
  let timer: ReturnType<typeof setTimeout> | undefined

  watch(
    source,
    (value) => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(async () => {
        const nextQuery: LocationQueryRaw = {}
        for (const [key, entry] of Object.entries(value)) {
          if (entry && !(key === 'page' && Number(entry) === 1)) nextQuery[key] = String(entry)
        }
        await router.replace({ query: nextQuery })
        await refresh()
      }, delay)
    },
    { deep: true }
  )

  onBeforeUnmount(() => {
    if (timer) clearTimeout(timer)
  })
}
