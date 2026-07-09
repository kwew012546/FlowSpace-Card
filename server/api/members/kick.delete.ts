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

    // ถ้าคนกดคือเจ้าของบอร์ดตัวจริง... ให้ปล่อยผ่านไปสั่งเตะได้ทันที
    if (project && project.ownerId === userId) {
      await prisma.projectMember.delete({ where: { id: Number(memberId) } })
      broadcastProjectUpdate(Number(projectId), 'TEAM_UPDATED')
      return { success: true, message: 'เตะสมาชิกออกจากทีมเรียบร้อยแล้ว! 🚪' }
    }

    // 🔍 สเต็ปที่ 2: ถ้าไม่ใช่ Owner ให้ไปเช็คยศ (Role) ของคนกดว่ามียศที่มีสิทธิ์คุมบอร์ดไหม
    const requesterMember = await prisma.projectMember.findFirst({
      where: { projectId: Number(projectId), userId: userId },
      include: { role: true }
    })

    // ตรวจสอบสิทธิ์ว่ามียศไหม และในอาร์เรย์ permissions มียศคำว่า 'MANAGE_PROJECT' หรือเปล่า
    if (!requesterMember?.role || !requesterMember.role.permissions.includes('MANAGE_PROJECT')) {
      throw createError({
        statusCode: 403,
        message: 'คุณไม่มีสิทธิ์ระดับยศในการจัดการสมาชิกในโปรเจกต์นี้! ❌'
      })
    }

    // ผ่านด่านตรวจสิทธิ์... ดำเนินการเตะออกได้
    await prisma.projectMember.delete({
      where: { id: Number(memberId) }
    })

    broadcastProjectUpdate(Number(projectId), 'TEAM_UPDATED')

    return { success: true, message: 'เตะสมาชิกออกจากโปรเจกต์เรียบร้อยแล้ว!' }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์เพื่อเตะสมาชิก'
    })
  }
})