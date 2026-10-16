// app/middleware/admin.ts
export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) {
    const user = useRequestEvent()?.context.auth?.user
    if (!user) {
      return navigateTo('/login', { replace: true })
    }
    if (user.role !== 'ADMIN') {
      return navigateTo('/dashboard', { replace: true })
    }
  }

  if (import.meta.client) {
    if (useNuxtApp().isHydrating) return

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
