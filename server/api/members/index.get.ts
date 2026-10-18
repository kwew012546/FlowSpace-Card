// server/api/members/index.get.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { projectId } = query

  if (!projectId) {
    throw createError({
      statusCode: 400,
      message: 'กรุณาระบุไอดีโปรเจกต์ (projectId)'
    })
  }

  if (!event.context.auth?.user) {
    throw createError({ statusCode: 401, message: 'กรุณาเข้าสู่ระบบ' })
  }
  const userId = event.context.auth.user.id

  const isMember = await isProjectMember(userId, Number(projectId))
  if (!isMember) {
    throw createError({ statusCode: 403, message: 'คุณไม่มีสิทธิ์เข้าถึงรายชื่อสมาชิกในโปรเจกต์นี้ ❌' })
  }

  try {
    // ดึงรายชื่อสมาชิกพร้อม Join ไปดึงข้อมูลชื่อผู้ใช้ (User) และข้อมูลยศ (Role)
    const members = await prisma.projectMember.findMany({
      where: {
        projectId: Number(projectId)
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        role: {
          select: {
            id: true,
            name: true,
            permissions: true
          }
        }
      },
      orderBy: {
        joinedAt: 'asc'
      }
    })

    const isAdmin = event.context.auth?.user?.role === 'ADMIN'
    const maskEmail = (email: string) => {
      if (!email || !email.includes('@')) return '***'
      const [name, domain] = email.split('@')
      if (name.length <= 2) return `${name[0]}***@${domain}`
      return `${name.slice(0, 2)}***${name.slice(-1)}@${domain}`
    }

    const sanitizedMembers = members.map(m => ({
      ...m,
      user: {
        ...m.user,
        email: (isAdmin || m.user.id === userId) ? m.user.email : maskEmail(m.user.email)
      }
    }))

    return {
      success: true,
      data: sanitizedMembers
    }
  } catch (error) {
    console.error(error)
    throw createError({
      statusCode: 500,
      message: 'เกิดข้อผิดพลาดในการดึงรายชื่อสมาชิก'
    })
  }
})