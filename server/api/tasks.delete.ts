// server/api/tasks.delete.ts

export default defineEventHandler(async (event) => {
  // 1. อ่านค่า id ที่หน้าบ้านส่งมา (ส่งมาผ่าน Query เช่น /api/tasks?id=5)
  const query = getQuery(event)
  const id = query.id

  if (!event.context.auth?.user) {
    throw createError({ statusCode: 401, message: 'กรุณาเข้าสู่ระบบ' })
  }
  const userId = event.context.auth.user.id

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'กรุณาระบุ ID ที่ต้องการลบ',
    })
  }

  try {
    // 1. ค้นหางานเพื่อตรวจสอบว่าอยู่ในโปรเจกต์ไหน
    const task = await prisma.task.findUnique({
      where: { id: Number(id) }
    })

    if (!task) {
      throw createError({ statusCode: 404, message: 'ไม่พบงานที่ต้องการลบในระบบ' })
    }

    // 2. ตรวจสอบสิทธิ์การลบ
    const hasPerm = await checkPermission(userId, task.projectId, 'DELETE_TASK')
    if (!hasPerm) {
      throw createError({ statusCode: 403, message: 'คุณไม่มีสิทธิ์ลบงานในโปรเจกต์นี้ ❌' })
    }

    // 3. สั่ง Prisma ลบงานชิ้นนั้นออกจากตาราง PostgreSQL
    await prisma.task.delete({
      where: {
        id: Number(id)
      }
    })

    broadcastProjectUpdate(task.projectId, 'TASKS_UPDATED')

    return { success: true, message: 'ลบงานเรียบร้อยแล้ว' }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, message: 'ไม่สามารถลบงานได้ เนื่องจากระบบฐานข้อมูลขัดข้อง' })
  }
})