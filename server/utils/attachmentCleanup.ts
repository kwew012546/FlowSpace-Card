// server/utils/attachmentCleanup.ts
import fs from 'fs'
import path from 'path'

/**
 * ลบไฟล์จริงออกจากโฟลเดอร์ public/uploads/ อย่างปลอดภัย (ป้องกันไฟล์ขยะตกค้างเมื่อลบการ์ด/คอลัมน์/โปรเจกต์)
 */
export function removePhysicalUploadFiles(filePaths: Array<string | null | undefined>) {
  for (const filePath of filePaths) {
    if (!filePath || !filePath.startsWith('/uploads/')) continue
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
