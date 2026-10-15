export default defineEventHandler(async (event) => {
  const currentAdmin = await requireAdmin(event)

  const body = await readBody(event)
  const userId = parseInt(String(body?.userId), 10)
  const role = String(body?.role || '').toUpperCase()

  if (!userId || (role !== 'USER' && role !== 'ADMIN')) {
    throw createError({
      statusCode: 400,
      message: 'ข้อมูลไม่ถูกต้อง กรุณาระบุ userId และ role (USER หรือ ADMIN)'
    })
  }

  // 🛡️ Anti-Self-Demote Guard: แอดมินไม่สามารถลดสิทธิ์ตัวเองได้
  if (currentAdmin.id === userId && role !== 'ADMIN') {
    throw createError({
      statusCode: 400,
      message: 'คุณไม่สามารถลดระดับสิทธิ์ผู้ดูแลระบบของตนเองได้ ❌'
    })
  }

  try {
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, username: true, role: true }
    })

    if (!targetUser) {
      throw createError({
        statusCode: 404,
        message: 'ไม่พบบัญชีผู้ใช้งานนี้ในระบบ'
      })
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, username: true, role: true }
    })

    return {
      success: true,
      message: `เปลี่ยนสิทธิ์ผู้ใช้ ${updatedUser.username} เป็น ${updatedUser.role} เรียบร้อยแล้ว 👑`,
      user: updatedUser
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'เกิดข้อผิดพลาดในการเปลี่ยนระดับสิทธิ์'
    })
  }
})
