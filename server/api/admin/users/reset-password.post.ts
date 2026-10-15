import bcrypt from 'bcrypt'
import crypto from 'crypto'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody(event)
  const userId = parseInt(String(body?.userId), 10)
  let newPassword = body?.newPassword ? String(body.newPassword).trim() : ''

  if (!userId) {
    throw createError({
      statusCode: 400,
      message: 'กรุณาระบุรหัสผู้ใช้งาน (userId)'
    })
  }

  // หากไม่ได้ระบุรหัสผ่าน ให้สร้างรหัสผ่านชั่วคราวสุ่ม 8 ตัวอักษร เช่น FS-8x7a2b
  if (!newPassword) {
    newPassword = 'FS-' + crypto.randomBytes(3).toString('hex')
  } else if (newPassword.length < 6) {
    throw createError({
      statusCode: 400,
      message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร'
    })
  }

  try {
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, username: true }
    })

    if (!targetUser) {
      throw createError({
        statusCode: 404,
        message: 'ไม่พบบัญชีผู้ใช้งานนี้ในระบบ'
      })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        isVerified: true // กู้สถานะอีเมลให้ทันที
      }
    })

    return {
      success: true,
      message: `รีเซ็ตรหัสผ่านให้ผู้ใช้ ${targetUser.username} เรียบร้อยแล้ว 🔑`,
      temporaryPassword: newPassword
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน'
    })
  }
})
