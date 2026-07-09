import { z } from 'zod'

const createLabelSchema = z.object({
  projectId: z.union([z.number(), z.string()]).transform(Number),
  name: z.string().min(1, 'กรุณาระบุชื่อป้ายป้ายป้ายกำกับ').max(30, 'ป้ายกำกับยาวเกินไป'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'รูปแบบรหัสสีไม่ถูกต้อง (ตัวอย่าง: #ef4444)')
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parseResult = createLabelSchema.safeParse(body)

  if (!parseResult.success) {
    throw createError({ statusCode: 400, message: parseResult.error.errors[0].message })
  }
  const { projectId, name, color } = parseResult.data

  if (!event.context.auth?.user) {
    throw createError({ statusCode: 401, message: 'กรุณาเข้าสู่ระบบ' })
  }
  const userId = event.context.auth.user.id

  // ตรวจสอบสิทธิ์
  const isMember = await prisma.projectMember.findFirst({
    where: { projectId, userId }
  })
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  const isOwner = project && project.ownerId === userId

  if (!isMember && !isOwner) {
    throw createError({ statusCode: 403, message: 'คุณไม่มีสิทธิ์สร้างป้ายกำกับในโปรเจกต์นี้ ❌' })
  }

  const label = await prisma.label.create({
    data: {
      projectId,
      name: name.trim(),
      color: color.toUpperCase()
    }
  })

  broadcastProjectUpdate(projectId, 'TASKS_UPDATED')

  return { success: true, data: label }
})
