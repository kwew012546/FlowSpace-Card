import jwt from 'jsonwebtoken'
import { prisma, ensureDbSchema } from '../utils/prisma'
import { JWT_SECRET } from '../utils/jwt'

export default defineEventHandler(async (event) => {
  await ensureDbSchema()

  const token = getCookie(event, 'auth_token')
  if (token) {
    let decoded: { id: number, email: string, username: string, role?: string }
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { id: number, email: string, username: string, role?: string }
    } catch {
      deleteCookie(event, 'auth_token', { path: '/' })
      return
    }

    try {
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
      console.error('[Auth Middleware DB Error]:', error)
      // Fallback to valid JWT payload if DB has a transient hiccup so user is not falsely logged out
      event.context.auth = {
        user: {
          id: decoded.id,
          email: decoded.email,
          username: decoded.username,
          role: decoded.role || 'USER'
        }
      }
    }
  }
})
