// server/api/tasks/comments.delete.ts
export default defineEventHandler(async (event) => {
  if (!event.context.auth?.user) {
    throw createError({ statusCode: 401, message: 'กรุณาเข้าสู่ระบบ' })
  }
  const userId = event.context.auth.user.id

  const query = getQuery(event)
  const id = Number(query.id)

  if (!id) {
    throw createError({ statusCode: 400, message: 'กรุณาระบุไอดีความคิดเห็นที่ต้องการลบ (id)' })
  }

  const comment = await prisma.comment.findUnique({
    where: { id },
    include: {
      task: {
        select: { id: true, projectId: true }
      }
    }
  })

  if (!comment || !comment.task) {
    throw createError({ statusCode: 404, message: 'ไม่พบความคิดเห็นที่ต้องการลบ' })
  }

  const projectId = comment.task.projectId
  const isCommentAuthor = comment.userId === userId
  const canDeleteAny = await checkPermission(userId, projectId, 'DELETE_TASK')

  if (!isCommentAuthor && !canDeleteAny) {
    throw createError({ statusCode: 403, message: 'คุณลบได้เฉพาะความคิดเห็นของตนเอง หรือต้องมีสิทธิ์ลบงานในบอร์ดนี้ ❌' })
  }

  await prisma.comment.delete({
    where: { id }
  })

  await prisma.taskLog.create({
    data: {
      taskId: comment.taskId,
      userId,
      action: 'UPDATED_TASK',
      details: `ลบความคิดเห็น: "${comment.content.substring(0, 30)}${comment.content.length > 30 ? '...' : ''}"`
    }
  })

  broadcastProjectUpdate(projectId, 'TASKS_UPDATED')

  return {
    success: true,
    message: 'ลบความคิดเห็นเรียบร้อยแล้ว 🗑️'
  }
})
