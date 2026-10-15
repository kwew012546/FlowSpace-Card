// app/middleware/admin.ts
export default defineNuxtRouteMiddleware(async (to, from) => {
  if (import.meta.server) {
    const token = useCookie('auth_token')
    if (!token.value) {
      return navigateTo('/login', { replace: true })
    }
  }

  if (import.meta.client) {
    const cachedUser = localStorage.getItem('user')
    if (!cachedUser) {
      return navigateTo('/login', { replace: true })
    }

    try {
      const user = JSON.parse(cachedUser)
      if (user.role !== 'ADMIN') {
        return navigateTo('/dashboard', { replace: true })
      }
    } catch {
      return navigateTo('/login', { replace: true })
    }
  }
})
