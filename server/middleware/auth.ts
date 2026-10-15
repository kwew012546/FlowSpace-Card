import jwt from 'jsonwebtoken'
import { prisma } from '../utils/prisma'

const JWT_SECRET = process.env.JWT_SECRET

if (process.env.NODE_ENV === 'production' && !JWT_SECRET) {
  console.warn('WARN: JWT_SECRET environment variable is not set in production; using fallback key.')
}

const JWT_SECRET_TO_USE = JWT_SECRET || 'super-secret-fallback-key'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET_TO_USE) as { id: number, email: string, username: string, role?: string }
      let userRole = decoded.role || 'USER'

      // ถ้าใน Token ยังไม่ใช่ ADMIN ให้ตรวจสอบบทบาทล่าสุดจากฐานข้อมูลทันที
      // เพื่อรองรับกรณีที่ผู้ใช้เพิ่งได้รับการแต่งตั้งเป็น ADMIN หรือมี stale cookie
      if (userRole !== 'ADMIN') {
        const dbUser = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { role: true }
        })
        if (dbUser?.role) {
          userRole = dbUser.role
        }
      }

      event.context.auth = {
        user: {
          id: decoded.id,
          email: decoded.email,
          username: decoded.username,
          role: userRole
        }
      }
    } catch (error) {
      // Token ไร้ผลหรือหมดอายุ
    }
  }
})
