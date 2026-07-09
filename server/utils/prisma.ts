// server/utils/prisma.ts
import { PrismaClient } from '@prisma/client'

// สร้างตัวแปรส่งออกเพื่อให้ Nuxt แอบเอาไปครอบสิทธิ์ Auto-import ให้ไฟล์ API อื่นๆ รู้จักอัตโนมัติ
export const prisma = new PrismaClient()