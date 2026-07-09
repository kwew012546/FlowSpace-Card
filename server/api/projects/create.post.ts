// server/api/projects/create.post.ts
import { randomBytes } from 'crypto'

function generateInviteCode(): string {
  return randomBytes(3).toString('hex').toUpperCase()
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, description, ownerId } = body

  if (!name || !ownerId) {
    throw createError({
      statusCode: 400,
      message: 'กรุณากรอกชื่อโปรเจกต์ให้ครบถ้วน'
    })
  }

  try {
    const inviteCode = generateInviteCode()

    const result = await prisma.$transaction(async (tx) => {
      const newProject = await tx.project.create({
        data: {
          name: name.trim(),
          description: description ? description.trim() : null,
          ownerId: Number(ownerId),
          inviteCode: inviteCode
        }
      })

      // Seed default columns (To Do, Doing, Done)
      const defaults = [
        { title: 'To Do', position: 0 },
        { title: 'Doing', position: 1 },
        { title: 'Done', position: 2 }
      ]
      for (const item of defaults) {
        await tx.column.create({
          data: {
            projectId: newProject.id,
            title: item.title,
            position: item.position
          }
        })
      }

      await tx.projectMember.create({
        data: {
          userId: Number(ownerId),
          projectId: newProject.id
        }
      })

      return newProject
    })

    return { success: true, message: 'สร้างโปรเจกต์สำเร็จ!', project: result }
  } catch (error: any) {
    console.error('Create Project Error:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลโปรเจกต์ลงฐานข้อมูล'
    })
  }
})