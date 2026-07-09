// server/api/roles/delete.delete.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { id } = query

  if (!event.context.auth?.user) {
    throw createError({ statusCode: 401, message: 'กรุณาเข้าสู่ระบบ' })
  }
  const userId = event.context.auth.user.id

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'กรุณาระบุไอดีของยศที่ต้องการลบ'
    })
  }

  try {
    const role = await prisma.role.findUnique({
      where: { id: Number(id) }
    })

    if (!role) {
      throw createError({ statusCode: 404, message: 'ไม่พบยศที่ต้องการลบ' })
    }

    const hasPerm = await checkPermission(userId, role.projectId, 'MANAGE_PROJECT')
    if (!hasPerm) {
      throw createError({ statusCode: 403, message: 'คุณไม่มีสิทธิ์ในการลบยศตำแหน่งนี้ ❌' })
    }

    await prisma.role.delete({
      where: {
        id: Number(id)
      }
    })

    broadcastProjectUpdate(role.projectId, 'TEAM_UPDATED')

    return {
      success: true,
      message: 'ลบยศออกจากโปรเจกต์เรียบร้อยแล้ว! 🗑️'
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error(error)
    throw createError({
      statusCode: 500,
      message: 'ไม่สามารถลบยศนี้ได้'
    })
  }
})