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

  // ตรวจสอบสิทธิ์
  const isMember = await prisma.projectMember.findFirst({
    where: { projectId: label.projectId, userId }
  })
  const project = await prisma.project.findUnique({ where: { id: label.projectId } })
  const isOwner = project && project.ownerId === userId

  if (!isMember && !isOwner) {
    throw createError({ statusCode: 403, message: 'คุณไม่มีสิทธิ์จัดการข้อมูลป้ายกำกับนี้ ❌' })
  }

  await prisma.label.delete({
    where: { id }
  })

  broadcastProjectUpdate(label.projectId, 'TASKS_UPDATED')

  return { success: true, message: 'ลบป้ายกำกับเรียบร้อยแล้ว!' }
})
