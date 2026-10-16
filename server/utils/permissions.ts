// server/utils/permissions.ts
import { prisma } from './prisma'

/**
 * ตรวจสอบสิทธิ์การใช้งานของผู้ใช้ในโปรเจกต์
 * @param userId ID ของผู้ใช้ที่ต้องการตรวจสอบ
 * @param projectId ID ของโปรเจกต์
 * @param permission สิทธิ์ที่ต้องการตรวจสอบ (เช่น 'CREATE_TASK', 'DELETE_TASK', 'MANAGE_PROJECT')
 */
export async function checkPermission(userId: number, projectId: number, permission: string): Promise<boolean> {
  try {
    // ดึงรายละเอียดของผู้ใช้, โปรเจกต์ และข้อมูลสมาชิกพร้อมกันในรอบเดียว (Parallel Query)
    const [user, project, member] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      }),
      prisma.project.findUnique({
        where: { id: projectId },
        select: { ownerId: true }
      }),
      prisma.projectMember.findFirst({
        where: {
          projectId: projectId,
          userId: userId
        },
        include: {
          role: true
        }
      })
    ])

    if (!project) return false

    // 🛡️ Super Admin ของแพลตฟอร์ม มีสิทธิ์เต็มในการจัดการทุกโปรเจกต์
    if (user?.role === 'ADMIN') return true

    // ถ้าผู้ใช้เป็นเจ้าของบอร์ด (Owner) จะได้สิทธิ์เข้าถึงทั้งหมดเสมอ
    if (project.ownerId === userId) return true

    // ถ้าไม่ใช่สมาชิก ไม่มีสิทธิ์ใดๆ
    if (!member) return false

    // ถ้ามีบทบาท (Role) ให้เช็คว่าในสิทธิ์ของบทบาทนั้นมีสิทธิ์ที่ต้องการหรือไม่
    if (member.role && member.role.permissions.includes(permission)) {
      return true
    }

    return false
  } catch (error) {
    console.error('Error checking permission:', error)
    return false
  }
}

/**
 * ตรวจสอบสถานะการเป็นสมาชิกในโปรเจกต์ (สำหรับใช้จำกัดสิทธิ์ทั่วไปเช่นการดูหรือย้ายงาน)
 */
export async function isProjectMember(userId: number, projectId: number): Promise<boolean> {
  try {
    const [user, project, count] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      }),
      prisma.project.findUnique({
        where: { id: projectId },
        select: { ownerId: true }
      }),
      prisma.projectMember.count({
        where: { projectId, userId }
      })
    ])

    if (!project) return false

    // 🛡️ Super Admin เข้าดูได้ทุกบอร์ดเพื่อกำกับดูแลระบบ
    if (user?.role === 'ADMIN') return true

    if (project.ownerId === userId) return true

    return count > 0
  } catch (error) {
    return false
  }
}

/**
 * ตรวจสอบว่าผู้กระทำเป็น Platform Admin ที่ไม่ได้เป็นเจ้าของหรือสมาชิกในโปรเจกต์นั้นหรือไม่
 * หากใช่ และมีการแก้ไขโครงสร้างบอร์ด (เช่น คอลัมน์) สามารถส่งแจ้งเตือนให้เจ้าของโปรเจกต์รับทราบได้
 */
export async function notifyOwnerIfExternalAdmin(
  userId: number,
  projectId: number,
  actionDescription: string
): Promise<boolean> {
  try {
    const [user, project, memberCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { username: true, role: true }
      }),
      prisma.project.findUnique({
        where: { id: projectId },
        select: { ownerId: true, name: true }
      }),
      prisma.projectMember.count({
        where: { projectId, userId }
      })
    ])

    if (!user || !project) return false

    const isExternalAdmin = user.role === 'ADMIN' && project.ownerId !== userId && memberCount === 0
    if (isExternalAdmin && actionDescription) {
      await prisma.notification.create({
        data: {
          userId: project.ownerId,
          title: '🛡️ [ผู้ดูแลระบบ] แก้ไขข้อมูลในบอร์ดของคุณ',
          message: `ผู้ดูแลระบบ (${user.username}) ${actionDescription} ในโปรเจกต์ "${project.name}"`
        }
      })
    }
    return isExternalAdmin
  } catch {
    return false
  }
}
