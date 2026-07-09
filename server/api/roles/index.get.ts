// server/api/roles/index.get.ts
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
    // ค้นหายศทั้งหมดที่อยู่ในโปรเจกต์นี้
    const roles = await prisma.role.findMany({
      where: {
        projectId: Number(projectId)
      },
      orderBy: {
        id: 'asc' // เรียงจากยศที่สร้างแรกๆ ไปท้ายๆ
      }
    })

    return {
      success: true,
      data: roles
    }
  } catch (error) {
    console.error(error)
    throw createError({
      statusCode: 500,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลยศ'
    })
  }
})