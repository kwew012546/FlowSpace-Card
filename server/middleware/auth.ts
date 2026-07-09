import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

if (process.env.NODE_ENV === 'production' && !JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is missing in production! 🚨')
  process.exit(1)
}

const JWT_SECRET_TO_USE = JWT_SECRET || 'super-secret-fallback-key'

export default defineEventHandler((event) => {
  const token = getCookie(event, 'auth_token')
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET_TO_USE) as { id: number, email: string, username: string }
      event.context.auth = {
        user: {
          id: decoded.id,
          email: decoded.email,
          username: decoded.username
        }
      }
    } catch (error) {
      // Token ไร้ผลหรือหมดอายุ
    }
  }
})
