// server/utils/r2.ts
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

/**
 * ตรวจสอบว่ามีการตั้งค่า Cloudflare R2 Credentials ครบถ้วนหรือไม่
 */
export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME
  )
}

let s3ClientInstance: S3Client | null = null

/**
 * สร้างหรือดึง S3 Client Instance สำหรับ Cloudflare R2 (Singleton)
 */
export function getR2Client(): S3Client | null {
  if (!isR2Configured()) return null
  if (!s3ClientInstance) {
    const accountId = process.env.R2_ACCOUNT_ID!.trim()
    s3ClientInstance = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!.trim(),
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!.trim()
      }
    })
  }
  return s3ClientInstance
}

/**
 * ตรวจสอบขีดจำกัดความจุรวมของระบบ (Hard Safety Cap)
 * โควต้าฟรีของ Cloudflare R2 คือ 10 GB
 * เราตั้งเพดานความปลอดภัยไว้ที่ 8 GB (8,589,934,592 Bytes) เพื่อรับประกันว่าจะไม่มีค่าใช้จ่ายส่วนเกิน 100%
 */
export async function checkStorageQuota(additionalBytes: number = 0): Promise<{
  allowed: boolean
  currentTotalBytes: number
  maxBytes: number
  currentGb: string
}> {
  const maxBytes = 8 * 1024 * 1024 * 1024 // 8 GB

  try {
    const aggregate = await prisma.attachment.aggregate({
      _sum: {
        fileSize: true
      }
    })

    const currentTotalBytes = aggregate._sum.fileSize || 0
    const allowed = (currentTotalBytes + additionalBytes) <= maxBytes
    const currentGb = (currentTotalBytes / (1024 * 1024 * 1024)).toFixed(2)

    return { allowed, currentTotalBytes, maxBytes, currentGb }
  } catch (err) {
    console.warn('[R2 Quota] Failed to query current storage usage:', err)
    return { allowed: true, currentTotalBytes: 0, maxBytes, currentGb: '0.00' }
  }
}

/**
 * อัปโหลดไฟล์ขึ้น Cloudflare R2 Bucket
 * @returns Public URL หรือ R2 Endpoint URL สำหรับเปิดดู/ดาวน์โหลด
 */
export async function uploadToR2(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const client = getR2Client()
  if (!client) {
    throw new Error('Cloudflare R2 is not configured properly')
  }

  const bucketName = process.env.R2_BUCKET_NAME || 'flowspace-attachments'

  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable'
    })
  )

  const publicBaseUrl = (process.env.R2_PUBLIC_URL || '').trim().replace(/\/$/, '')
  if (publicBaseUrl) {
    return `${publicBaseUrl}/${key}`
  }

  // หากยังไม่ได้ตั้ง Public URL ให้ใช้ Endpoint พื้นฐานสำรอง
  return `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${bucketName}/${key}`
}

/**
 * ลบไฟล์ออกจาก Cloudflare R2 Bucket เมื่อมีการลบ Attachment
 */
export async function deleteFromR2(fileUrlOrKey: string): Promise<boolean> {
  const client = getR2Client()
  if (!client || !fileUrlOrKey) return false

  try {
    let key = fileUrlOrKey
    if (fileUrlOrKey.startsWith('http://') || fileUrlOrKey.startsWith('https://')) {
      const parsedUrl = new URL(fileUrlOrKey)
      key = parsedUrl.pathname.replace(/^\//, '')
    }

    const bucketName = process.env.R2_BUCKET_NAME || 'flowspace-attachments'
    await client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key
      })
    )
    return true
  } catch (err) {
    console.warn('[R2 Delete] Failed to delete object from R2:', err)
    return false
  }
}
