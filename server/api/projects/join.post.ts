// server/api/projects/join.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { inviteCode } = body
  const userId = event.context.auth?.user?.id || body.userId

  if (!inviteCode || !userId) {
    throw createError({
      statusCode: 400,
      message: 'กรุณากรอกรหัสเชิญเข้าห้อง'
    })
  }

  const cleanCode = inviteCode.trim().toUpperCase()

  // 1. ค้นหาโปรเจกต์ก่อนรัน Transaction ถ้าไม่เจอให้เตือนนิ่มๆ ไม่พ่นบั๊กแดง
  const project = await prisma.project.findUnique({
    where: { inviteCode: cleanCode }
  })

  if (!project) {
    throw createError({
      statusCode: 404,
      message: '❌ ไม่พบโปรเจกต์ที่ตรงกับรหัสเชิญนี้ กรุณาตรวจสอบอีกครั้ง'
    })
  }

  // 2. ตรวจสอบสถานะการเป็นสมาชิก
  const isMember = await prisma.projectMember.findFirst({
    where: {
      projectId: project.id,
      userId: Number(userId)
    }
  })

  if (isMember) {
    throw createError({
      statusCode: 400,
      message: '📢 คุณเป็นสมาชิกของโปรเจกต์นี้อยู่แล้ว'
    })
  }

  // 3. บันทึกเข้าตารางสมาชิกเมื่อผ่านเงื่อนไขทั้งหมด
  try {
    await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: Number(userId)
      }
    })

    // ดึงชื่อผู้ใช้ที่เข้าร่วมเพื่อสร้างการแจ้งเตือน
    const joiningUser = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { username: true }
    })
    const username = joiningUser?.username || 'สมาชิกใหม่'

    // ค้นหาสมาชิกคนอื่นๆ ในโปรเจกต์และเจ้าของบอร์ดเพื่อส่งแจ้งเตือน
    const members = await prisma.projectMember.findMany({
      where: { projectId: project.id },
      select: { userId: true }
    })
    const recipientIds = new Set(members.map(m => m.userId))
    recipientIds.add(project.ownerId)
    recipientIds.delete(Number(userId)) // ไม่ต้องส่งแจ้งเตือนหาคนที่เพิ่งกดเข้าร่วมเอง

    if (recipientIds.size > 0) {
      await prisma.notification.createMany({
        data: Array.from(recipientIds).map(rId => ({
          userId: rId,
          title: 'มีสมาชิกใหม่เข้าร่วมโปรเจกต์ 👥',
          message: `${username} ได้เข้าร่วมโปรเจกต์ "${project.name}"`
        }))
      })
    }

    // ส่งสัญญาณ Real-time บรอดแคสต์ให้อัปเดตสมาชิกและกล่องแจ้งเตือน
    broadcastProjectUpdate(project.id, 'TEAM_UPDATED')

    return { 
      success: true, 
      message: `🎉 เข้าร่วมโปรเจกต์ "${project.name}" สำเร็จ!`, 
      projectId: project.id 
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'เกิดข้อผิดพลาดจากระบบฐานข้อมูลในการเข้าร่วมโปรเจกต์'
    })
  }
})