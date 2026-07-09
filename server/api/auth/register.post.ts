import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-fallback-key'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, username, password } = body

  // 1. Validation: ตรวจสอบว่าส่งค่ามาครบไหม
  if (!email || !username || !password) {
    throw createError({
      statusCode: 400,
      message: 'กรุณากรอกข้อมูลให้ครบถ้วน (อีเมล, ชื่อผู้ใช้, รหัสผ่าน)'
    })
  }

  try {
    // 2. ตรวจสอบว่าอีเมลนี้เคยสมัครไปหรือยัง
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      throw createError({
        statusCode: 400,
        message: 'อีเมลนี้ถูกใช้งานไปแล้วในระบบ'
      })
    }

    // 3. แฮชรหัสผ่านด้วย bcrypt (ความแรงระดับ 10) ก่อนบันทึก
    const hashedPassword = await bcrypt.hash(password, 10)

    // 4. บันทึกลงฐานข้อมูล PostgreSQL
    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword
      },
      // เลือกส่งกลับเฉพาะ id และ email (ไม่ส่ง password กลับไปหน้าบ้านเพื่อความปลอดภัย)
      select: {
        id: true,
        email: true,
        username: true
      }
    })

    // 5. สร้าง JWT Token และเซ็ตลงใน Cookie ทันทีหลังจากลงทะเบียน (Auto-Login)
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, username: newUser.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    setCookie(event, 'auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 วัน
    })

    return { success: true, message: 'สมัครสมาชิกสำเร็จ!', user: newUser }

  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'เกิดข้อผิดพลาดหลังบ้าน ไม่สามารถสมัครสมาชิกได้'
    })
  }
})