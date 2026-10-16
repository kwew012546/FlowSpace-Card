import { z } from 'zod'

const createSubtaskSchema = z.object({
  taskId: z.union([z.number(), z.string()]).transform(Number),
  title: z.string().min(1, 'กรุณาระบุหัวข้องานย่อย').max(150, 'งานย่อยยาวเกินไป')
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parseResult = createSubtaskSchema.safeParse(body)

  if (!parseResult.success) {
    throw createError({ statusCode: 400, message: parseResult.error.issues?.[0]?.message || parseResult.error.message })
  }
  const { taskId, title } = parseResult.data

  if (!event.context.auth?.user) {
    throw createError({ statusCode: 401, message: 'กรุณาเข้าสู่ระบบ' })
  }
  const userId = event.context.auth.user.id

  const task = await prisma.task.findUnique({ where: { id: taskId } })
  if (!task) {
    throw createError({ statusCode: 404, message: 'ไม่พบงานหลักที่ระบุ' })
  }

  // ตรวจสอบความถูกต้องของการเข้าใช้โปรเจกต์ (รวมถึง Super Admin)
  const canAccess = await isProjectMember(userId, task.projectId)
  if (!canAccess) {
    throw createError({ statusCode: 403, message: 'คุณไม่มีสิทธิ์จัดการการ์ดงานในโปรเจกต์นี้ ❌' })
  }

  const subtask = await prisma.subtask.create({
    data: {
      taskId,
      title: title.trim(),
      isCompleted: false
    }
  })

  // บันทึก Log งานหลัก
  await prisma.taskLog.create({
    data: {
      taskId,
      userId,
      action: 'UPDATED_TASK',
      details: `เพิ่มงานย่อย: "${subtask.title}"`
    }
  })

  // บรอดแคสต์ SSE อัปเดตบอร์ดเรียลไทม์
  broadcastProjectUpdate(task.projectId, 'TASKS_UPDATED')

  return { success: true, data: subtask }
})
