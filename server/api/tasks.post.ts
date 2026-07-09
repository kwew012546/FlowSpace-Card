import { z } from 'zod'

const createTaskSchema = z.object({
  title: z.string().min(1, 'กรุณาระบุหัวข้องาน').max(150, 'หัวข้องานต้องยาวไม่เกิน 150 ตัวอักษร'),
  description: z.string().max(1000, 'รายละเอียดงานยาวเกินไป').nullable().optional(),
  projectId: z.union([z.number(), z.string()]).transform((val) => Number(val)),
  columnId: z.union([z.number(), z.string()]).transform((val) => Number(val)),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  assigneeId: z.union([z.number(), z.string()]).nullable().optional().transform((val) => val ? Number(val) : null),
  dueDate: z.string().nullable().optional()
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // ตรวจสอบความถูกต้องของพารามิเตอร์โดยใช้ Zod
  const parseResult = createTaskSchema.safeParse(body)
  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      message: parseResult.error.errors[0].message
    })
  }

  const { title, description, projectId, columnId, priority, assigneeId, dueDate } = parseResult.data

  if (!event.context.auth?.user) {
    throw createError({ statusCode: 401, message: 'กรุณาเข้าสู่ระบบ' })
  }
  const userId = event.context.auth.user.id

  // ตรวจสอบสิทธิ์สร้างงาน
  const hasPerm = await checkPermission(userId, Number(projectId), 'CREATE_TASK')
  if (!hasPerm) {
    throw createError({ statusCode: 403, message: 'คุณไม่มีสิทธิ์ในการสร้างงานในโปรเจกต์นี้ ❌' })
  }

  // ตรวจสอบความถูกต้องของสิทธิ์สมาชิกผู้รับผิดชอบงาน
  if (assigneeId) {
    const isMember = await prisma.projectMember.findFirst({
      where: { projectId: Number(projectId), userId: Number(assigneeId) }
    })
    if (!isMember) {
      throw createError({ statusCode: 400, message: 'ผู้รับผิดชอบที่เลือกไม่จัดอยู่ในสมาชิกของโปรเจกต์นี้ ❌' })
    }
  }

  try {
    const newTask = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        columnId: Number(columnId),
        priority,
        projectId: Number(projectId),
        assigneeId: assigneeId ? Number(assigneeId) : null,
        dueDate: dueDate ? new Date(dueDate) : null
      }
    })

    // บันทึกกิจกรรมการสร้างการ์ดลงใน TaskLog
    await prisma.taskLog.create({
      data: {
        taskId: newTask.id,
        userId: userId,
        action: 'CREATED_TASK',
        details: 'สร้างการ์ดงานใหม่'
      }
    })

    // ส่งการแจ้งเตือนหากมีการมอบหมายงานให้คนอื่น
    if (assigneeId && assigneeId !== userId) {
      await prisma.notification.create({
        data: {
          userId: assigneeId,
          title: 'ได้รับมอบหมายงานใหม่ 👤',
          message: `คุณได้รับมอบหมายงาน "${title.trim()}"`
        }
      })
    }

    // ส่งสัญญาณ Real-time บรอดแคสต์อัปเดตคนในโปรเจกต์
    broadcastProjectUpdate(Number(projectId), 'TASKS_UPDATED')

    return { success: true, data: newTask }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error(error)
    throw createError({ statusCode: 500, message: 'ไม่สามารถสร้างงานได้' })
  }
})