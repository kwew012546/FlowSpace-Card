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
    // 1. ดึงรายละเอียดของโปรเจกต์
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    })

    if (!project) return false

    // 2. ถ้าผู้ใช้เป็นเจ้าของบอร์ด (Owner) จะได้สิทธิ์เข้าถึงทั้งหมดเสมอ
    if (project.ownerId === userId) return true

    // 3. ถ้าไม่ใช่เจ้าของบอร์ด ให้ตรวจสอบสิทธิ์ตามบทบาท (Role) ของสมาชิก
    const member = await prisma.projectMember.findFirst({
      where: {
        projectId: projectId,
        userId: userId
      },
      include: {
        role: true
      }
    })

    // ถ้าไม่ใช่สมาชิก ไม่มีสิทธิ์ใดๆ
    if (!member) return false

    // 4. ถ้ามีบทบาท (Role) ให้เช็คว่าในสิทธิ์ของบทบาทนั้นมีสิทธิ์ที่ต้องการหรือไม่
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
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    })

    if (!project) return false
    if (project.ownerId === userId) return true

    const count = await prisma.projectMember.count({
      where: { projectId, userId }
    })
    return count > 0
  } catch (error) {
    return false
  }
}
