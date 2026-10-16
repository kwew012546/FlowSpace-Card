// app/middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  const isPublic = to.path === '/login' || to.path === '/register' || to.path.startsWith('/verify-email') || to.path === '/forgot-password' || to.path.startsWith('/reset-password')
  const isAuthPage = to.path === '/login' || to.path === '/register' || to.path === '/forgot-password' || to.path.startsWith('/reset-password')

  if (import.meta.server) {
    const user = useRequestEvent()?.context.auth?.user
    if (!user && !isPublic) {
      return navigateTo('/login', { replace: true })
    }
    if (user && isAuthPage) {
      return navigateTo('/dashboard', { replace: true })
    }
  }

  if (import.meta.client) {
    // shortcut: trust SSR route decision during hydration so Vue never hydrates page B onto page A's DOM
    if (useNuxtApp().isHydrating) {
      if (isAuthPage) localStorage.removeItem('user')
      return
    }

    const user = localStorage.getItem('user')

    // ถ้าไม่มีข้อมูลยูสเซอร์ในเครื่อง ให้ดีดไปหน้าล็อกอินเสมอ
    if (!user && !isPublic) {
      return navigateTo('/login', { replace: true })
    }

    // สเต็ปเสริม: ถ้าล็อกอินค้างไว้แล้วดันแอบพิมพ์ URL ไปหน้า auth ให้ดีดไปหน้าแดชบอร์ดทันที
    if (user && isAuthPage) {
      return navigateTo('/dashboard', { replace: true })
    }
  }
})