import { z } from 'zod'

const updateTaskSchema = z.object({
  id: z.union([z.number(), z.string()]).transform((val) => Number(val)),
  columnId: z.union([z.number(), z.string()]).transform((val) => Number(val)).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  title: z.string().min(1, 'หัวข้องานต้องไม่ว่างเปล่า').max(150, 'หัวข้องานต้องยาวไม่เกิน 150 ตัวอักษร').optional(),
  description: z.string().max(1000, 'รายละเอียดงานยาวเกินไป').nullable().optional(),
  assigneeId: z.union([z.number(), z.string()]).nullable().optional().transform((val) => val ? Number(val) : null),
  dueDate: z.string().nullable().optional(),
  labelIds: z.array(z.number()).optional()
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // ตรวจสอบความถูกต้องของพารามิเตอร์โดยใช้ Zod
  const parseResult = updateTaskSchema.safeParse(body)
  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      message: parseResult.error.errors[0].message
    })
  }

  const { id, columnId, priority, title, description, assigneeId, dueDate, labelIds } = parseResult.data

  if (!event.context.auth?.user) {
    throw createError({ statusCode: 401, message: 'กรุณาเข้าสู่ระบบ' })
  }
  const userId = event.context.auth.user.id

  try {
    // 3. ตรวจสอบว่ามีงาน ID นี้อยู่ในตารางจริงไหมก่อนจะสั่งอัปเดต
    const existingTask = await prisma.task.findUnique({
      where: { id: Number(id) }
    })

    if (!existingTask) {
      throw createError({
        statusCode: 404,
        message: `ไม่พบงานรหัส ID: ${id} ในระบบฐานข้อมูล`
      })
    }

    // ตรวจสอบสิทธิ์แก้ไขงาน/ย้ายงาน
    const hasPerm = await checkPermission(userId, existingTask.projectId, 'CREATE_TASK')
    if (!hasPerm) {
      throw createError({ statusCode: 403, message: 'คุณไม่มีสิทธิ์ในการแก้ไขหรือย้ายงานในโปรเจกต์นี้ ❌' })
    }

    // ตรวจสอบความถูกต้องของสิทธิ์สมาชิกผู้รับผิดชอบงาน
    if (assigneeId) {
      const isMember = await prisma.projectMember.findFirst({
        where: { projectId: existingTask.projectId, userId: Number(assigneeId) }
      })
      if (!isMember) {
        throw createError({ statusCode: 400, message: 'ผู้รับผิดชอบที่เลือกไม่จัดอยู่ในสมาชิกของโปรเจกต์นี้ ❌' })
      }
    }

    // 4. สั่งอัปเดตข้อมูลจริง
    const updatedTask = await prisma.task.update({
      where: { id: Number(id) },
      data: {
        ...(columnId !== undefined && { columnId }),
        ...(priority !== undefined && { priority }),
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description ? description.trim() : null }),
        ...(assigneeId !== undefined && { assigneeId: assigneeId ? Number(assigneeId) : null }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(labelIds !== undefined && {
          labels: {
            set: labelIds.map((lid) => ({ id: lid }))
          }
        })
      }
    })

    // 5. บันทึกกิจกรรมการเปลี่ยนแปลงลงใน TaskLog
    if (columnId && columnId !== existingTask.columnId) {
      const [oldCol, newCol] = await Promise.all([
        prisma.column.findUnique({ where: { id: existingTask.columnId || 0 } }),
        prisma.column.findUnique({ where: { id: columnId } })
      ])
      const oldName = oldCol ? oldCol.title : 'ไม่มี'
      const newName = newCol ? newCol.title : 'ไม่มี'

      await prisma.taskLog.create({
        data: {
          taskId: Number(id),
          userId: userId,
          action: 'MOVED_STATUS',
          details: `ย้ายงานจาก "${oldName}" ไปยัง "${newName}"`
        }
      })
    }

    const hasTitleChanged = title !== undefined && title.trim() !== existingTask.title
    const hasDescChanged = description !== undefined && (description ? description.trim() : null) !== existingTask.description
    const hasAssigneeChanged = assigneeId !== undefined && (assigneeId ? Number(assigneeId) : null) !== existingTask.assigneeId
    const hasDueDateChanged = dueDate !== undefined && (dueDate ? new Date(dueDate).toISOString() : null) !== (existingTask.dueDate ? new Date(existingTask.dueDate).toISOString() : null)
    const hasPriorityChanged = priority !== undefined && priority !== existingTask.priority
    const hasLabelsChanged = labelIds !== undefined

    if (hasTitleChanged || hasDescChanged || hasAssigneeChanged || hasDueDateChanged || hasPriorityChanged || hasLabelsChanged) {
      let logDetails = 'แก้ไขข้อมูล:'
      if (hasTitleChanged) logDetails += ' ชื่อการ์ด,'
      if (hasDescChanged) logDetails += ' รายละเอียด,'
      if (hasAssigneeChanged) logDetails += ' ผู้รับผิดชอบ,'
      if (hasDueDateChanged) logDetails += ' กำหนดส่งงาน,'
      if (hasPriorityChanged) logDetails += ' ระดับความสำคัญ,'
      if (hasLabelsChanged) logDetails += ' ป้ายกำกับสี'
      logDetails = logDetails.replace(/,$/, '') // ลบลูกน้ำตัวสุดท้าย

      await prisma.taskLog.create({
        data: {
          taskId: Number(id),
          userId: userId,
          action: 'UPDATED_TASK',
          details: logDetails
        }
      })
    }

    // ส่งการแจ้งเตือนเมื่อมีการมอบหมายผู้รับผิดชอบงานคนใหม่
    if (hasAssigneeChanged && assigneeId && assigneeId !== userId) {
      await prisma.notification.create({
        data: {
          userId: assigneeId,
          title: 'ได้รับมอบหมายงานใหม่ 👤',
          message: `คุณได้รับมอบหมายงาน "${title || existingTask.title}"`
        }
      })
    }

    broadcastProjectUpdate(updatedTask.projectId, 'TASKS_UPDATED')

    return { success: true, data: updatedTask }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error(error)
    throw createError({
      statusCode: 500,
      message: 'ไม่สามารถอัปเดตข้อมูลได้ เนื่องจากระบบฐานข้อมูลขัดข้อง'
    })
  }
})