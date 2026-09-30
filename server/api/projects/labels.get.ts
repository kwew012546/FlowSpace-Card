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

  const [isMember, project, labels] = await Promise.all([
    prisma.projectMember.findFirst({
      where: { projectId, userId },
      select: { id: true }
    }),
    prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true }
    }),
    prisma.label.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' }
    })
  ])
  const isOwner = project && project.ownerId === userId

  if (!isMember && !isOwner) {
    throw createError({ statusCode: 403, message: 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลโปรเจกต์นี้ ❌' })
  }

  return { success: true, data: labels }
})
