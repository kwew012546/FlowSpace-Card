// server/api/projects/invite.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { projectId, email } = body

  if (!projectId || !email) {
    throw createError({
      statusCode: 400,
      message: 'กรุณาระบุไอดีโปรเจกต์และอีเมลผู้รับเชิญ'
    })
  }

  try {
    // 1. ค้นหาผู้ใช้จากอีเมลในระบบก่อน
    const targetUser = await prisma.user.findUnique({
      where: { email: email.trim() }
    })

    if (!targetUser) {
      throw createError({
        statusCode: 404,
        message: 'ไม่พบผู้ใช้งานที่ใช้อีเมลนี้ในระบบ'
      })
    }

    // 2. เช็คว่าผู้ใช้คนนี้เป็นสมาชิกในโปรเจกต์นี้อยู่แล้วหรือยัง
    const isAlreadyMember = await prisma.projectMember.findFirst({
      where: {
        projectId: Number(projectId),
        userId: targetUser.id
      }
    })

    if (isAlreadyMember) {
      throw createError({
        statusCode: 400,
        message: 'ผู้ใช้งานคนนี้เป็นสมาชิกในโปรเจกต์นี้อยู่แล้ว'
      })
    }

    const project = await prisma.project.findUnique({
      where: { id: Number(projectId) },
      select: { id: true, name: true, ownerId: true }
    })

    // 3. เพิ่มบันทึกลงตาราง ProjectMember
    await prisma.projectMember.create({
      data: {
        projectId: Number(projectId),
        userId: targetUser.id
        // roleId สามารถเพิ่มเพื่อแบ่งสิทธิ์ Admin/Member ได้ในอนาคต
      }
    })

    // แจ้งเตือนผู้ใช้ที่ได้รับเชิญ
    await prisma.notification.create({
      data: {
        userId: targetUser.id,
        title: 'คุณได้รับเชิญเข้าร่วมโปรเจกต์ 🎉',
        message: `คุณได้ถูกเพิ่มเข้าสู่โปรเจกต์ "${project?.name || ''}"`
      }
    }).catch(() => {})

    // แจ้งเตือนสมาชิกคนอื่นในโปรเจกต์
    const members = await prisma.projectMember.findMany({
      where: { projectId: Number(projectId) },
      select: { userId: true }
    })
    const recipientIds = new Set(members.map(m => m.userId))
    if (project?.ownerId) recipientIds.add(project.ownerId)
    recipientIds.delete(targetUser.id)

    if (recipientIds.size > 0) {
      await prisma.notification.createMany({
        data: Array.from(recipientIds).map(rId => ({
          userId: rId,
          title: 'มีสมาชิกใหม่เข้าร่วมโปรเจกต์ 👥',
          message: `${targetUser.username} ได้เข้าร่วมโปรเจกต์ "${project?.name || ''}"`
        }))
      }).catch(() => {})
    }

    broadcastProjectUpdate(Number(projectId), 'TEAM_UPDATED')

    return { success: true, message: `เชิญ ${targetUser.username} เข้าสู่โปรเจกต์เรียบร้อยแล้ว!` }

  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'เกิดข้อผิดพลาดหลังบ้านในการเชิญสมาชิก'
    })
  }
})