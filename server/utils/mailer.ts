// server/utils/mailer.ts

interface TransactionalEmailOptions {
  to: string
  subject: string
  text: string
  html: string
}

/**
 * ส่งอีเมลระบบแบบ Transactional ที่ปรับแต่งตามมาตรฐาน Anti-Spam (Gmail / Outlook / Yahoo)
 * เพื่อให้จดหมายเข้าสู่กล่องข้อความหลัก (Inbox) แทนที่จะถูกคัดกรองไปที่จดหมายขยะ (Spam/Junk):
 * 1. แนบทั้ง Plain-Text (text/plain) และ HTML (text/html) แบบ multipart/alternative เสมอ
 * 2. ใช้ที่อยู่ผู้ส่ง (From) ที่ตรงกับบัญชี SMTP_USER เพื่อไม่ให้ผิดเงื่อนไข SPF/DKIM Alignment
 * 3. หลีกเลี่ยงอิโมจิหรืออักขระพิเศษในหัวข้ออีเมล (Subject) และระบุ Header มาตรฐานสำหรับอีเมลธุรกรรม
 */
export async function sendTransactionalEmail(options: TransactionalEmailOptions): Promise<boolean> {
  const smtpHost = process.env.SMTP_HOST
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS

  if (!smtpHost || !smtpUser) {
    return false
  }

  try {
    const nodemailer = await import('nodemailer')
    const port = Number(process.env.SMTP_PORT) || 587
    const secure = process.env.SMTP_SECURE === 'true' || port === 465

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port,
      secure,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    })

    // ใช้ชื่อผู้ส่งที่สะอาดและตรงกับโดเมนของ SMTP_USER เพื่อรักษาคะแนน SPF/DKIM
    const fromHeader = process.env.SMTP_FROM && process.env.SMTP_FROM.includes('@')
      ? process.env.SMTP_FROM
      : `"FlowSpace" <${smtpUser}>`

    await transporter.sendMail({
      from: fromHeader,
      replyTo: smtpUser,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      headers: {
        'X-Entity-Ref-ID': `flowspace-${Date.now()}`,
        'X-Auto-Response-Suppress': 'OOF, AutoReply'
      }
    })

    return true
  } catch (err) {
    console.error('[Mailer] Failed to send transactional email:', err)
    return false
  }
}
