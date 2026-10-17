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

    const emailSent = await sendTransactionalEmail({
      to: user.email,
      subject: '[FlowSpace] ลิงก์ยืนยันที่อยู่อีเมลสำหรับเปิดใช้งานบัญชีของคุณ',
      text: `สวัสดีคุณ ${user.username},\n\nคุณได้ส่งคำขอรับลิงก์ยืนยันอีเมลรอบใหม่สำหรับบัญชี FlowSpace กรุณาคลิกลิงก์ด้านล่างเพื่อเปิดใช้งานบัญชีของคุณ (ลิงก์มีอายุใช้งาน 15 นาที):\n\n${verifyUrl}\n\nหากคุณไม่ได้เป็นผู้ส่งคำขอนี้ คุณสามารถเพิกเฉยต่ออีเมลฉบับนี้ได้ทันที\n\nทีมงาน FlowSpace`,
      html: `<!DOCTYPE html>
<html lang="th">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:24px;background-color:#f7f0e4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1c1917;">
  <div style="max-width:560px;margin:0 auto;padding:28px;border:1px solid #e7e5e4;border-radius:14px;background-color:#fdfaf5;">
    <h2 style="color:#b45309;margin-top:0;text-align:center;">ยืนยันที่อยู่อีเมล FlowSpace</h2>
    <p style="font-size:15px;line-height:1.6;">สวัสดีคุณ <strong>${user.username}</strong>,</p>
    <p style="font-size:15px;line-height:1.6;">คุณได้ส่งคำขอรับลิงก์ยืนยันตัวตนรอบใหม่ กรุณาคลิกปุ่มด้านล่างเพื่อเปิดใช้งานบัญชีของคุณ (ลิงก์นี้มีอายุใช้งาน 15 นาที):</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${verifyUrl}" style="background-color:#d97706;color:#ffffff;padding:12px 28px;text-decoration:none;border-radius:10px;font-weight:bold;display:inline-block;font-size:15px;">ยืนยันที่อยู่อีเมล</a>
    </div>
    <p style="color:#57534e;font-size:13px;line-height:1.5;">หากปุ่มด้านบนไม่สามารถคลิกได้ คุณสามารถคัดลอกลิงก์ด้านล่างไปวางในแถบที่อยู่ของเบราว์เซอร์ได้โดยตรง:<br><a href="${verifyUrl}" style="color:#b45309;word-break:break-all;">${verifyUrl}</a></p>
    <hr style="border:none;border-top:1px solid #e7e5e4;margin:24px 0;" />
    <p style="color:#78716c;font-size:12px;margin-bottom:0;">อีเมลฉบับนี้ถูกส่งตามคำขอที่ ${user.email} บนระบบจัดการงาน FlowSpace</p>
  </div>
</body>
</html>`
    })

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
