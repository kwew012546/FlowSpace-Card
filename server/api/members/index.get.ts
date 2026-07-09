// server/api/members/index.get.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { projectId } = query

  if (!projectId) {
    throw createError({
      statusCode: 400,
      message: 'กรุณาระบุไอดีโปรเจกต์ (projectId)'
    })
  }

  try {
    // ดึงรายชื่อสมาชิกพร้อม Join ไปดึงข้อมูลชื่อผู้ใช้ (User) และข้อมูลยศ (Role)
    const members = await prisma.projectMember.findMany({
      where: {
        projectId: Number(projectId)
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        role: {
          select: {
            id: true,
            name: true,
            permissions: true
          }
        }
      },
      orderBy: {
        joinedAt: 'asc'
      }
    })

    return {
      success: true,
      data: members
    }
  } catch (error) {
    console.error(error)
    throw createError({
      statusCode: 500,
      message: 'เกิดข้อผิดพลาดในการดึงรายชื่อสมาชิก'
    })
  }
})