import { z } from 'zod'

const createCommentSchema = z.object({
  taskId: z.union([z.number(), z.string()]).transform(Number),
  content: z.string().min(1, 'กรุณากรอกข้อความความคิดเห็น').max(500, 'คอมเมนต์ยาวเกินไป')
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parseResult = createCommentSchema.safeParse(body)

  if (!parseResult.success) {
    throw createError({ statusCode: 400, message: parseResult.error.errors[0].message })
  }
  const { taskId, content } = parseResult.data

  if (!event.context.auth?.user) {
    throw createError({ statusCode: 401, message: 'กรุณาเข้าสู่ระบบ' })
  }
  const userId = event.context.auth.user.id

  const task = await prisma.task.findUnique({ where: { id: taskId } })
  if (!task) {
    throw createError({ statusCode: 404, message: 'ไม่พบการ์ดงานที่ระบุ' })
  }

  // ตรวจสอบสิทธิ์การเข้าใช้โปรเจกต์
  const isMember = await prisma.projectMember.findFirst({
    where: { projectId: task.projectId, userId }
  })
  const project = await prisma.project.findUnique({ where: { id: task.projectId } })
  const isOwner = project && project.ownerId === userId

  if (!isMember && !isOwner) {
    throw createError({ statusCode: 403, message: 'คุณไม่มีสิทธิ์แสดงความคิดเห็นในโปรเจกต์นี้ ❌' })
  }

  const comment = await prisma.comment.create({
    data: {
      taskId,
      userId,
      content: content.trim()
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true
        }
      }
    }
  })

  // บันทึก Log งานหลัก
  await prisma.taskLog.create({
    data: {
      taskId,
      userId,
      action: 'UPDATED_TASK',
      details: `แสดงความเห็น: "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`
    }
  })

  broadcastProjectUpdate(task.projectId, 'TASKS_UPDATED')

  return { success: true, data: comment }
})
