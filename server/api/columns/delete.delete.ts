export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const id = Number(query.id)

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

  // ตรวจสอบว่ายังมีงานค้างอยู่ในคอลัมน์หรือไม่ (Safety Guard)
  const tasksCount = await prisma.task.count({
    where: { columnId: id }
  })

  if (tasksCount > 0) {
    throw createError({
      statusCode: 400,
      message: `ไม่สามารถลบคอลัมน์นี้ได้ เนื่องจากยังมีงานค้างอยู่ ${tasksCount} ชิ้น ❌ กรุณาย้ายงานทั้งหมดออกไปช่องอื่นก่อนทำการลบ`
    })
  }

  await prisma.column.delete({
    where: { id }
  })

  // ส่งสัญญาณ Real-time บรอดแคสต์คนในโปรเจกต์
  broadcastProjectUpdate(column.projectId, 'TASKS_UPDATED')

  return { success: true, message: 'ลบคอลัมน์เรียบร้อยแล้ว!' }
})
