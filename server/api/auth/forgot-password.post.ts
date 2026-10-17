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

    const emailSent = await sendTransactionalEmail({
      to: user.email,
      subject: '[FlowSpace] คำขอตั้งรหัสผ่านใหม่สำหรับบัญชีของคุณ',
      text: `สวัสดีคุณ ${user.username},\n\nเราได้รับคำขอตั้งรหัสผ่านใหม่สำหรับบัญชี FlowSpace ของคุณ กรุณาคลิกลิงก์ด้านล่างเพื่อกำหนดรหัสผ่านใหม่ (ลิงก์มีอายุใช้งาน 15 นาที):\n\n${resetUrl}\n\nหากคุณไม่ได้เป็นผู้ส่งคำขอนี้ คุณสามารถเพิกเฉยต่ออีเมลฉบับนี้ได้ บัญชีของคุณยังคงปลอดภัย\n\nทีมงาน FlowSpace`,
      html: `<!DOCTYPE html>
<html lang="th">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:24px;background-color:#f7f0e4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1c1917;">
  <div style="max-width:560px;margin:0 auto;padding:28px;border:1px solid #e7e5e4;border-radius:14px;background-color:#fdfaf5;">
    <h2 style="color:#b45309;margin-top:0;text-align:center;">ตั้งรหัสผ่านใหม่ FlowSpace</h2>
    <p style="font-size:15px;line-height:1.6;">สวัสดีคุณ <strong>${user.username}</strong>,</p>
    <p style="font-size:15px;line-height:1.6;">เราได้รับคำขอตั้งรหัสผ่านใหม่สำหรับบัญชี FlowSpace ของคุณ กรุณาคลิกปุ่มด้านล่างเพื่อกำหนดรหัสผ่านใหม่ (ลิงก์นี้มีอายุใช้งาน 15 นาที):</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${resetUrl}" style="background-color:#d97706;color:#ffffff;padding:12px 28px;text-decoration:none;border-radius:10px;font-weight:bold;display:inline-block;font-size:15px;">ตั้งรหัสผ่านใหม่</a>
    </div>
    <p style="color:#57534e;font-size:13px;line-height:1.5;">หากคุณไม่ได้เป็นผู้ส่งคำขอนี้ สามารถเพิกเฉยต่ออีเมลฉบับนี้ได้ทันที บัญชีของคุณยังคงปลอดภัย</p>
    <hr style="border:none;border-top:1px solid #e7e5e4;margin:24px 0;" />
    <p style="color:#78716c;font-size:12px;margin-bottom:0;">หากปุ่มด้านบนไม่สามารถคลิกได้ คัดลอกลิงก์นี้ไปวางในเบราว์เซอร์:<br><a href="${resetUrl}" style="color:#b45309;word-break:break-all;">${resetUrl}</a></p>
  </div>
</body>
</html>`
    })

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
