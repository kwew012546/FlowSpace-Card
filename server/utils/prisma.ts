// server/utils/prisma.ts
import { PrismaClient } from '@prisma/client'

// สร้างตัวแปรส่งออกเพื่อให้ Nuxt แอบเอาไปครอบสิทธิ์ Auto-import ให้ไฟล์ API อื่นๆ รู้จักอัตโนมัติ
export const prisma = new PrismaClient()

let schemaSyncPromise: Promise<void> | null = null

/**
 * ซิงค์คอลัมน์ใหม่บนฐานข้อมูล Production แบบอัตโนมัติและปลอดภัย (Idempotent Self-Healing Schema Sync)
 * ป้องกันปัญหา 500 Internal Server Error บน Vercel เมื่อเพิ่มฟิลด์ใหม่ใน schema.prisma
 */
export function ensureDbSchema(): Promise<void> {
  if (!schemaSyncPromise) {
    schemaSyncPromise = (async () => {
      try {
        await prisma.$executeRawUnsafe(
          `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT 'USER';`
        )
        await prisma.$executeRawUnsafe(
          `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isBanned" BOOLEAN NOT NULL DEFAULT false;`
        )
        await prisma.$executeRawUnsafe(
          `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "banReason" TEXT;`
        )
        await prisma.$executeRawUnsafe(
          `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN NOT NULL DEFAULT false;`
        )
        await prisma.$executeRawUnsafe(
          `ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "isInviteActive" BOOLEAN NOT NULL DEFAULT true;`
        )
        // ตั้งค่าเจ้าของระบบให้เป็น ADMIN อัตโนมัติบน Production DB
        await prisma.$executeRawUnsafe(`
          UPDATE "User"
          SET "role" = 'ADMIN'
          WHERE LOWER("email") = 'mr.thanaphoom@gmail.com'
            AND "role" != 'ADMIN';
        `)
      } catch (err) {
        console.error('[DB Schema Sync] Failed to auto-sync columns:', err)
        schemaSyncPromise = null
      }
    })()
  }
  return schemaSyncPromise
}