export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const id = Number(query.id)
  const targetColumnId = query.targetColumnId ? Number(query.targetColumnId) : null
  const forceDeleteTasks = query.forceDeleteTasks === 'true'

  if (!id) {
    throw createError({ statusCode: 400, message: 'กรุณาระบุไอดีคอลัมน์ (id)' })
  }

  if (!event.context.auth?.user) {
    throw createError({ statusCode: 401, message: 'กรุณาเข้าสู่ระบบ' })
  }
  const userId = event.context.auth.user.id

  const column = await prisma.column.findUnique({
    where: { id }
  })
  if (!column) {
    throw createError({ statusCode: 404, message: 'ไม่พบคอลัมน์ที่ต้องการลบ' })
  }

  // ตรวจสอบสิทธิ์
  const hasPerm = await checkPermission(userId, column.projectId, 'MANAGE_PROJECT')
  if (!hasPerm) {
    throw createError({ statusCode: 403, message: 'คุณไม่มีสิทธิ์ในการจัดการคอลัมน์ของโปรเจกต์นี้ ❌' })
  }

  // ตรวจสอบจำนวนคอลัมน์ที่เหลืออยู่ในโปรเจกต์ (Zero-Column Guard ป้องกันบอร์ดเป็นหมัน)
  const totalColumns = await prisma.column.count({
    where: { projectId: column.projectId }
  })

  if (totalColumns <= 1) {
    throw createError({
      statusCode: 400,
      message: 'ไม่สามารถลบคอลัมน์สุดท้ายของบอร์ดได้ ❌ บอร์ดต้องมีอย่างน้อย 1 คอลัมน์สำหรับวางการ์ดงาน'
    })
  }

  // ตรวจสอบว่ายังมีงานค้างอยู่ในคอลัมน์หรือไม่
  const tasksCount = await prisma.task.count({
    where: { columnId: id }
  })

  if (tasksCount > 0) {
    if (targetColumnId) {
      const targetCol = await prisma.column.findFirst({
        where: { id: targetColumnId, projectId: column.projectId }
      })
      if (!targetCol || targetCol.id === id) {
        throw createError({
          statusCode: 400,
          message: 'คอลัมน์ปลายทางที่เลือกสำหรับย้ายงานไม่ถูกต้อง ❌'
        })
      }

      await prisma.$transaction([
        prisma.task.updateMany({
          where: { columnId: id },
          data: { columnId: targetColumnId }
        }),
        prisma.column.delete({
          where: { id }
        })
      ])

      await notifyOwnerIfExternalAdmin(
        userId,
        column.projectId,
        `ลบคอลัมน์ "${column.title}" (และย้ายการ์ด ${tasksCount} ใบไปยัง "${targetCol.title}")`
      )
      broadcastProjectUpdate(column.projectId, 'TASKS_UPDATED')
      return { success: true, message: 'ย้ายงานและลบคอลัมน์เรียบร้อยแล้ว!' }
    } else if (forceDeleteTasks) {
      await prisma.column.delete({
        where: { id }
      })
      await notifyOwnerIfExternalAdmin(
        userId,
        column.projectId,
        `ลบคอลัมน์ "${column.title}" (พร้อมลบการ์ดในคอลัมน์ ${tasksCount} ใบ)`
      )
      broadcastProjectUpdate(column.projectId, 'TASKS_UPDATED')
      return { success: true, message: 'ลบคอลัมน์และการ์ดภายในเรียบร้อยแล้ว!' }
    } else {
      throw createError({
        statusCode: 400,
        message: `ไม่สามารถลบคอลัมน์นี้ได้ เนื่องจากยังมีงานค้างอยู่ ${tasksCount} ชิ้น ❌ กรุณาเลือกคอลัมน์ปลายทางเพื่อย้ายงานก่อนลบ`
      })
    }
  }

  await prisma.column.delete({
    where: { id }
  })

  await notifyOwnerIfExternalAdmin(userId, column.projectId, `ลบคอลัมน์ "${column.title}"`)

  // ส่งสัญญาณ Real-time บรอดแคสต์คนในโปรเจกต์
  broadcastProjectUpdate(column.projectId, 'TASKS_UPDATED')

  return { success: true, message: 'ลบคอลัมน์เรียบร้อยแล้ว!' }
})
