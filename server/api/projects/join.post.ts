// server/api/projects/join.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { inviteCode, userId } = body

  if (!inviteCode || !userId) {
    throw createError({
      statusCode: 400,
      message: 'กรุณากรอกรหัสเชิญเข้าห้อง'
    })
  }

  const cleanCode = inviteCode.trim().toUpperCase()

  // 1. ค้นหาโปรเจกต์ก่อนรัน Transaction ถ้าไม่เจอให้เตือนนิ่มๆ ไม่พ่นบั๊กแดง
  const project = await prisma.project.findUnique({
    where: { inviteCode: cleanCode }
  })

  if (!project) {
    throw createError({
      statusCode: 404,
      message: '❌ ไม่พบโปรเจกต์ที่ตรงกับรหัสเชิญนี้ กรุณาตรวจสอบอีกครั้ง'
    })
  }

  // 2. ตรวจสอบสถานะการเป็นสมาชิก
  const isMember = await prisma.projectMember.findFirst({
    where: {
      projectId: project.id,
      userId: Number(userId)
    }
  })

  if (isMember) {
    throw createError({
      statusCode: 400,
      message: '📢 คุณเป็นสมาชิกของโปรเจกต์นี้อยู่แล้ว'
    })
  }

  // 3. บันทึกเข้าตารางสมาชิกเมื่อผ่านเงื่อนไขทั้งหมด
  try {
    await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: Number(userId)
      }
    })

    return { 
      success: true, 
      message: `🎉 เข้าร่วมโปรเจกต์ "${project.name}" สำเร็จ!`, 
      projectId: project.id 
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'เกิดข้อผิดพลาดจากระบบฐานข้อมูลในการเข้าร่วมโปรเจกต์'
    })
  }
})