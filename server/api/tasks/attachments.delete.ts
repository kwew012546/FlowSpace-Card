// server/api/tasks/attachments.delete.ts
export default defineEventHandler(async (event) => {
  if (!event.context.auth?.user) {
    throw createError({ statusCode: 401, message: 'กรุณาเข้าสู่ระบบ' })
  }
  const userId = event.context.auth.user.id

  const query = getQuery(event)
  const id = Number(query.id)

  if (!id) {
    throw createError({ statusCode: 400, message: 'กรุณาระบุไอดีของไฟล์แนบที่ต้องการลบ' })
  }

  const attachment = await prisma.attachment.findUnique({
    where: { id },
    include: {
      task: {
        select: { id: true, projectId: true }
      }
    }
  })

  if (!attachment || !attachment.task) {
    throw createError({ statusCode: 404, message: 'ไม่พบไฟล์แนบที่ต้องการลบ' })
  }

  const projectId = attachment.task.projectId
  const [canEdit, canDelete] = await Promise.all([
    checkPermission(userId, projectId, 'CREATE_TASK'),
    checkPermission(userId, projectId, 'DELETE_TASK')
  ])

  if (!canEdit && !canDelete) {
    throw createError({ statusCode: 403, message: 'คุณไม่มีสิทธิ์ลบไฟล์แนบในโปรเจกต์นี้ ❌' })
  }

  removePhysicalUploadFiles([attachment.filePath])

  await prisma.attachment.delete({
    where: { id }
  })

  await prisma.taskLog.create({
    data: {
      taskId: attachment.taskId,
      userId,
      action: 'UPDATED_TASK',
      details: `ลบไฟล์แนบ: "${attachment.fileName}"`
    }
  })

  broadcastProjectUpdate(projectId, 'TASKS_UPDATED')

  return {
    success: true,
    message: 'ลบไฟล์แนบเรียบร้อยแล้ว 🗑️'
  }
})
