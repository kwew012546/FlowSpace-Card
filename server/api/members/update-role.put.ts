// server/api/members/update-role.put.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { memberId, roleId } = body // roleId เป็น null ได้ถ้าต้องการถอดยศออกเป็นสมาชิกทั่วไป

  if (!event.context.auth?.user) {
    throw createError({ statusCode: 401, message: 'กรุณาเข้าสู่ระบบ' })
  }
  const userId = event.context.auth.user.id

  if (!memberId) {
    throw createError({
      statusCode: 400,
      message: 'กรุณาระบุไอดีของสมาชิกที่ต้องการเปลี่ยนยศ'
    })
  }

  try {
    const targetMember = await prisma.projectMember.findUnique({
      where: { id: Number(memberId) },
      include: { project: true }
    })

    if (!targetMember) {
      throw createError({ statusCode: 404, message: 'ไม่พบสมาชิกที่ต้องการเปลี่ยนยศ' })
    }

    // 1. ตรวจสอบสิทธิ์ผู้ดำเนินการ (ต้องเป็น Owner หรือมียศ MANAGE_PROJECT)
    const isOwner = targetMember.project.ownerId === userId
    let hasManagePermission = false

    if (!isOwner) {
      const requesterMember = await prisma.projectMember.findFirst({
        where: { projectId: targetMember.projectId, userId },
        include: { role: true }
      })

      if (requesterMember?.role && requesterMember.role.permissions.includes('MANAGE_PROJECT')) {
        hasManagePermission = true
      }
    }

    if (!isOwner && !hasManagePermission) {
      throw createError({
        statusCode: 403,
        message: 'คุณไม่มีสิทธิ์ในการจัดการยศของสมาชิกในโปรเจกต์นี้ ❌'
      })
    }

    // 2. ป้องกันการเปลี่ยนยศของเจ้าของโครงการ
    if (targetMember.userId === targetMember.project.ownerId) {
      throw createError({
        statusCode: 400,
        message: 'เจ้าของโปรเจกต์มีสิทธิ์สูงสุดเสมอ ไม่สามารถเปลี่ยนยศได้ ❌'
      })
    }

    // 3. ตรวจสอบว่า roleId (ถ้ามี) สังกัดอยู่ในโปรเจกต์เดียวกันจริงหรือไม่ (ป้องกัน Cross-Project Role Injection)
    if (roleId) {
      const roleExists = await prisma.role.findFirst({
        where: { id: Number(roleId), projectId: targetMember.projectId }
      })
      if (!roleExists) {
        throw createError({
          statusCode: 400,
          message: 'ไม่พบตำแหน่งยศที่ระบุ หรือยศนี้ไม่ได้อยู่ในโปรเจกต์เดียวกัน ❌'
        })
      }
    }

    const updatedMember = await prisma.projectMember.update({
      where: {
        id: Number(memberId)
      },
      data: {
        roleId: roleId ? Number(roleId) : null
      },
      include: {
        role: true,
        user: { select: { id: true, username: true } }
      }
    })

    const project = await prisma.project.findUnique({
      where: { id: updatedMember.projectId },
      select: { name: true }
    })

    // แจ้งเตือนไปยังสมาชิกที่ได้รับการมอบหมายหรือปรับเปลี่ยนยศ
    if (updatedMember.role) {
      await prisma.notification.create({
        data: {
          userId: updatedMember.userId,
          title: 'คุณได้รับมอบหมายยศใหม่ 🎖️',
          message: `คุณได้รับยศ "${updatedMember.role.name}" ในโปรเจกต์ "${project?.name || ''}"`
        }
      }).catch(() => {})
    } else {
      await prisma.notification.create({
        data: {
          userId: updatedMember.userId,
          title: 'ยศของคุณถูกเปลี่ยนแปลง 🎖️',
          message: `ยศของคุณในโปรเจกต์ "${project?.name || ''}" ถูกปรับเป็นสมาชิกทั่วไป`
        }
      }).catch(() => {})
    }

    broadcastProjectUpdate(updatedMember.projectId, 'TEAM_UPDATED')

    return {
      success: true,
      message: 'อัปเดตยศให้สมาชิกเรียบร้อยแล้ว! ⚔️',
      data: updatedMember
    }
  } catch (error) {
    console.error(error)
    throw createError({
      statusCode: 500,
      message: 'ไม่สามารถเปลี่ยนยศให้สมาชิกได้'
    })
  }
})