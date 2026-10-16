// server/api/admin/users/delete.delete.ts
export default defineEventHandler(async (event) => {
  const currentAdmin = await requireAdmin(event)

  const query = getQuery(event)
  let body: any = null
  try {
    body = await readBody(event)
  } catch {}

  let rawUserIds: number[] = []

  if (Array.isArray(body?.userIds)) {
    rawUserIds = body.userIds.map((id: any) => parseInt(String(id), 10)).filter((id: number) => !isNaN(id) && id > 0)
  } else if (typeof query.userIds === 'string') {
    rawUserIds = query.userIds.split(',').map((id: string) => parseInt(id.trim(), 10)).filter((id: number) => !isNaN(id) && id > 0)
  } else {
    const rawUserId = query.userId || body?.userId
    const singleId = parseInt(String(rawUserId), 10)
    if (!isNaN(singleId) && singleId > 0) {
      rawUserIds = [singleId]
    }
  }

  // กำจัด ID ซ้ำ
  let targetUserIds = Array.from(new Set(rawUserIds))

  // projectHandling: 'transfer' (โอนสิทธิ์โครงการให้สมาชิกคนอื่นในทีม ถ้าไม่มีสมาชิกอื่นให้ลบทิ้ง) | 'delete' (ลบทุกโครงการที่ผู้ใช้นี้เป็นเจ้าของ)
  const projectHandling = String(query.projectHandling || body?.projectHandling || 'transfer')

  if (targetUserIds.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'กรุณาระบุรหัสผู้ใช้งานที่ต้องการลบอย่างน้อย 1 คน'
    })
  }

  // 🛡️ Guard 1: Anti-Self-Delete (ป้องกันแอดมินลบบัญชีตนเอง)
  if (targetUserIds.includes(currentAdmin.id)) {
    if (targetUserIds.length === 1) {
      throw createError({
        statusCode: 400,
        message: 'คุณไม่สามารถลบบัญชีของตนเองได้ เพื่อป้องกันระบบขาดผู้ดูแลระบบ 🛡️'
      })
    }
    // หากเลือกลบหลายคนพร้อมกัน ให้กรองตนเองออกจากรายการลบโดยอัตโนมัติ
    targetUserIds = targetUserIds.filter(id => id !== currentAdmin.id)
  }

  // ดึงข้อมูลผู้ใช้ที่ตรงกับ ID ทั้งหมด
  const targetUsers = await prisma.user.findMany({
    where: { id: { in: targetUserIds } },
    include: {
      projectsOwned: {
        include: {
          members: {
            where: { userId: { notIn: targetUserIds } }, // ต้องไม่โอนให้คนที่กำลังจะถูกลบในล็อตเดียวกัน
            orderBy: { joinedAt: 'asc' },
            include: {
              user: {
                select: { id: true, username: true, email: true }
              }
            }
          }
        }
      },
      projectMembers: {
        select: { projectId: true }
      },
      assignedTasks: {
        select: { id: true, projectId: true }
      }
    }
  })

  if (targetUsers.length === 0) {
    throw createError({
      statusCode: 404,
      message: 'ไม่พบบัญชีผู้ใช้งานที่ต้องการลบในระบบ'
    })
  }

  // 🛡️ Guard 2: ป้องกันการลบ Admin ทั้งหมดจนไม่มี Admin เหลือในระบบ
  const deletingAdmins = targetUsers.filter(u => u.role === 'ADMIN')
  if (deletingAdmins.length > 0) {
    const totalAdmins = await prisma.user.count({ where: { role: 'ADMIN' } })
    if (totalAdmins - deletingAdmins.length < 1) {
      throw createError({
        statusCode: 400,
        message: 'ไม่สามารถลบกลุ่มผู้ใช้นี้ได้ เนื่องจากจะทำให้ระบบไม่มีผู้ดูแลระบบ (Admin) หลงเหลืออยู่ 🛡️'
      })
    }
  }

  const validTargetUserIds = targetUsers.map(u => u.id)

  // เตรียมรายการโปรเจกต์ที่ต้องโอนสิทธิ์ หรือต้องลบ (ไม่ซ้ำ ID)
  const projectsToTransfer: Array<{
    projectId: number
    projectName: string
    newOwnerId: number
    newOwnerUsername: string
  }> = []

  const projectsToDelete: Array<{
    projectId: number
    projectName: string
  }> = []

  const handledProjectIds = new Set<number>()

  for (const user of targetUsers) {
    for (const proj of user.projectsOwned) {
      if (handledProjectIds.has(proj.id)) continue
      handledProjectIds.add(proj.id)

      if (projectHandling === 'transfer') {
        if (proj.members.length > 0) {
          // มีสมาชิกคนอื่นในทีมที่ไม่ถูกลบ -> โอนสิทธิ์เจ้าของให้สมาชิกคนแรก
          const successor = proj.members[0]
          projectsToTransfer.push({
            projectId: proj.id,
            projectName: proj.name,
            newOwnerId: successor.userId,
            newOwnerUsername: successor.user.username
          })
        } else {
          // ไม่มีสมาชิกอื่นเลย -> ลบโปรเจกต์ทิ้งอย่างปลอดภัย
          projectsToDelete.push({
            projectId: proj.id,
            projectName: proj.name
          })
        }
      } else {
        // Admin สั่งลบโปรเจกต์ทั้งหมดของผู้ใช้กลุ่มนี้ทิ้ง
        projectsToDelete.push({
          projectId: proj.id,
          projectName: proj.name
        })
      }
    }
  }

  const allAffectedMemberProjectIds = Array.from(new Set(
    targetUsers.flatMap(u => u.projectMembers.map(pm => pm.projectId))
  ))

  try {
    await prisma.$transaction(async (tx) => {
      // 1. โอนสิทธิ์ความเป็นเจ้าของโครงการ (Ownership Transfer)
      for (const item of projectsToTransfer) {
        await tx.project.update({
          where: { id: item.projectId },
          data: { ownerId: item.newOwnerId }
        })

        await tx.notification.create({
          data: {
            userId: item.newOwnerId,
            title: '👑 ได้รับสิทธิ์เป็นเจ้าของโปรเจกต์',
            message: `คุณได้รับการแต่งตั้งเป็นเจ้าของบอร์ด "${item.projectName}" แทนที่เจ้าของเดิมที่ถูกลบบัญชี`
          }
        })
      }

      // 2. ลบโปรเจกต์ที่ไม่มีสมาชิกอื่น หรือที่เลือกสั่งลบทิ้ง
      for (const item of projectsToDelete) {
        await tx.project.delete({
          where: { id: item.projectId }
        })
      }

      // 3. ปลดการมอบหมายงาน (Unassign Tasks) ในการ์ดงานทั้งหมดของกลุ่มผู้ใช้นี้
      await tx.task.updateMany({
        where: { assigneeId: { in: validTargetUserIds } },
        data: { assigneeId: null }
      })

      // 4. ถอดชื่อผู้ใช้ออกจากรายการสมาชิกทุกโปรเจกต์
      await tx.projectMember.deleteMany({
        where: { userId: { in: validTargetUserIds } }
      })

      // 5. ลบแถวผู้ใช้งานออกจากตาราง User อย่างถาวร (ปลดล็อกอีเมลให้ใช้สมัครใหม่ได้ทันที)
      await tx.user.deleteMany({
        where: { id: { in: validTargetUserIds } }
      })
    })

    // 6. ส่ง Real-Time SSE แจ้งเตือนทุกโปรเจกต์ที่ได้รับผลกระทบ (Closed-Loop UX)
    for (const item of projectsToDelete) {
      broadcastProjectUpdate(item.projectId, 'PROJECT_DELETED')
    }

    for (const item of projectsToTransfer) {
      broadcastProjectUpdate(item.projectId, 'TEAM_UPDATED')
    }

    for (const pId of allAffectedMemberProjectIds) {
      if (!projectsToDelete.some(p => p.projectId === pId)) {
        broadcastProjectUpdate(pId, 'TEAM_UPDATED')
      }
    }

    const deletedUsernames = targetUsers.map(u => `@${u.username}`).join(', ')
    const message = targetUsers.length === 1
      ? `ลบบัญชีผู้ใช้ ${deletedUsernames} (${targetUsers[0].email}) เรียบร้อยแล้ว อีเมลสามารถนำกลับมาสมัครใหม่ได้ทันที ✅`
      : `ลบบัญชีผู้ใช้ทั้งหมด ${targetUsers.length} คน (${deletedUsernames}) ออกจากระบบเรียบร้อยแล้ว ✅`

    return {
      success: true,
      message,
      deletedCount: targetUsers.length,
      deletedUsers: targetUsers.map(u => ({ id: u.id, username: u.username, email: u.email })),
      summary: {
        transferredProjectsCount: projectsToTransfer.length,
        deletedProjectsCount: projectsToDelete.length,
        unassignedTasksCount: targetUsers.reduce((sum, u) => sum + u.assignedTasks.length, 0)
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('Delete Users Error:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'เกิดข้อผิดพลาดในการลบผู้ใช้งานออกจากระบบ'
    })
  }
})
