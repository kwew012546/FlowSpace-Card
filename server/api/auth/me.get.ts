import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  if (!event.context.auth?.user) {
    throw createError({
      statusCode: 401,
      message: 'ยังไม่ได้เข้าสู่ระบบ หรือเซสชันหมดอายุ'
    })
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: event.context.auth.user.id },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      isBanned: true,
      banReason: true,
      isVerified: true
    }
  })

  if (!dbUser) {
    throw createError({
      statusCode: 401,
      message: 'ไม่พบบัญชีผู้ใช้ในระบบ'
    })
  }

  if (dbUser.isBanned) {
    throw createError({
      statusCode: 403,
      message: `บัญชีของคุณถูกระงับการใช้งาน 🔒: ${dbUser.banReason || 'กรุณาติดต่อผู้ดูแลระบบ'}`
    })
  }

  // อัปเดต auth_token cookie อัตโนมัติหาก role ใน DB ไม่ตรงกับที่ถอดรหัสได้จาก token เดิม
  if (event.context.auth.user.role !== dbUser.role) {
    const token = jwt.sign(
      { id: dbUser.id, email: dbUser.email, username: dbUser.username, role: dbUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    setCookie(event, 'auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    })
    event.context.auth.user.role = dbUser.role
  }

  return {
    success: true,
    user: {
      id: dbUser.id,
      email: dbUser.email,
      username: dbUser.username,
      role: dbUser.role,
      isVerified: dbUser.isVerified
    }
  }
})
