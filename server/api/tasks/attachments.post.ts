import fs from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  if (!event.context.auth?.user) {
    throw createError({ statusCode: 401, message: 'กรุณาเข้าสู่ระบบ' })
  }
  const userId = event.context.auth.user.id

  const parts = await readMultipartFormData(event)
  if (!parts || parts.length === 0) {
    throw createError({ statusCode: 400, message: 'ไม่พบไฟล์อัปโหลด' })
  }

  let taskId: number | null = null
  let fileData: any = null

  // อ่านฟิลด์ข้อมูลจาก multipart/form-data
  for (const part of parts) {
    if (part.name === 'taskId') {
      taskId = Number(part.data.toString())
    } else if (part.name === 'file') {
      fileData = part
    }
  }

  if (!taskId || !fileData) {
    throw createError({ statusCode: 400, message: 'พารามิเตอร์ไม่ครบถ้วน (กรุณาระบุ taskId และไฟล์)' })
  }

  const task = await prisma.task.findUnique({ where: { id: taskId } })
  if (!task) {
    throw createError({ statusCode: 404, message: 'ไม่พบงานหลักที่ต้องการแนบไฟล์' })
  }

  // ตรวจสอบสิทธิ์ (สมาชิกบอร์ด, เจ้าของบอร์ด, หรือ Super Admin)
  const isMember = await prisma.projectMember.findFirst({
    where: { projectId: task.projectId, userId }
  })
  const project = await prisma.project.findUnique({ where: { id: task.projectId } })
  const isOwner = project && project.ownerId === userId
  const isAdmin = event.context.auth.user.role === 'ADMIN'

  if (!isMember && !isOwner && !isAdmin) {
    throw createError({ statusCode: 403, message: 'คุณไม่มีสิทธิ์อัปโหลดไฟล์ในโปรเจกต์นี้ ❌' })
  }

  // ตรวจสอบขนาดไฟล์และประเภทไฟล์ป้องกัน RCE, DoS และ Path Traversal
  const maxSizeBytes = 30 * 1024 * 1024 // 30MB
  if (fileData.data.length > maxSizeBytes) {
    throw createError({ statusCode: 400, message: 'ขนาดไฟล์ต้องไม่เกิน 30MB ❌' })
  }

  const rawFilename = fileData.filename || 'unnamed'
  const extension = path.extname(rawFilename).toLowerCase().substring(1)
  const allowedExtensions = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'txt', 'csv']
  if (!extension || !allowedExtensions.includes(extension)) {
    throw createError({ statusCode: 400, message: 'ประเภทไฟล์ไม่ได้รับอนุญาต (ห้ามอัปโหลดโค้ดรันระบบ) ❌' })
  }

  // ป้องกัน Path Traversal ดึงเฉพาะ basename
  const baseName = path.basename(rawFilename).replace(/\s+/g, '_')
  const safeName = `${Date.now()}-${baseName}`
  let storedFilePath = `/uploads/${safeName}`

  // สร้างโฟลเดอร์ uploads หากเขียนดิสก์ได้ (Local/Docker) และสำรองเป็น Base64 Data URL เมื่อรันบน Read-only Serverless (Vercel)
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    const fileFullPath = path.join(uploadsDir, safeName)
    fs.writeFileSync(fileFullPath, fileData.data)
  } catch {
    // shortcut: store <=4.5MB files as Data URL in Attachment.filePath TEXT column on read-only serverless disks, upgrade to S3/Blob for >4.5MB
    const maxServerlessBytes = 4.5 * 1024 * 1024
    if (fileData.data.length > maxServerlessBytes) {
      throw createError({
        statusCode: 400,
        message: 'บนระบบคลาวด์ขนาดไฟล์แนบต้องไม่เกิน 4.5MB ❌'
      })
    }
    const mimeType = fileData.type || 'application/octet-stream'
    storedFilePath = `data:${mimeType};base64,${fileData.data.toString('base64')}`
  }

  const attachment = await prisma.attachment.create({
    data: {
      taskId,
      fileName: baseName,
      filePath: storedFilePath,
      fileSize: fileData.data.length
    }
  })

  // บันทึก Log ประวัติ
  await prisma.taskLog.create({
    data: {
      taskId,
      userId,
      action: 'UPDATED_TASK',
      details: `อัปโหลดไฟล์แนบ: "${fileData.filename}"`
    }
  })

  broadcastProjectUpdate(task.projectId, 'TASKS_UPDATED')

  return { success: true, data: attachment }
})
