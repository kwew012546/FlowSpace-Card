export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const page = Math.max(1, parseInt(String(query.page || '1'), 10) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit || '20'), 10) || 20))
  const skip = (page - 1) * limit
  const search = String(query.q || '').trim()

  const where: any = {}

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { inviteCode: { contains: search, mode: 'insensitive' } }
    ]
  }

  try {
    const [total, projects] = await Promise.all([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: {
          owner: {
            select: { id: true, username: true, email: true }
          },
          _count: {
            select: {
              members: true,
              tasks: true,
              columns: true
            }
          }
        }
      })
    ])

    return {
      success: true,
      projects,
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
      message: 'ไม่สามารถดึงรายชื่อโปรเจกต์ทั้งหมดได้'
    })
  }
})
