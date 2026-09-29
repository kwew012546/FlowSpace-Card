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

    // 5. สร้าง JWT Verification Token (อายุ 15 นาที)
    const verificationToken = jwt.sign(
      { email: newUser.email },
      JWT_SECRET,
      { expiresIn: '15m' }
    )

    const verifyUrl = `${getRequestProtocol(event)}://${getRequestHost(event)}/api/auth/verify-email?token=${verificationToken}`

    // แสดงลิงก์บน System Console เสมอเพื่อการทดสอบในสภาพแวดล้อม Local
    console.log('\n--- 🌌 [FLOWSPACE EMAIL VERIFICATION] 🌌 ---')
    console.log('Username:', newUser.username)
    console.log('Verification URL:', verifyUrl)
    console.log('---------------------------------------------\n')

    let emailSent = false
    const smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER)
    if (smtpConfigured) {
      try {
        const nodemailer = await import('nodemailer')
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        })
        await transporter.sendMail({
          from: process.env.SMTP_FROM || `"FlowSpace Support" <${process.env.SMTP_USER}>`,
          to: newUser.email,
          subject: 'ยืนยันการสมัครสมาชิก FlowSpace 🌌',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #fdfaf5;">
              <h2 style="color: #b45309; text-align: center;">ยินดีต้อนรับสู่ FlowSpace 🌌</h2>
              <p>สวัสดีคุณ <b>${newUser.username}</b>,</p>
              <p>ขอบคุณที่สมัครสมาชิกกับเรา กรุณาคลิกปุ่มด้านล่างเพื่อยืนยันอีเมลและเปิดใช้งานบัญชีของคุณ ลิงก์นี้มีอายุใช้งาน 15 นาที:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verifyUrl}" style="background-color: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">ยืนยันอีเมลของคุณ ✉️</a>
              </div>
              <p style="color: #6b7280; font-size: 12px; text-align: center;">หากปุ่มด้านบนใช้งานไม่ได้ คุณสามารถคัดลอกลิงก์ด้านล่างไปวางในเบราว์เซอร์ได้:<br><a href="${verifyUrl}">${verifyUrl}</a></p>
            </div>
          `
        })
        emailSent = true
      } catch (err) {
        console.error('Nodemailer Error: Failed to send verification email.', err)
      }
    }

    return {
      success: true,
      message: emailSent
        ? 'สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลของคุณเพื่อยืนยันการใช้งานบอร์ด 📧'
        : 'สมัครสมาชิกสำเร็จ! (พัฒนาภายในเครื่อง) ลิงก์ยืนยันตัวตนแสดงใน Console เรียบร้อยแล้วครับ 💻',
      verifyUrl: !emailSent ? verifyUrl : undefined
    }

  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'เกิดข้อผิดพลาดหลังบ้าน ไม่สามารถสมัครสมาชิกได้'
    })
  }
})