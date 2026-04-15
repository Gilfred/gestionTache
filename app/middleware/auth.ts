export default defineNuxtRouteMiddleware((to, from) => {
  const { user, isAdmin } = useAuth()

  // Skip middleware on login page to avoid infinite loop
  if (to.path === '/login') {
    if (user.value) return navigateTo('/')
    return
  }

  if (!user.value) {
    return navigateTo('/login')
  }

})
