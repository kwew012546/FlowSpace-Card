import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-fallback-key'

const resetPasswordSchema = z.object({
  token: z.string().min(1, { message: 'กรุณาระบุโทเค็นสำหรับรีเซ็ตรหัสผ่าน' }),
  newPassword: z.string().min(6, { message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร' })
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parseResult = resetPasswordSchema.safeParse(body)

  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      message: parseResult.error.issues?.[0]?.message || 'ข้อมูลสำหรับตั้งรหัสผ่านใหม่ไม่ถูกต้อง'
    })
  }

  const { token, newPassword } = parseResult.data

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number
      email: string
      type: string
      pv?: string
    }

    if (decoded.type !== 'password_reset' || !decoded.id || !decoded.email) {
      throw createError({
        statusCode: 400,
        message: 'โทเค็นไม่ถูกต้องสำหรับประเภทการรีเซ็ตรหัสผ่าน'
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    })

    if (!user || user.email !== decoded.email) {
      throw createError({
        statusCode: 404,
        message: 'ไม่พบบัญชีผู้ใช้ที่ผูกกับโทเค็นนี้'
      })
    }

    // ป้องกันการนำ Token เก่าที่เคยรีเซ็ตแล้วมารันซ้ำ (Anti-Replay Attack)
    if (decoded.pv && user.password.slice(0, 10) !== decoded.pv) {
      throw createError({
        statusCode: 400,
        message: 'ลิงก์รีเซ็ตรหัสผ่านนี้ถูกใช้งานไปแล้ว กรุณาขอลิงก์ใหม่หากต้องการเปลี่ยนรหัสผ่านอีกครั้ง'
      })
    }

    // แฮชรหัสผ่านใหม่ด้วย bcrypt 10 rounds
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // อัปเดตรหัสผ่านใหม่ และยืนยันอีเมลให้โดยอัตโนมัติ (Rule 8: Dead-End Recovery)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        isVerified: true
      }
    })

    return {
      success: true,
      message: 'ตั้งรหัสผ่านใหม่สำเร็จเรียบร้อยแล้ว! 🎉 คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที'
    }

  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw createError({
        statusCode: 400,
        message: 'ลิงก์รีเซ็ตรหัสผ่านนี้หมดอายุแล้ว (อายุการใช้งาน 15 นาที) กรุณาขอลิงก์ใหม่อีกครั้ง'
      })
    }
    if (error.statusCode) throw error
    throw createError({
      statusCode: 400,
      message: 'ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้อง หรือถูกดัดแปลง'
    })
  }
})
