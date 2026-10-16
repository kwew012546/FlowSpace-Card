import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const token = query.token as string

  if (!token) {
    throw createError({
      statusCode: 400,
      message: 'Token is required'
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id?: string; email?: string }

    if (!decoded.id && !decoded.email) {
      throw createError({
        statusCode: 400,
        message: 'Invalid token payload'
      })
    }

    const user = await prisma.user.findFirst({
      where: decoded.id ? { id: decoded.id } : { email: decoded.email },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isVerified: true
      }
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'User not found'
      })
    }

    if (!user.isVerified) {
      return {
        verified: false
      }
    }

    // เมื่ออีเมลได้รับการยืนยันแล้ว ออก JWT Session Cookie ให้ทันที
    const sessionToken = jwt.sign(
      { id: user.id, email: user.email, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    setCookie(event, 'auth_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 วัน
    })

    return {
      verified: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    return {
      verified: false,
      error: 'Token verification failed or expired'
    }
  }
})
