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

    // 3. เพิ่มบันทึกลงตาราง ProjectMember
    await prisma.projectMember.create({
      data: {
        projectId: Number(projectId),
        userId: targetUser.id
        // roleId สามารถเพิ่มเพื่อแบ่งสิทธิ์ Admin/Member ได้ในอนาคต
      }
    })

    return { success: true, message: `เชิญ ${targetUser.username} เข้าสู่โปรเจกต์เรียบร้อยแล้ว!` }

  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'เกิดข้อผิดพลาดหลังบ้านในการเชิญสมาชิก'
    })
  }
})