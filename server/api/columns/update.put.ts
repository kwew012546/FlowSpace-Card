import { z } from 'zod'

const updateColumnSchema = z.object({
  id: z.union([z.number(), z.string()]).transform(Number),
  title: z.string().min(1, 'กรุณาระบุชื่อคอลัมน์').max(100, 'ชื่อคอลัมน์ยาวเกินไป').optional(),
  position: z.number().optional()
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parseResult = updateColumnSchema.safeParse(body)

  if (!parseResult.success) {
    throw createError({ statusCode: 400, message: parseResult.error.errors[0].message })
  }
  const { id, title, position } = parseResult.data

  if (!event.context.auth?.user) {
    throw createError({ statusCode: 401, message: 'กรุณาเข้าสู่ระบบ' })
  }
  const userId = event.context.auth.user.id

  const column = await prisma.column.findUnique({
    where: { id }
  })
  if (!column) {
    throw createError({ statusCode: 404, message: 'ไม่พบคอลัมน์ที่ต้องการแก้ไข' })
  }

  // ตรวจสอบสิทธิ์การจัดการโครงการ
  const hasPerm = await checkPermission(userId, column.projectId, 'MANAGE_PROJECT')
  if (!hasPerm) {
    throw createError({ statusCode: 403, message: 'คุณไม่มีสิทธิ์ในการจัดการคอลัมน์ของโปรเจกต์นี้ ❌' })
  }

  const updatedCol = await prisma.column.update({
    where: { id },
    data: {
      title: title !== undefined ? title.trim() : undefined,
      position: position !== undefined ? position : undefined
    }
  })

  // ส่งสัญญาณ Real-time บรอดแคสต์คนในโปรเจกต์
  broadcastProjectUpdate(column.projectId, 'TASKS_UPDATED')

  return { success: true, data: updatedCol, message: 'อัปเดตคอลัมน์เรียบร้อย!' }
})
