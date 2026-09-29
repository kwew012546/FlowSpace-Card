import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-fallback-key'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const token = query.token as string

  if (!token) {
    return sendRedirect(event, '/verify-email?status=error&message=token_missing')
  }

  try {
    // 1. ตรวจสอบความถูกต้องของ JWT Token
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string }
    const email = decoded.email

    if (!email) {
      return sendRedirect(event, '/verify-email?status=error&message=invalid_payload')
    }

    // 2. ตรวจสอบว่าผู้ใช้งานมีอยู่จริง
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return sendRedirect(event, '/verify-email?status=error&message=user_not_found')
    }

    // 3. ปรับปรุงฐานข้อมูลสถานะการยืนยัน
    await prisma.user.update({
      where: { email },
      data: { isVerified: true }
    })

    // 4. เปลี่ยนเส้นทางไปยังหน้ายืนยันความสำเร็จฝั่งหน้าบ้าน
    return sendRedirect(event, '/verify-email?status=success')

  } catch (error: any) {
    console.error('Verify Email Error:', error)
    const errMessage = error.name === 'TokenExpiredError' ? 'expired' : 'invalid'
    return sendRedirect(event, `/verify-email?status=error&message=${errMessage}`)
  }
})
