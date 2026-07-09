// app/middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.client) {
    const user = localStorage.getItem('user')

    // ถ้าไม่มีข้อมูลยูสเซอร์ในเครื่อง ให้ดีดไปหน้าล็อกอินเสมอ
    if (!user && to.path !== '/login' && to.path !== '/register') {
      return navigateTo('/login')
    }

    // สเต็ปเสริม: ถ้าล็อกอินค้างไว้แล้วดันแอบพิมพ์ URL ไปหน้า login หรือ register ให้ดีดไปหน้าแดชบอร์ดทันที
    if (user && (to.path === '/login' || to.path === '/register')) {
      return navigateTo('/dashboard')
    }
  }
})