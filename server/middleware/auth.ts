import jwt from 'jsonwebtoken'
import { prisma } from '../utils/prisma'
import { JWT_SECRET } from '../utils/jwt'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number, email: string, username: string, role?: string }
      const dbUser = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, username: true, role: true, isBanned: true }
      })

      if (!dbUser || dbUser.isBanned) {
        deleteCookie(event, 'auth_token', { path: '/' })
        return
      }

      event.context.auth = {
        user: {
          id: dbUser.id,
          email: dbUser.email,
          username: dbUser.username,
          role: dbUser.role || 'USER'
        }
      }
    } catch (error) {
      deleteCookie(event, 'auth_token', { path: '/' })
    }
  }
})
