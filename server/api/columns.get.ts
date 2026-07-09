export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const projectId = Number(query.projectId)

  if (!projectId) {
    throw createError({ statusCode: 400, message: 'กรุณาระบุไอดีโปรเจกต์ (projectId)' })
  }

  if (!event.context.auth?.user) {
    throw createError({ statusCode: 401, message: 'กรุณาเข้าสู่ระบบ' })
  }
  const userId = event.context.auth.user.id

  // ตรวจสอบสิทธิ์การเข้าใช้งานบอร์ด
  const isMember = await prisma.projectMember.findFirst({
    where: { projectId, userId }
  })

  const project = await prisma.project.findUnique({
    where: { id: projectId }
  })

  const isOwner = project && project.ownerId === userId

  if (!isMember && !isOwner) {
    throw createError({ statusCode: 403, message: 'คุณไม่มีสิทธิ์เข้าถึงโปรเจกต์นี้ ❌' })
  }

  const columns = await prisma.column.findMany({
    where: { projectId },
    orderBy: { position: 'asc' }
  })

  return { success: true, data: columns }
})
