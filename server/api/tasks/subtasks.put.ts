import { z } from 'zod'

const updateSubtaskSchema = z.object({
  id: z.union([z.number(), z.string()]).transform(Number),
  title: z.string().min(1).max(150).optional(),
  isCompleted: z.boolean().optional()
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parseResult = updateSubtaskSchema.safeParse(body)

  if (!parseResult.success) {
    throw createError({ statusCode: 400, message: parseResult.error.issues?.[0]?.message || parseResult.error.message })
  }
  const { id, title, isCompleted } = parseResult.data

  if (!event.context.auth?.user) {
    throw createError({ statusCode: 401, message: 'กรุณาเข้าสู่ระบบ' })
  }
  const userId = event.context.auth.user.id

  const subtask = await prisma.subtask.findUnique({
    where: { id },
    include: { task: true }
  })
  if (!subtask) {
    throw createError({ statusCode: 404, message: 'ไม่พบงานย่อยที่ระบุ' })
  }

  // ตรวจสอบสิทธิ์ในการแก้ไขการ์ดงาน (รวมถึง Owner, MANAGE_PROJECT และ Super Admin)
  const canEdit = await checkPermission(userId, subtask.task.projectId, 'CREATE_TASK')
  if (!canEdit) {
    throw createError({ statusCode: 403, message: 'คุณไม่มีสิทธิ์แก้ไขงานย่อยในโปรเจกต์นี้ ❌' })
  }

  const updatedSubtask = await prisma.subtask.update({
    where: { id },
    data: {
      title: title !== undefined ? title.trim() : undefined,
      isCompleted: isCompleted !== undefined ? isCompleted : undefined
    }
  })

  // บันทึก Log งานหลักเมื่อมีการทำเครื่องหมาย
  if (isCompleted !== undefined && isCompleted !== subtask.isCompleted) {
    await prisma.taskLog.create({
      data: {
        taskId: subtask.taskId,
        userId,
        action: 'UPDATED_TASK',
        details: isCompleted 
          ? `ทำสำเร็จงานย่อย: "${subtask.title}"`
          : `ยกเลิกการทำสำเร็จงานย่อย: "${subtask.title}"`
      }
    })
  }

  broadcastProjectUpdate(subtask.task.projectId, 'TASKS_UPDATED')

  return { success: true, data: updatedSubtask }
})
