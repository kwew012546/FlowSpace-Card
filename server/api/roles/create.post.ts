// server/api/roles/create.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { projectId, name, permissions } = body
  if (!event.context.auth?.user) {
    throw createError({ statusCode: 401, message: 'กรุณาเข้าสู่ระบบ' })
  }
  const userId = event.context.auth.user.id

  if (!projectId || !name || !name.trim()) {
    throw createError({ statusCode: 400, message: 'ข้อมูลไม่ครบถ้วน' })
  }

  try {
    // 🔍 ตรวจสอบสิทธิ์คนสร้างยศว่าเป็น Owner หรือมียศคุมระบบ
    const project = await prisma.project.findUnique({ where: { id: Number(projectId) } })
    const requester = await prisma.projectMember.findFirst({
      where: { projectId: Number(projectId), userId: userId },
      include: { role: true }
    })

    const isOwner = project && project.ownerId === userId
    const hasPermission = requester?.role?.permissions.includes('MANAGE_PROJECT')

    if (!isOwner && !hasPermission) {
      throw createError({ statusCode: 403, message: 'คุณไม่มีอำนาจในการสร้างยศใหม่ในโปรเจกต์นี้' })
    }

    // ผ่านฉลุย... ทำการสร้างยศใหม่
    const newRole = await prisma.role.create({
      data: {
        name: name.trim(),
        projectId: Number(projectId),
        permissions: permissions || []
      }
    })

    broadcastProjectUpdate(Number(projectId), 'TEAM_UPDATED')

    return { success: true, message: 'สร้างยศใหม่สำเร็จแล้ว! ⚔️', data: newRole }
  } catch (error: any) {
    throw createError({ statusCode: error.statusCode || 500, message: error.message })
  }
})