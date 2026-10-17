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
    throw createError({ statusCode: 404, message: 'ไม่พบโปรเจกต์ที่ต้องการลบ' })
  }

  const isOwner = project.ownerId === userId
  const isAdmin = event.context.auth.user.role === 'ADMIN'

  // เฉพาะเจ้าของโปรเจกต์ (Owner) หรือแอดมินระบบเท่านั้นที่ลบได้
  if (!isOwner && !isAdmin) {
    throw createError({
      statusCode: 403,
      message: 'คุณไม่มีสิทธิ์ลบโปรเจกต์นี้ ❌ เฉพาะเจ้าของโครงการหรือผู้ดูแลระบบเท่านั้นที่จะสามารถลบได้'
    })
  }

  const projectAttachments = await prisma.attachment.findMany({
    where: { task: { projectId } },
    select: { filePath: true }
  })
  removePhysicalUploadFiles(projectAttachments.map(a => a.filePath))

  await prisma.project.delete({
    where: { id: projectId }
  })

  // ส่งสัญญาณแจ้งอัปเดตสมาชิกทุกคนในโปรเจกต์
  broadcastProjectUpdate(projectId, 'PROJECT_DELETED')
  broadcastProjectUpdate(projectId, 'TEAM_UPDATED')

  return { success: true, message: 'ลบโปรเจกต์ออกจากการทำงานเรียบร้อยแล้ว!' }
})
