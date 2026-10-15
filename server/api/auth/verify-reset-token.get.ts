import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-fallback-key'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const token = query?.token ? String(query.token) : ''

  if (!token) {
    throw createError({
      statusCode: 400,
      message: 'ไม่พบโทเค็นสำหรับรีเซ็ตรหัสผ่าน'
    })
  }

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
      where: { id: decoded.id },
      select: { id: true, email: true, username: true, password: true }
    })

    if (!user || user.email !== decoded.email) {
      throw createError({
        statusCode: 404,
        message: 'ไม่พบบัญชีผู้ใช้ที่ผูกกับโทเค็นนี้'
      })
    }

    // ตรวจสอบว่ารหัสผ่านปัจจุบันตรงกับ version stamp ใน token หรือไม่ (ป้องกันนำลิงก์เก่าที่ใช้ไปแล้วมารันซ้ำ)
    if (decoded.pv && user.password.slice(0, 10) !== decoded.pv) {
      throw createError({
        statusCode: 400,
        message: 'ลิงก์รีเซ็ตรหัสผ่านนี้ถูกใช้งานไปแล้ว กรุณาขอลิงก์ใหม่'
      })
    }

    return {
      valid: true,
      email: user.email,
      username: user.username
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
