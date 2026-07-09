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
            email: true
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
