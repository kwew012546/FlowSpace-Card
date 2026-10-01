// server/api/tasks/get.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const projectId = query.projectId

  if (!projectId) {
    throw createError({
      statusCode: 400,
      message: 'กรุณาระบุไอดีโปรเจกต์'
    })
  }

  if (!event.context.auth?.user) {
    throw createError({ statusCode: 401, message: 'กรุณาเข้าสู่ระบบ' })
  }
  const userId = event.context.auth.user.id

  try {
    // ดึงสิทธิ์สมาชิก, ข้อมูลโปรเจกต์ และรายการการ์ดงานพร้อมกันในรอบเดียว (ลด Latency 3 เท่า)
    const [memberRecord, projectInfo, tasks] = await Promise.all([
      prisma.projectMember.findFirst({
        where: { projectId: Number(projectId), userId },
        select: {
          id: true,
          role: {
            select: { permissions: true }
          }
        }
      }),
      prisma.project.findUnique({
        where: { id: Number(projectId) },
        select: {
          name: true,
          inviteCode: true,
          isInviteActive: true,
          ownerId: true
        }
      }),
      prisma.task.findMany({
        where: {
          projectId: Number(projectId)
        },
        include: {
          assignee: {
            select: {
              id: true,
              username: true,
              email: true
            }
          },
          labels: true,
          subtasks: true,
          attachments: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      })
    ])

    const isOwner = projectInfo && projectInfo.ownerId === userId

    if (!memberRecord && !isOwner) {
      throw createError({ statusCode: 403, message: 'คุณไม่มีสิทธิ์เข้าถึงโปรเจกต์นี้ ❌' })
    }

    if (!projectInfo) {
      throw createError({
        statusCode: 404,
        message: 'ไม่พบโปรเจกต์นี้ในระบบ'
      })
    }

    // ตรวจสอบสิทธิ์การมองเห็นรหัสเชิญ (Owner หรือมียศ INVITE_MEMBERS / MANAGE_PROJECT)
    const canInvite = isOwner || 
      memberRecord?.role?.permissions.includes('INVITE_MEMBERS') || 
      memberRecord?.role?.permissions.includes('MANAGE_PROJECT')

    // 3. ส่งข้อมูลทั้งหมดกลับไปให้หน้าบ้านแบบจัดเต็ม
    return {
      success: true,
      projectName: projectInfo.name,     // 👈 ส่งชื่อโปรเจกต์กลับไป
      inviteCode: canInvite ? projectInfo.inviteCode : null,   // 👈 ส่งรหัส 6 หลักเฉพาะผู้มีสิทธิ์
      isInviteActive: projectInfo.isInviteActive, // 👈 ส่งสถานะเปิด/ปิดรับคน
      ownerId: projectInfo.ownerId,       // 👈 ส่งไอดีเจ้าของโปรเจกต์กลับไป
      data: tasks
    }

  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลจากฐานข้อมูล'
    })
  }
})