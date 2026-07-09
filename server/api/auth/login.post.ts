import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

if (process.env.NODE_ENV === 'production' && !JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is missing in production! 🚨')
  process.exit(1)
}

const JWT_SECRET_TO_USE = JWT_SECRET || 'super-secret-fallback-key'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      message: 'กรุณากรอกอีเมลและรหัสผ่าน'
    })
  }

  try {
    // 1. ค้นหายูสเซอร์จากอีเมล
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'ไม่พบอีเมลนี้ในระบบ หรือรหัสผ่านไม่ถูกต้อง'
      })
    }

    // 2. ตรวจสอบรหัสผ่านโดยใช้ bcrypt.compare
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      throw createError({
        statusCode: 401,
        message: 'ไม่พบอีเมลนี้ในระบบ หรือรหัสผ่านไม่ถูกต้อง'
      })
    }

    // 3. สร้าง JWT Token สำหรับยืนยันตัวตนฝั่งหลังบ้าน
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      JWT_SECRET_TO_USE,
      { expiresIn: '7d' }
    )

    // 4. บันทึก Cookie แบบ HttpOnly และ Secure
    setCookie(event, 'auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 วัน
    })

    return {
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ!',
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    }

  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'ระบบล็อกอินขัดข้อง กรุณาลองใหม่ในภายหลัง'
    })
  }
})