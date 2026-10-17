import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password } = body
  const email = body.email ? String(body.email).trim().toLowerCase() : ''

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

    // 3. แฮชรหัสผ่านด้วย bcrypt (ความแรงระดับ 10) ก่อนบันทึก
    const hashedPassword = await bcrypt.hash(password, 10)
    let newUser: { id: number; email: string; username: string }

    if (existingUser) {
      if (existingUser.isVerified) {
        throw createError({
          statusCode: 400,
          message: 'อีเมลนี้ถูกใช้งานไปแล้วในระบบ'
        })
      }
      // หากบัญชีเดิมยังไม่ได้รับการยืนยัน อนุญาตให้อัปเดตข้อมูลและส่งลิงก์ยืนยันตัวตนรอบใหม่
      newUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          username,
          password: hashedPassword
        },
        select: {
          id: true,
          email: true,
          username: true
        }
      })
    } else {
      // 4. บันทึกลงฐานข้อมูล PostgreSQL สำหรับผู้ใช้ใหม่
      newUser = await prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword
        },
        select: {
          id: true,
          email: true,
          username: true
        }
      })
    }

    // 5. สร้าง JWT Verification Token (อายุ 15 นาที)
    const verificationToken = jwt.sign(
      { email: newUser.email },
      JWT_SECRET,
      { expiresIn: '15m' }
    )

    // Token สำหรับให้หน้าบ้านใช้ Polling ตรวจสอบสถานะการยืนยันแบบ Real-time
    const checkToken = jwt.sign(
      { id: newUser.id, email: newUser.email, type: 'email_verification_poll' },
      JWT_SECRET,
      { expiresIn: '30m' }
    )

    const host = getRequestHost(event)
    const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? getRequestProtocol(event) : 'https'
    const baseUrl = process.env.APP_URL ? process.env.APP_URL.replace(/\/$/, '') : `${protocol}://${host}`
    const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${verificationToken}`

    // แสดงลิงก์บน System Console เสมอเพื่อการตรวจสอบ
    console.log('\n--- 🌌 [FLOWSPACE EMAIL VERIFICATION] 🌌 ---')
    console.log('Username:', newUser.username)
    console.log('Verification URL:', verifyUrl)
    console.log('---------------------------------------------\n')

    const emailSent = await sendTransactionalEmail({
      to: newUser.email,
      subject: '[FlowSpace] ยืนยันที่อยู่อีเมลสำหรับบัญชีของคุณ',
      text: `สวัสดีคุณ ${newUser.username},\n\nขอบคุณที่สมัครใช้งาน FlowSpace กรุณาคลิกลิงก์ด้านล่างเพื่อยืนยันอีเมลและเปิดใช้งานบัญชีของคุณ (ลิงก์มีอายุใช้งาน 15 นาที):\n\n${verifyUrl}\n\nหากคุณไม่ได้เป็นผู้ดำเนินการสมัครสมาชิกนี้ คุณสามารถเพิกเฉยต่ออีเมลฉบับนี้ได้ทันที\n\nทีมงาน FlowSpace`,
      html: `<!DOCTYPE html>
<html lang="th">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:24px;background-color:#f7f0e4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1c1917;">
  <div style="max-width:560px;margin:0 auto;padding:28px;border:1px solid #e7e5e4;border-radius:14px;background-color:#fdfaf5;">
    <h2 style="color:#b45309;margin-top:0;text-align:center;">ยินดีต้อนรับสู่ FlowSpace</h2>
    <p style="font-size:15px;line-height:1.6;">สวัสดีคุณ <strong>${newUser.username}</strong>,</p>
    <p style="font-size:15px;line-height:1.6;">ขอบคุณที่ลงทะเบียนเข้าใช้งาน FlowSpace กรุณาคลิกปุ่มด้านล่างเพื่อยืนยันที่อยู่อีเมลและเปิดใช้งานบัญชีของคุณ (ลิงก์นี้มีอายุใช้งาน 15 นาที):</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${verifyUrl}" style="background-color:#d97706;color:#ffffff;padding:12px 28px;text-decoration:none;border-radius:10px;font-weight:bold;display:inline-block;font-size:15px;">ยืนยันที่อยู่อีเมล</a>
    </div>
    <p style="color:#57534e;font-size:13px;line-height:1.5;">หากปุ่มด้านบนไม่สามารถคลิกได้ คุณสามารถคัดลอกลิงก์ด้านล่างไปวางในแถบที่อยู่ของเบราว์เซอร์ได้โดยตรง:<br><a href="${verifyUrl}" style="color:#b45309;word-break:break-all;">${verifyUrl}</a></p>
    <hr style="border:none;border-top:1px solid #e7e5e4;margin:24px 0;" />
    <p style="color:#78716c;font-size:12px;margin-bottom:0;">อีเมลฉบับนี้เป็นการแจ้งเตือนอัตโนมัติตามคำขอลงทะเบียนที่ ${newUser.email} บนระบบจัดการงาน FlowSpace หากคุณไม่ได้เป็นผู้ดำเนินการ คุณสามารถเพิกเฉยต่ออีเมลนี้ได้อย่างปลอดภัย</p>
  </div>
</body>
</html>`
    })

    return {
      success: true,
      message: emailSent
        ? 'สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลของคุณเพื่อยืนยันการใช้งานบอร์ด 📧'
        : 'สมัครสมาชิกสำเร็จ! (พัฒนาภายในเครื่อง) ลิงก์ยืนยันตัวตนแสดงใน Console เรียบร้อยแล้วครับ 💻',
      verifyUrl: !emailSent ? verifyUrl : undefined,
      checkToken
    }

  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'เกิดข้อผิดพลาดหลังบ้าน ไม่สามารถสมัครสมาชิกได้'
    })
  }
})