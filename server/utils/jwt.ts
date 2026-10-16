// server/utils/jwt.ts
import crypto from 'crypto'

// หากไม่ได้ตั้งค่า JWT_SECRET บน Cloud ให้สร้างคีย์ลับเฉพาะตัวจาก DATABASE_URL แทนการใช้ข้อความสาธารณะ
export const JWT_SECRET =
  process.env.JWT_SECRET ||
  (process.env.DATABASE_URL
    ? crypto.createHash('sha256').update(`flowspace-jwt:${process.env.DATABASE_URL}`).digest('hex')
    : 'super-secret-fallback-key')
