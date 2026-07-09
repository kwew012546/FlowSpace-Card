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

  const isMember = await prisma.projectMember.findFirst({
    where: { projectId, userId }
  })
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  const isOwner = project && project.ownerId === userId

  if (!isMember && !isOwner) {
    throw createError({ statusCode: 403, message: 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลโปรเจกต์นี้ ❌' })
  }

  const labels = await prisma.label.findMany({
    where: { projectId },
    orderBy: { createdAt: 'asc' }
  })

  return { success: true, data: labels }
})
