import { z } from 'zod'

const createLabelSchema = z.object({
  projectId: z.union([z.number(), z.string()]).transform(Number),
  name: z.string().min(1, 'กรุณาระบุชื่อป้ายกำกับ').max(30, 'ป้ายกำกับยาวเกินไป'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'รูปแบบรหัสสีไม่ถูกต้อง (ตัวอย่าง: #ef4444)')
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parseResult = createLabelSchema.safeParse(body)

  if (!parseResult.success) {
    throw createError({ statusCode: 400, message: parseResult.error.issues?.[0]?.message || parseResult.error.message })
  }
  const { projectId, name, color } = parseResult.data

  if (!event.context.auth?.user) {
    throw createError({ statusCode: 401, message: 'กรุณาเข้าสู่ระบบ' })
  }
  const userId = event.context.auth.user.id

  // ตรวจสอบสิทธิ์ (ต้องมีสิทธิ์ CREATE_TASK, MANAGE_PROJECT, เป็นเจ้าของบอร์ด หรือเป็น Super Admin)
  const hasPerm = await checkPermission(userId, projectId, 'CREATE_TASK')
  if (!hasPerm) {
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
