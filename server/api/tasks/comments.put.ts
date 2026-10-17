// server/api/tasks/comments.put.ts
import { z } from 'zod'

const updateCommentSchema = z.object({
  id: z.union([z.number(), z.string()]).transform(Number),
  content: z.string().min(1, 'กรุณากรอกข้อความความคิดเห็น').max(500, 'คอมเมนต์ยาวเกินไป (สูงสุด 500 ตัวอักษร)')
})

export default defineEventHandler(async (event) => {
  if (!event.context.auth?.user) {
    throw createError({ statusCode: 401, message: 'กรุณาเข้าสู่ระบบ' })
  }
  const userId = event.context.auth.user.id

  const body = await readBody(event)
  const parseResult = updateCommentSchema.safeParse(body)

  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      message: parseResult.error.issues?.[0]?.message || parseResult.error.message
    })
  }

  const { id, content } = parseResult.data
  const trimmedContent = content.trim()
  if (!trimmedContent) {
    throw createError({ statusCode: 400, message: 'กรุณากรอกข้อความความคิดเห็น' })
  }

  const existingComment = await prisma.comment.findUnique({
    where: { id },
    include: {
      task: {
        select: { id: true, projectId: true }
      },
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          role: true
        }
      }
    }
  })

  if (!existingComment || !existingComment.task) {
    throw createError({ statusCode: 404, message: 'ไม่พบความคิดเห็นที่ต้องการแก้ไข' })
  }

  const projectId = existingComment.task.projectId
  const canAccess = await isProjectMember(userId, projectId)
  const isAuthor = existingComment.userId === userId
  const isAdmin = event.context.auth.user.role === 'ADMIN'

  if (!canAccess || (!isAuthor && !isAdmin)) {
    throw createError({
      statusCode: 403,
      message: 'คุณสามารถแก้ไขได้เฉพาะความคิดเห็นของตนเองเท่านั้น ❌'
    })
  }

  if (trimmedContent === existingComment.content) {
    return { success: true, data: existingComment }
  }

  const updatedComment = await prisma.comment.update({
    where: { id },
    data: {
      content: trimmedContent
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          role: true
        }
      }
    }
  })

  await prisma.taskLog.create({
    data: {
      taskId: existingComment.taskId,
      userId,
      action: 'UPDATED_TASK',
      details: `แก้ไขความคิดเห็นเป็น: "${trimmedContent.substring(0, 30)}${trimmedContent.length > 30 ? '...' : ''}"`
    }
  })

  broadcastProjectUpdate(projectId, 'TASKS_UPDATED')

  return {
    success: true,
    data: updatedComment
  }
})
