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

    if (!project) {
      throw createError({ statusCode: 404, message: 'ไม่พบโปรเจกต์ที่ระบุ' })
    }

    if (!targetMember || targetMember.projectId !== Number(projectId)) {
      throw createError({ statusCode: 404, message: 'ไม่พบสมาชิกนี้ในโปรเจกต์' })
    }

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

    // ป้องกันการเตะเจ้าของโครงการ (Owner Protection)
    if (project.ownerId === targetMember.userId) {
      throw createError({
        statusCode: 400,
        message: 'ไม่สามารถเตะเจ้าของโปรเจกต์ได้ ❌ (เจ้าของคือผู้สร้างบอร์ด)'
      })
    }

    // ป้องกันการเตะตัวเอง (Self-kick guard)
    if (targetMember.userId === userId) {
      throw createError({
        statusCode: 400,
        message: 'คุณไม่สามารถเตะตัวเองได้ ❌ หากต้องการออกจากโปรเจกต์ กรุณาใช้ปุ่ม "ออกจากโปรเจกต์" แทน'
      })
    }

    // ผ่านด่านตรวจสิทธิ์... ทำการปลดงานที่มอบหมายให้สมาชิกคนนี้ออกก่อน แล้วลบสมาชิก
    await prisma.$transaction([
      prisma.task.updateMany({
        where: { projectId: Number(projectId), assigneeId: targetMember.userId },
        data: { assigneeId: null }
      }),
      prisma.projectMember.delete({
        where: { id: Number(memberId) }
      })
    ])

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
    broadcastProjectUpdate(Number(projectId), 'TASKS_UPDATED')

    return { success: true, message: 'เตะสมาชิกออกจากโปรเจกต์เรียบร้อยแล้ว!' }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์เพื่อเตะสมาชิก'
    })
  }
})