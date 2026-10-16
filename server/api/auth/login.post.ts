import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const password = body.password
  const email = body.email ? String(body.email).trim().toLowerCase() : ''

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

    // 2.5 ตรวจสอบสถานะการยืนยันอีเมล
    if (!user.isVerified) {
      throw createError({
        statusCode: 403,
        message: 'กรุณายืนยันอีเมลของคุณก่อนเข้าสู่ระบบ! 📧'
      })
    }

    // 2.6 ตรวจสอบสถานะการระงับบัญชี (Ban check)
    if (user.isBanned) {
      throw createError({
        statusCode: 403,
        message: `บัญชีของคุณถูกระงับการใช้งาน 🔒 เหตุผล: ${user.banReason || 'กรุณาติดต่อผู้ดูแลระบบ'}`
      })
    }

    // 3. สร้าง JWT Token สำหรับยืนยันตัวตนฝั่งหลังบ้าน
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username, role: user.role },
      JWT_SECRET,
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
        username: user.username,
        role: user.role
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