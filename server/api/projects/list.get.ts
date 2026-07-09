// server/api/projects/list.get.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const userId = query.userId

  if (!userId) {
    throw createError({
      statusCode: 400,
      message: 'ไม่พบไอดีผู้ใช้งาน'
    })
  }

  try {
    // ดึงโปรเจกต์ทั้งหมดที่ยูสเซอร์คนนี้เป็นสมาชิกอยู่ (ไม่ว่าจะสร้างเองหรือถูกเชิญ)
    const userProjects = await prisma.projectMember.findMany({
      where: {
        userId: Number(userId)
      },
      include: {
        project: {
          include: {
            owner: {
              select: {
                username: true
              }
            }
          }
        }
      },
      orderBy: {
        joinedAt: 'desc'
      }
    })

    // ดึงเฉพาะข้อมูลโปรเจกต์ออกมาเป็นอาร์เรย์แบนๆ ให้หน้าบ้านใช้ง่ายๆ
    const projects = userProjects.map(member => ({
      id: member.project.id,
      name: member.project.name,
      description: member.project.description,
      ownerName: member.project.owner.username,
      isOwner: member.project.ownerId === Number(userId)
    }))

    return { success: true, projects }

  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'ไม่สามารถดึงข้อมูลโปรเจกต์ได้'
    })
  }
})