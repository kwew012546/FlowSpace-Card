export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const page = Math.max(1, parseInt(String(query.page || '1'), 10) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit || '20'), 10) || 20))
  const skip = (page - 1) * limit
  const search = String(query.q || '').trim()
  const filter = String(query.filter || 'all').toLowerCase()

  const where: any = {}

  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { username: { contains: search, mode: 'insensitive' } }
    ]
  }

  if (filter === 'unverified') {
    where.isVerified = false
  } else if (filter === 'banned') {
    where.isBanned = true
  } else if (filter === 'admin') {
    where.role = 'ADMIN'
  }

  try {
    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          isVerified: true,
          isBanned: true,
          banReason: true,
          createdAt: true,
          _count: {
            select: {
              projectsOwned: true,
              projectMembers: true,
              assignedTasks: true
            }
          }
        }
      })
    ])

    return {
      success: true,
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'ไม่สามารถดึงรายชื่อผู้ใช้งานได้'
    })
  }
})
