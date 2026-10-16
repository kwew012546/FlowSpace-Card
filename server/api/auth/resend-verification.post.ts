import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = body?.email ? String(body.email).trim().toLowerCase() : ''

  if (!email) {
    throw createError({
      statusCode: 400,
      message: 'กรุณาระบุอีเมล'
    })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, username: true, isVerified: true }
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'ไม่พบบัญชีผู้ใช้งานที่ผูกกับอีเมลนี้'
      })
    }

    if (user.isVerified) {
      throw createError({
        statusCode: 400,
        message: 'บัญชีนี้ได้รับการยืนยันตัวตนเรียบร้อยแล้ว สามารถเข้าสู่ระบบได้ทันที'
      })
    }

    // สร้าง JWT Verification Token ใหม่ (อายุ 15 นาที)
    const verificationToken = jwt.sign(
      { email: user.email },
      JWT_SECRET,
      { expiresIn: '15m' }
    )

    const checkToken = jwt.sign(
      { id: user.id, email: user.email, type: 'email_verification_poll' },
      JWT_SECRET,
      { expiresIn: '30m' }
    )

    const host = getRequestHost(event)
    const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? getRequestProtocol(event) : 'https'
    const baseUrl = process.env.APP_URL ? process.env.APP_URL.replace(/\/$/, '') : `${protocol}://${host}`
    const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${verificationToken}`

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
          to: user.email,
          subject: 'ส่งลิงก์ยืนยันการสมัครสมาชิก FlowSpace ใหม่ 🌌',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #fdfaf5;">
              <h2 style="color: #b45309; text-align: center;">ยืนยันอีเมลสำหรับบัญชี FlowSpace 🌌</h2>
              <p>สวัสดีคุณ <b>${user.username}</b>,</p>
              <p>คุณได้ทำการขอลิงก์ยืนยันตัวตนรอบใหม่ กรุณาคลิกปุ่มด้านล่างเพื่อเปิดใช้งานบัญชีของคุณ ลิงก์นี้มีอายุใช้งาน 15 นาที:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verifyUrl}" style="background-color: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">ยืนยันอีเมลของคุณ ✉️</a>
              </div>
              <p style="color: #6b7280; font-size: 12px; text-align: center;">หากปุ่มด้านบนใช้งานไม่ได้ คุณสามารถคัดลอกลิงก์ด้านล่างไปวางในเบราว์เซอร์ได้:<br><a href="${verifyUrl}">${verifyUrl}</a></p>
            </div>
          `
        })
        emailSent = true
      } catch (err) {
        console.error('Nodemailer Resend Error:', err)
      }
    }

    return {
      success: true,
      message: 'ส่งลิงก์ยืนยันตัวตนรอบใหม่ไปยังอีเมลของคุณเรียบร้อยแล้ว 📧 (อย่าลืมตรวจสอบใน Junk/Spam)',
      checkToken,
      verifyUrl: !emailSent ? verifyUrl : undefined
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'เกิดข้อผิดพลาดในการส่งอีเมลยืนยันใหม่'
    })
  }
})
