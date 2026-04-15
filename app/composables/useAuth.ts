export const useAuth = () => {
  const user = useState<any>('user', () => null)

  const fetchUser = async () => {
    try {
      const data = await $fetch('/api/auth/me')
      user.value = data
    } catch (e) {
      user.value = null
    }
  }

  const login = async (credentials: { email: string, password: string }) => {
    const data = await $fetch('/api/auth/login', {
      method: 'POST',
      body: credentials
    })
    user.value = data
    return data
  }

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    navigateTo('/login')
  }

  return {
    user,
    fetchUser,
    login,
    logout,
    isSuperAdmin: computed(() => user.value?.role === 'SUPER_ADMIN'),
    isResponsable: computed(() => user.value?.role === 'RESPONSABLE'),
    isAdmin: computed(() => user.value?.role === 'SUPER_ADMIN' || user.value?.role === 'RESPONSABLE')
  }
}
