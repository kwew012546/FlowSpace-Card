// server/api/notifications.delete.ts
export default defineEventHandler(async (event) => {
  if (!event.context.auth?.user) {
    throw createError({ statusCode: 401, message: 'กรุณาเข้าสู่ระบบ' })
  }
  const userId = event.context.auth.user.id

  const query = getQuery(event)
  const id = query.id ? Number(query.id) : null
  const all = query.all === 'true'

  if (all) {
    await prisma.notification.deleteMany({
      where: { userId }
    })
    return { success: true, message: 'ล้างประวัติการแจ้งเตือนทั้งหมดแล้ว' }
  }

  if (!id) {
    throw createError({ statusCode: 400, message: 'กรุณาระบุไอดีการแจ้งเตือนที่ต้องการลบ' })
  }

  await prisma.notification.deleteMany({
    where: { id, userId }
  })

  return { success: true, message: 'ลบการแจ้งเตือนแล้ว' }
})
