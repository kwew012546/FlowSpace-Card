// server/utils/attachmentCleanup.ts
import fs from 'fs'
import path from 'path'

/**
 * ลบไฟล์จริงออกจากโฟลเดอร์ public/uploads/ หรือลบออกจาก Cloudflare R2 อย่างปลอดภัย
 * (ป้องกันไฟล์ขยะตกค้างเมื่อลบการ์ด/คอลัมน์/โปรเจกต์)
 */
export async function removePhysicalUploadFiles(filePaths: Array<string | null | undefined>) {
  for (const filePath of filePaths) {
    if (!filePath) continue

    // หากเป็นไฟล์ที่อยู่บน Cloudflare R2
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      await deleteFromR2(filePath).catch(() => {})
      continue
    }

    if (!filePath.startsWith('/uploads/')) continue
    try {
      const safeFileName = path.basename(filePath)
      const fullPath = path.join(process.cwd(), 'public', 'uploads', safeFileName)
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath)
      }
    } catch {
      // เพิกเฉยหากเป็น Read-only Serverless หรือไฟล์ถูกลบไปแล้ว
    }
  }
}
