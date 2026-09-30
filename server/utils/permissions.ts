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
    // ดึงรายละเอียดของโปรเจกต์และข้อมูลสมาชิกพร้อมกันในรอบเดียว (Parallel Query)
    const [project, member] = await Promise.all([
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
    const [project, count] = await Promise.all([
      prisma.project.findUnique({
        where: { id: projectId },
        select: { ownerId: true }
      }),
      prisma.projectMember.count({
        where: { projectId, userId }
      })
    ])

    if (!project) return false
    if (project.ownerId === userId) return true

    return count > 0
  } catch (error) {
    return false
  }
}
