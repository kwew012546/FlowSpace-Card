export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const id = Number(query.id)

  if (!id) {
    throw createError({ statusCode: 400, message: 'กรุณาระบุไอดีป้ายกำกับ (id)' })
  }

  if (!event.context.auth?.user) {
    throw createError({ statusCode: 401, message: 'กรุณาเข้าสู่ระบบ' })
  }
  const userId = event.context.auth.user.id

  const label = await prisma.label.findUnique({
    where: { id }
  })
  if (!label) {
    throw createError({ statusCode: 404, message: 'ไม่พบป้ายกำกับที่ต้องการลบ' })
  }

  // ตรวจสอบสิทธิ์ (ต้องมีสิทธิ์ CREATE_TASK หรือ DELETE_TASK)
  const [canCreate, canDelete] = await Promise.all([
    checkPermission(userId, label.projectId, 'CREATE_TASK'),
    checkPermission(userId, label.projectId, 'DELETE_TASK')
  ])

  if (!canCreate && !canDelete) {
    throw createError({ statusCode: 403, message: 'คุณไม่มีสิทธิ์ลบป้ายกำกับในโปรเจกต์นี้ ❌' })
  }

  await prisma.label.delete({
    where: { id }
  })

  broadcastProjectUpdate(label.projectId, 'TASKS_UPDATED')

  return { success: true, message: 'ลบป้ายกำกับเรียบร้อยแล้ว!' }
})
