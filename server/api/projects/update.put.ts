// server/api/projects/update.put.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { id, name, description } = body
  if (!event.context.auth?.user) {
    throw createError({ statusCode: 401, message: 'กรุณาเข้าสู่ระบบ' })
  }
  const userIdToUse = event.context.auth.user.id

  if (!id || !name) {
    throw createError({
      statusCode: 400,
      message: 'กรุณาระบุข้อมูลให้ครบถ้วน (id และ name)'
    })
  }

  try {
    // 1. ตรวจสอบว่าโปรเจกต์มีอยู่จริง
    const project = await prisma.project.findUnique({
      where: { id: Number(id) }
    })

    if (!project) {
      throw createError({
        statusCode: 404,
        message: 'ไม่พบโปรเจกต์นี้ในระบบ'
      })
    }

    // ตรวจสอบสิทธิ์โดยใช้ระบบยศร่วมกับความเจ้าของโปรเจกต์
    const hasPerm = await checkPermission(userIdToUse, Number(id), 'MANAGE_PROJECT')
    if (!hasPerm) {
      throw createError({
        statusCode: 403,
        message: 'คุณไม่มีสิทธิ์แก้ไขรายละเอียดโปรเจกต์นี้ ❌'
      })
    }

    // 2. อัปเดตข้อมูลโปรเจกต์
    const updatedProject = await prisma.project.update({
      where: { id: Number(id) },
      data: {
        name: name.trim(),
        description: description ? description.trim() : null
      }
    })

    return {
      success: true,
      message: 'แก้ไขโปรเจกต์สำเร็จ!',
      project: updatedProject
    }
  } catch (error: any) {
    console.error('Update Project Error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลโปรเจกต์'
    })
  }
})