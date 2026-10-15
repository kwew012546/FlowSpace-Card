import type { H3Event } from 'h3'

/**
 * ฟังก์ชันสำหรับตรวจสอบสิทธิ์ผู้ดูแลระบบ (Platform Admin Guard)
 * ดักจับและป้องกันไม่ให้ผู้ใช้ทั่วไปเข้าถึง API สำหรับผู้ดูแลระบบ
 */
export async function requireAdmin(event: H3Event) {
  const authUser = event.context.auth?.user

  if (!authUser?.id) {
    throw createError({
      statusCode: 401,
      message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ'
    })
  }

  // ดึงข้อมูลสดจากฐานข้อมูลเสมอเพื่อป้องกัน Token Stale
  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      isBanned: true
    }
  })

  if (!dbUser) {
    throw createError({
      statusCode: 401,
      message: 'ไม่พบบัญชีผู้ใช้ในระบบ'
    })
  }

  if (dbUser.isBanned) {
    throw createError({
      statusCode: 403,
      message: 'บัญชีของคุณถูกระงับการใช้งาน 🔒'
    })
  }

  if (dbUser.role !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      message: 'สิทธิ์ไม่เพียงพอ! คุณต้องเป็นผู้ดูแลระบบ (Admin) เท่านั้นจึงจะดำเนินการนี้ได้ 🛡️'
    })
  }

  return dbUser
}
