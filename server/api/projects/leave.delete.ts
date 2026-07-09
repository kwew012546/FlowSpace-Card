export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const projectId = Number(query.projectId)

  if (!projectId) {
    throw createError({ statusCode: 400, message: 'กรุณาระบุไอดีโปรเจกต์ (projectId)' })
  }

  if (!event.context.auth?.user) {
    throw createError({ statusCode: 401, message: 'กรุณาเข้าสู่ระบบ' })
  }
  const userId = event.context.auth.user.id

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) {
    throw createError({ statusCode: 404, message: 'ไม่พบโปรเจกต์ที่ระบุ' })
  }

  // ป้องกันเจ้าของบอร์ดกดออกจากบอร์ดตนเอง
  if (project.ownerId === userId) {
    throw createError({
      statusCode: 400,
      message: 'คุณเป็นเจ้าของโปรเจกต์นี้ ไม่สามารถกดออกจากโครงการได้ ❌ (หากต้องการปิดโครงการ กรุณากดปุ่ม "ลบโครงการ" แทน)'
    })
  }

  const memberRecord = await prisma.projectMember.findFirst({
    where: { projectId, userId }
  })
  if (!memberRecord) {
    throw createError({ statusCode: 400, message: 'คุณไม่ได้เป็นสมาชิกของโปรเจกต์นี้อยู่แล้ว' })
  }

  await prisma.projectMember.delete({
    where: { id: memberRecord.id }
  })

  // ส่งสัญญาณให้บอร์ดอัปเดตแบบเรียลไทม์
  broadcastProjectUpdate(projectId, 'TEAM_UPDATED')

  return { success: true, message: 'ออกจากโปรเจกต์เรียบร้อยแล้ว' }
})
