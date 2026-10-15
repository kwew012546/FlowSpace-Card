export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  try {
    const [
      totalUsers,
      verifiedUsers,
      unverifiedUsers,
      bannedUsers,
      adminUsers,
      totalProjects,
      totalTasks,
      totalLogs
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isVerified: true } }),
      prisma.user.count({ where: { isVerified: false } }),
      prisma.user.count({ where: { isBanned: true } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.project.count(),
      prisma.task.count(),
      prisma.taskLog.count()
    ])

    const verificationRate = totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0

    return {
      success: true,
      stats: {
        totalUsers,
        verifiedUsers,
        unverifiedUsers,
        bannedUsers,
        adminUsers,
        verificationRate,
        totalProjects,
        totalTasks,
        totalLogs
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'ไม่สามารถดึงข้อมูลสถิติภาพรวมระบบได้'
    })
  }
})
