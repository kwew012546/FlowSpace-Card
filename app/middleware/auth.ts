// app/middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const isPublic = to.path === '/login' || to.path === '/register' || to.path.startsWith('/verify-email')

  if (import.meta.server) {
    const token = useCookie('auth_token')
    if (!token.value && !isPublic) {
      return navigateTo('/login', { replace: true })
    }
    if (token.value && (to.path === '/login' || to.path === '/register')) {
      return navigateTo('/dashboard', { replace: true })
    }
  }

  if (import.meta.client) {
    const user = localStorage.getItem('user')

    // ถ้าไม่มีข้อมูลยูสเซอร์ในเครื่อง ให้ดีดไปหน้าล็อกอินเสมอ
    if (!user && !isPublic) {
      return navigateTo('/login', { replace: true })
    }

    // สเต็ปเสริม: ถ้าล็อกอินค้างไว้แล้วดันแอบพิมพ์ URL ไปหน้า login หรือ register ให้ดีดไปหน้าแดชบอร์ดทันที
    if (user && (to.path === '/login' || to.path === '/register')) {
      return navigateTo('/dashboard', { replace: true })
    }
  }
})