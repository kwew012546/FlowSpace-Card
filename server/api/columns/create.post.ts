import { z } from 'zod'

const createColumnSchema = z.object({
  projectId: z.union([z.number(), z.string()]).transform(Number),
  title: z.string().min(1, 'กรุณาระบุชื่อคอลัมน์').max(100, 'ชื่อคอลัมน์ยาวเกินไป')
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parseResult = createColumnSchema.safeParse(body)

  if (!parseResult.success) {
    throw createError({ statusCode: 400, message: parseResult.error.errors[0].message })
  }
  const { projectId, title } = parseResult.data

  if (!event.context.auth?.user) {
    throw createError({ statusCode: 401, message: 'กรุณาเข้าสู่ระบบ' })
  }
  const userId = event.context.auth.user.id

  // ตรวจสอบสิทธิ์ในการแก้ไขโปรเจกต์
  const hasPerm = await checkPermission(userId, projectId, 'MANAGE_PROJECT')
  if (!hasPerm) {
    throw createError({ statusCode: 403, message: 'คุณไม่มีสิทธิ์ในการจัดการคอลัมน์ของโปรเจกต์นี้ ❌' })
  }

  // หาตำแหน่ง position ถัดไป
  const lastCol = await prisma.column.findFirst({
    where: { projectId },
    orderBy: { position: 'desc' }
  })
  const nextPos = lastCol ? lastCol.position + 1 : 0

  const newCol = await prisma.column.create({
    data: {
      projectId,
      title: title.trim(),
      position: nextPos
    }
  })

  // ส่งสัญญาณ Real-time
  broadcastProjectUpdate(projectId, 'TASKS_UPDATED')

  return { success: true, data: newCol, message: 'สร้างคอลัมน์สำเร็จแล้ว!' }
})
