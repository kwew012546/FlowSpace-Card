export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody(event)
  const userId = parseInt(String(body?.userId), 10)

  if (!userId) {
    throw createError({
      statusCode: 400,
      message: 'กรุณาระบุรหัสผู้ใช้งาน (userId)'
    })
  }

  try {
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, username: true, isVerified: true }
    })

    if (!targetUser) {
      throw createError({
        statusCode: 404,
        message: 'ไม่พบบัญชีผู้ใช้งานนี้ในระบบ'
      })
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
      select: { id: true, email: true, username: true, isVerified: true }
    })

    return {
      success: true,
      message: `ยืนยันอีเมลให้ผู้ใช้ ${updatedUser.username} เรียบร้อยแล้ว ✅`,
      user: updatedUser
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'เกิดข้อผิดพลาดในการยืนยันอีเมลให้ผู้ใช้'
    })
  }
})
