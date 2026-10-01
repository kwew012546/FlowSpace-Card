// server/api/members/update-role.put.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { memberId, roleId } = body // roleId เป็น null ได้ถ้าต้องการถอดยศออกเป็นสมาชิกทั่วไป

  if (!memberId) {
    throw createError({
      statusCode: 400,
      message: 'กรุณาระบุไอดีของสมาชิกที่ต้องการเปลี่ยนยศ'
    })
  }

  try {
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