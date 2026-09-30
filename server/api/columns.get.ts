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

  // ตรวจสอบสิทธิ์และดึงคอลัมน์พร้อมกันในรอบเดียว
  const [isMember, project, columns] = await Promise.all([
    prisma.projectMember.findFirst({
      where: { projectId, userId },
      select: { id: true }
    }),
    prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true }
    }),
    prisma.column.findMany({
      where: { projectId },
      orderBy: { position: 'asc' }
    })
  ])

  const isOwner = project && project.ownerId === userId

  if (!isMember && !isOwner) {
    throw createError({ statusCode: 403, message: 'คุณไม่มีสิทธิ์เข้าถึงโปรเจกต์นี้ ❌' })
  }

  return { success: true, data: columns }
})
