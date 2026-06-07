export default defineNuxtRouteMiddleware(async (to) => {
  const { user, loaded, refresh } = useAuth()
  if (!loaded.value) await refresh()
  if (!user.value) return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
})
