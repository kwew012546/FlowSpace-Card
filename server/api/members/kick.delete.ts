// server/api/members/kick.delete.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { memberId, projectId } = query

  if (!event.context.auth?.user) {
    throw createError({ statusCode: 401, message: 'กรุณาเข้าสู่ระบบ' })
  }
  const userId = event.context.auth.user.id

  if (!memberId || !projectId) {
    throw createError({ statusCode: 400, message: 'ข้อมูลไม่ครบถ้วน' })
  }

  try {
    // 🔍 สเต็ปที่ 1: ตรวจสอบก่อนว่าคนกดเป็นเจ้าของโปรเจกต์ (Owner) หรือไม่
    const project = await prisma.project.findUnique({
      where: { id: Number(projectId) }
    })

    const targetMember = await prisma.projectMember.findUnique({
      where: { id: Number(memberId) },
      include: { user: { select: { id: true, username: true } } }
    })

    const isOwner = project && project.ownerId === userId
    let hasManagePermission = false

    if (!isOwner) {
      // 🔍 สเต็ปที่ 2: ถ้าไม่ใช่ Owner ให้ไปเช็คยศ (Role) ของคนกดว่ามียศที่มีสิทธิ์คุมบอร์ดไหม
      const requesterMember = await prisma.projectMember.findFirst({
        where: { projectId: Number(projectId), userId: userId },
        include: { role: true }
      })

      if (requesterMember?.role && requesterMember.role.permissions.includes('MANAGE_PROJECT')) {
        hasManagePermission = true
      }
    }

    if (!isOwner && !hasManagePermission) {
      throw createError({
        statusCode: 403,
        message: 'คุณไม่มีสิทธิ์ระดับยศในการจัดการสมาชิกในโปรเจกต์นี้! ❌'
      })
    }

    // ผ่านด่านตรวจสิทธิ์... ดำเนินการเตะออกได้
    await prisma.projectMember.delete({
      where: { id: Number(memberId) }
    })

    if (targetMember) {
      // 1. แจ้งเตือนผู้ใช้ที่ถูกนำออก
      await prisma.notification.create({
        data: {
          userId: targetMember.userId,
          title: 'คุณถูกนำออกจากโปรเจกต์ 🚪',
          message: `คุณถูกนำออกจากโปรเจกต์ "${project?.name || ''}"`
        }
      }).catch(() => {})

      // 2. แจ้งเตือนสมาชิกคนอื่นในโปรเจกต์
      const remainingMembers = await prisma.projectMember.findMany({
        where: { projectId: Number(projectId) },
        select: { userId: true }
      })
      const recipientIds = new Set(remainingMembers.map(m => m.userId))
      if (project?.ownerId) recipientIds.add(project.ownerId)
      recipientIds.delete(userId)
      recipientIds.delete(targetMember.userId)

      if (recipientIds.size > 0) {
        await prisma.notification.createMany({
          data: Array.from(recipientIds).map(rId => ({
            userId: rId,
            title: 'สมาชิกออกจากโปรเจกต์ 🚪',
            message: `${targetMember.user.username} ถูกนำออกจากโปรเจกต์ "${project?.name || ''}"`
          }))
        }).catch(() => {})
      }
    }

    broadcastProjectUpdate(Number(projectId), 'TEAM_UPDATED')

    return { success: true, message: 'เตะสมาชิกออกจากโปรเจกต์เรียบร้อยแล้ว!' }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์เพื่อเตะสมาชิก'
    })
  }
})