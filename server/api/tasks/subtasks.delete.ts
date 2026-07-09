export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const id = Number(query.id)

  if (!id) {
    throw createError({ statusCode: 400, message: 'กรุณาระบุไอดีงานย่อย (id)' })
  }

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

  // ตรวจสอบสิทธิ์การเข้าใช้โปรเจกต์
  const isMember = await prisma.projectMember.findFirst({
    where: { projectId: subtask.task.projectId, userId }
  })
  const project = await prisma.project.findUnique({ where: { id: subtask.task.projectId } })
  const isOwner = project && project.ownerId === userId

  if (!isMember && !isOwner) {
    throw createError({ statusCode: 403, message: 'คุณไม่มีสิทธิ์จัดการข้อมูลบอร์ดนี้ ❌' })
  }

  await prisma.subtask.delete({
    where: { id }
  })

  // บันทึก Log งานหลัก
  await prisma.taskLog.create({
    data: {
      taskId: subtask.taskId,
      userId,
      action: 'UPDATED_TASK',
      details: `ลบงานย่อย: "${subtask.title}"`
    }
  })

  broadcastProjectUpdate(subtask.task.projectId, 'TASKS_UPDATED')

  return { success: true, message: 'ลบงานย่อยเรียบร้อยแล้ว!' }
})
