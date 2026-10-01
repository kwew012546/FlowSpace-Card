// server/api/projects/invite-settings.put.ts
import { randomBytes } from 'crypto'

export default defineEventHandler(async (event) => {
  if (!event.context.auth?.user) {
    throw createError({ statusCode: 401, message: 'กรุณาเข้าสู่ระบบ' })
  }
  const userId = event.context.auth.user.id

  const body = await readBody(event)
  const { projectId, isInviteActive, regenerateCode } = body

  if (!projectId) {
    throw createError({ statusCode: 400, message: 'กรุณาระบุไอดีโปรเจกต์' })
  }

  // 1. ตรวจสอบสิทธิ์ว่าคนกดเป็น Owner หรือมียศ MANAGE_PROJECT หรือไม่
  const project = await prisma.project.findUnique({
    where: { id: Number(projectId) }
  })

  if (!project) {
    throw createError({ statusCode: 404, message: 'ไม่พบโปรเจกต์ที่ระบุ' })
  }

  const isOwner = project.ownerId === userId

  if (!isOwner) {
    const requesterMember = await prisma.projectMember.findFirst({
      where: { projectId: Number(projectId), userId },
      include: { role: true }
    })

    if (!requesterMember?.role?.permissions.includes('MANAGE_PROJECT')) {
      throw createError({
        statusCode: 403,
        message: 'คุณไม่มีสิทธิ์ในการจัดการการตั้งค่ารหัสเชิญของโปรเจกต์นี้ ❌'
      })
    }
  }

  // 2. ดำเนินการอัปเดตตามคำขอ
  const updateData: any = {}

  if (typeof isInviteActive === 'boolean') {
    updateData.isInviteActive = isInviteActive
  }

  if (regenerateCode) {
    updateData.inviteCode = randomBytes(3).toString('hex').toUpperCase()
  }

  if (Object.keys(updateData).length === 0) {
    return { success: true, data: project }
  }

  const updatedProject = await prisma.project.update({
    where: { id: Number(projectId) },
    data: updateData,
    select: {
      id: true,
      name: true,
      inviteCode: true,
      isInviteActive: true
    }
  })

  // ส่งสัญญาณ Real-time บรอดแคสต์ให้อัปเดตสถานะรหัสทันที
  broadcastProjectUpdate(Number(projectId), 'TEAM_UPDATED')

  let message = 'อัปเดตการตั้งค่ารหัสเชิญเรียบร้อยแล้ว'
  if (regenerateCode && typeof isInviteActive === 'boolean') {
    message = 'สุ่มรหัสเชิญใหม่และอัปเดตสถานะเรียบร้อยแล้ว! 🔄'
  } else if (regenerateCode) {
    message = 'สุ่มรหัสเชิญเข้าโปรเจกต์ใหม่เรียบร้อยแล้ว! 🔄'
  } else if (typeof isInviteActive === 'boolean') {
    message = isInviteActive ? 'เปิดรับสมาชิกผ่านรหัสเชิญเรียบร้อยแล้ว 🔓' : 'ปิดรับสมาชิกผ่านรหัสเชิญชั่วคราวแล้ว 🔒'
  }

  return {
    success: true,
    message,
    data: updatedProject
  }
})
