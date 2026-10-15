// server/api/projects/list.get.ts
export default defineEventHandler(async (event) => {
  if (!event.context.auth?.user) {
    throw createError({
      statusCode: 401,
      message: 'กรุณาเข้าสู่ระบบ'
    })
  }

  // ป้องกัน IDOR: ใช้ ID จาก Session ที่ผ่านการยืนยันแล้วเสมอ
  const userId = event.context.auth.user.id

  try {
    // ดึงโปรเจกต์ทั้งหมดที่ยูสเซอร์คนนี้เป็นเจ้าของ หรือเป็นสมาชิกในทีม (ป้องกันเคส Owner หลุดจากตารางสมาชิก)
    const userProjects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: Number(userId) },
          { members: { some: { userId: Number(userId) } } }
        ]
      },
      include: {
        owner: {
          select: {
            username: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // ดึงเฉพาะข้อมูลโปรเจกต์ออกมาเป็นอาร์เรย์แบนๆ ให้หน้าบ้านใช้ง่ายๆ
    const projects = userProjects.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      ownerName: p.owner.username,
      isOwner: p.ownerId === Number(userId)
    }))

    return { success: true, projects }

  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'ไม่สามารถดึงข้อมูลโปรเจกต์ได้'
    })
  }
})