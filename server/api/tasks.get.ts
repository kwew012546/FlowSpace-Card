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

  try {
    // 1. ดึงข้อมูลรายละเอียดของโปรเจกต์ (ชื่อ, รหัสเชิญ, และไอดีเจ้าของ)
    const projectInfo = await prisma.project.findUnique({
      where: { id: Number(projectId) },
      select: {
        name: true,
        inviteCode: true,
        ownerId: true
      }
    })

    if (!projectInfo) {
      throw createError({
        statusCode: 404,
        message: 'ไม่พบโปรเจกต์นี้ในระบบ'
      })
    }

    // 2. ดึงรายการการ์ดงานทั้งหมดในโปรเจกต์นี้
    const tasks = await prisma.task.findMany({
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

    // 3. ส่งข้อมูลทั้งหมดกลับไปให้หน้าบ้านแบบจัดเต็ม
    return {
      success: true,
      projectName: projectInfo.name,     // 👈 ส่งชื่อโปรเจกต์กลับไป
      inviteCode: projectInfo.inviteCode,   // 👈 ส่งรหัส 6 หลักกลับไป
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