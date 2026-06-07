export default defineNuxtRouteMiddleware(async () => {
  const { user, loaded, refresh } = useAuth()
  if (!loaded.value) await refresh()
  if (!user.value) return navigateTo('/login')
  if (!['ADMIN', 'MODERATOR'].includes(user.value.role)) return navigateTo('/')
})
