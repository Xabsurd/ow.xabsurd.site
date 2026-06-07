type SafeUser = {
  id: string
  email: string
  gameId: string
  role: 'USER' | 'MODERATOR' | 'ADMIN'
  isBanned: boolean
}

export function useAuth() {
  const user = useState<SafeUser | null>('auth:user', () => null)
  const loaded = useState('auth:loaded', () => false)

  async function refresh() {
    const data = await $fetch<{ user: SafeUser | null }>('/api/auth/me')
    user.value = data.user
    loaded.value = true
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    await navigateTo('/')
  }

  return { user, loaded, refresh, logout }
}
