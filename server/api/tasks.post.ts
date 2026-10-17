import { z } from 'zod'

const createTaskSchema = z.object({
  title: z.string().min(1, 'กรุณาระบุหัวข้องาน').max(150, 'หัวข้องานต้องยาวไม่เกิน 150 ตัวอักษร'),
  description: z.string().max(1000, 'รายละเอียดงานยาวเกินไป').nullable().optional(),
  projectId: z.union([z.number(), z.string()]).transform((val) => Number(val)),
  columnId: z.union([z.number(), z.string()]).transform((val) => Number(val)),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  assigneeId: z.union([z.number(), z.string()]).nullable().optional().transform((val) => val ? Number(val) : null),
  dueDate: z.string().nullable().optional(),
  labelIds: z.array(z.number()).optional()
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // ตรวจสอบความถูกต้องของพารามิเตอร์โดยใช้ Zod
  const parseResult = createTaskSchema.safeParse(body)
  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      message: parseResult.error.issues?.[0]?.message || parseResult.error.message
    })
  }

  const { title, description, projectId, columnId, priority, assigneeId, dueDate, labelIds } = parseResult.data

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

  // ตรวจสอบความถูกต้องของคอลัมน์เป้าหมาย
  const targetColumn = await prisma.column.findFirst({
    where: { id: Number(columnId), projectId: Number(projectId) }
  })
  if (!targetColumn) {
    throw createError({
      statusCode: 400,
      message: 'ไม่พบคอลัมน์ที่ระบุ หรือคอลัมน์นี้อาจถูกลบไปแล้ว ❌ กรุณารีเฟรชหรือเลือกคอลัมน์อื่น'
    })
  }

  try {
    await ensureDbSchema()
    const [existingTaskCount, validLabels] = await Promise.all([
      prisma.task.count({
        where: { columnId: Number(columnId) }
      }),
      labelIds && labelIds.length > 0
        ? prisma.label.findMany({
            where: { id: { in: labelIds }, projectId: Number(projectId) },
            select: { id: true }
          })
        : Promise.resolve([])
    ])

    const newTask = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        columnId: Number(columnId),
        position: existingTaskCount,
        priority,
        projectId: Number(projectId),
        assigneeId: assigneeId ? Number(assigneeId) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        ...(validLabels.length > 0 && {
          labels: {
            connect: validLabels.map((l) => ({ id: l.id }))
          }
        })
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