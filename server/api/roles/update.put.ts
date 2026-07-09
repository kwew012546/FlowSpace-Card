// server/api/roles/update.put.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { roleId, name, permissions } = body
  if (!event.context.auth?.user) {
    throw createError({ statusCode: 401, message: 'กรุณาเข้าสู่ระบบ' })
  }
  const userId = event.context.auth.user.id

  if (!roleId || !name || !name.trim()) {
    throw createError({ statusCode: 400, message: 'ข้อมูลไม่ครบถ้วน' })
  }

  try {
    // หาข้อมููลยศเดิมเพื่อหาไอดีโปรเจกต์
    const targetRole = await prisma.role.findUnique({ where: { id: Number(roleId) } })
    if (!targetRole) throw createError({ statusCode: 404, message: 'ไม่พบข้อมูลยศที่ต้องการแก้ไข' })

    const project = await prisma.project.findUnique({ where: { id: targetRole.projectId } })
    const requester = await prisma.projectMember.findFirst({
      where: { projectId: targetRole.projectId, userId: userId },
      include: { role: true }
    })

    const isOwner = project && project.ownerId === userId
    const hasPermission = requester?.role?.permissions.includes('MANAGE_PROJECT')

    if (!isOwner && !hasPermission) {
      throw createError({ statusCode: 403, message: 'คุณไม่มีอำนาจแก้ไขข้อมูลยศตำแหน่งนี้' })
    }

    // อัปเดตข้อมูลยศ
    const updatedRole = await prisma.role.update({
      where: { id: Number(roleId) },
      data: { name: name.trim(), permissions: permissions }
    })

    broadcastProjectUpdate(updatedRole.projectId, 'TEAM_UPDATED')

    return { success: true, message: 'อัปเดตยศเรียบร้อย!', data: updatedRole }
  } catch (error: any) {
    throw createError({ statusCode: error.statusCode || 500, message: error.message })
  }
})