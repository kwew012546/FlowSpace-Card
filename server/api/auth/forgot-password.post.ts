import jwt from 'jsonwebtoken'
import { z } from 'zod'

const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email({ message: 'รูปแบบอีเมลไม่ถูกต้อง' })
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parseResult = forgotPasswordSchema.safeParse(body)

  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      message: parseResult.error.issues?.[0]?.message || 'กรุณาระบุอีเมลที่ถูกต้อง'
    })
  }

  const { email } = parseResult.data

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, username: true, password: true }
    })

    // ป้องกัน User Enumeration: หากไม่พบบัญชี ให้ตอบกลับด้วยข้อความเดียวกันเพื่อความปลอดภัย
    if (!user) {
      return {
        success: true,
        message: 'หากอีเมลนี้ลงทะเบียนไว้ในระบบ เราได้ส่งคำแนะนำและลิงก์สำหรับรีเซ็ตรหัสผ่านไปเรียบร้อยแล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ 📧'
      }
    }

    // สร้าง JWT Reset Token อายุ 15 นาที พร้อมประทับ Password Version (pv)
    // หากรหัสผ่านถูกเปลี่ยน pv จะเปลี่ยน ทำให้โทเค็นเก่าถูกยกเลิกทันที (Anti-Replay Attack)
    const resetToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        type: 'password_reset',
        pv: user.password.slice(0, 10)
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    )

    const host = getRequestHost(event)
    const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? getRequestProtocol(event) : 'https'
    const baseUrl = process.env.APP_URL ? process.env.APP_URL.replace(/\/$/, '') : `${protocol}://${host}`
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`

    // แสดงลิงก์บน Console เสมอเพื่อการทดสอบในเครื่องและ Local Development
    console.log('\n--- 🔑 [FLOWSPACE PASSWORD RESET] 🔑 ---')
    console.log('Username:', user.username)
    console.log('Email:', user.email)
    console.log('Reset URL:', resetUrl)
    console.log('----------------------------------------\n')

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
          subject: 'คำขอรีเซ็ตรหัสผ่านสำหรับ FlowSpace 🔑',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #fdfaf5;">
              <h2 style="color: #b45309; text-align: center;">รีเซ็ตรหัสผ่าน FlowSpace 🔑</h2>
              <p>สวัสดีคุณ <b>${user.username}</b>,</p>
              <p>เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชี FlowSpace ของคุณ กรุณาคลิกปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่ ลิงก์นี้มีอายุการใช้งาน 15 นาที:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background-color: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">ตั้งรหัสผ่านใหม่ ⚡</a>
              </div>
              <p style="color: #6b7280; font-size: 13px;">หากคุณไม่ได้เป็นผู้ส่งคำขอนี้ สามารถเพิกเฉยต่ออีเมลฉบับนี้ได้ บัญชีของคุณยังคงปลอดภัย</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
              <p style="color: #9ca3af; font-size: 12px; text-align: center;">หากปุ่มด้านบนใช้งานไม่ได้ คัดลอกลิงก์นี้ไปวางในเบราว์เซอร์:<br><a href="${resetUrl}">${resetUrl}</a></p>
            </div>
          `
        })
        emailSent = true
      } catch (err) {
        console.error('Nodemailer Error: Failed to send password reset email.', err)
      }
    }

    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1')

    return {
      success: true,
      message: emailSent
        ? 'เราได้ส่งคำแนะนำและลิงก์สำหรับรีเซ็ตรหัสผ่านไปที่อีเมลของคุณเรียบร้อยแล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ 📧'
        : 'ระบบได้สร้างลิงก์รีเซ็ตรหัสผ่านเรียบร้อยแล้ว (โหมดพัฒนาในเครื่อง ลิงก์ปรากฏบน Console) 💻',
      resetUrl: (!emailSent || isLocalhost) ? resetUrl : undefined
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'เกิดข้อผิดพลาดในการประมวลผลคำขอรีเซ็ตรหัสผ่าน กรุณาลองใหม่อีกครั้ง'
    })
  }
})
