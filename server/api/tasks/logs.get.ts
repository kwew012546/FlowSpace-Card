export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { taskId } = query

  if (!taskId) {
    throw createError({
      statusCode: 400,
      message: 'กรุณาระบุไอดีของการ์ดงาน (taskId)'
    })
  }

  if (!event.context.auth?.user) {
    throw createError({ statusCode: 401, message: 'กรุณาเข้าสู่ระบบ' })
  }
  const userId = event.context.auth.user.id

  const task = await prisma.task.findUnique({
    where: { id: Number(taskId) },
    select: { projectId: true }
  })

  if (!task) {
    throw createError({ statusCode: 404, message: 'ไม่พบการ์ดงานที่ระบุ' })
  }

  const isMember = await isProjectMember(userId, task.projectId)
  if (!isMember) {
    throw createError({ statusCode: 403, message: 'คุณไม่มีสิทธิ์เข้าถึงประวัติกิจกรรมในโปรเจกต์นี้ ❌' })
  }

  try {
    const logs = await prisma.taskLog.findMany({
      where: {
        taskId: Number(taskId)
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc' // โชว์ประวัติล่าสุดก่อน
      }
    })

    return {
      success: true,
      data: logs
    }
  } catch (error) {
    console.error(error)
    throw createError({
      statusCode: 500,
      message: 'ไม่สามารถดึงข้อมูลประวัติกิจกรรมการ์ดได้'
    })
  }
})
