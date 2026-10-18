export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const taskId = Number(query.taskId)

  if (!taskId) {
    throw createError({ statusCode: 400, message: 'กรุณาระบุไอดีการ์ดงาน (taskId)' })
  }

  if (!event.context.auth?.user) {
    throw createError({ statusCode: 401, message: 'กรุณาเข้าสู่ระบบ' })
  }
  const userId = event.context.auth.user.id

  const task = await prisma.task.findUnique({ where: { id: taskId } })
  if (!task) {
    throw createError({ statusCode: 404, message: 'ไม่พบการ์ดงานที่ต้องการดึงคอมเมนต์' })
  }

  // ตรวจสอบสิทธิ์การเข้าใช้โปรเจกต์ (รวมถึง Super Admin)
  const canAccess = await isProjectMember(userId, task.projectId)
  if (!canAccess) {
    throw createError({ statusCode: 403, message: 'คุณไม่มีสิทธิ์เข้าถึงบอร์ดงานในโปรเจกต์นี้ ❌' })
  }

  const comments = await prisma.comment.findMany({
    where: { taskId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          role: true
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  })

  return { success: true, data: comments }
})
