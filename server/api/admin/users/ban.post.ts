export default defineEventHandler(async (event) => {
  const currentAdmin = await requireAdmin(event)

  const body = await readBody(event)
  const userId = parseInt(String(body?.userId), 10)
  const isBanned = Boolean(body?.isBanned)
  const banReason = body?.banReason ? String(body.banReason).trim() : null

  if (!userId) {
    throw createError({
      statusCode: 400,
      message: 'กรุณาระบุรหัสผู้ใช้งาน (userId)'
    })
  }

  // 🛡️ Anti-Self-Ban Guard: แอดมินไม่สามารถแบนตนเองได้ เพื่อป้องกัน Deadlock ปิดขังตัวเอง
  if (currentAdmin.id === userId && isBanned) {
    throw createError({
      statusCode: 400,
      message: 'คุณไม่สามารถระงับการใช้งานบัญชีของตนเองได้ ❌'
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
      data: {
        isBanned,
        banReason: isBanned ? (banReason || 'ถูกระงับการใช้งานโดยผู้ดูแลระบบ') : null
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isBanned: true,
        banReason: true
      }
    })

    return {
      success: true,
      message: isBanned
        ? `ระงับการใช้งานบัญชี ${updatedUser.username} เรียบร้อยแล้ว 🔒`
        : `ยกเลิกการระงับบัญชี ${updatedUser.username} เรียบร้อยแล้ว 🔓`,
      user: updatedUser
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะการระงับบัญชี'
    })
  }
})
