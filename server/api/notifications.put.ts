import { z } from 'zod'

const markReadSchema = z.object({
  id: z.union([z.number(), z.string()]).transform(Number).optional(),
  all: z.boolean().optional()
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parseResult = markReadSchema.safeParse(body)

  if (!parseResult.success) {
    throw createError({ statusCode: 400, message: parseResult.error.errors[0].message })
  }
  const { id, all } = parseResult.data

  if (!event.context.auth?.user) {
    throw createError({ statusCode: 401, message: 'กรุณาเข้าสู่ระบบ' })
  }
  const userId = event.context.auth.user.id

  if (all) {
    await prisma.notification.updateMany({
      where: { userId },
      data: { isRead: true }
    })
    return { success: true, message: 'อ่านการแจ้งเตือนทั้งหมดแล้ว' }
  }

  if (!id) {
    throw createError({ statusCode: 400, message: 'กรุณาระบุไอดีแจ้งเตือน (id)' })
  }

  const notification = await prisma.notification.findUnique({ where: { id } })
  if (!notification || notification.userId !== userId) {
    throw createError({ statusCode: 404, message: 'ไม่พบประวัติการแจ้งเตือนที่ต้องการแก้ไข' })
  }

  await prisma.notification.update({
    where: { id },
    data: { isRead: true }
  })

  return { success: true, message: 'อ่านการแจ้งเตือนแล้ว' }
})
