export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const projectId = Number(query.projectId)

  if (!projectId) {
    throw createError({
      statusCode: 400,
      message: 'กรุณาระบุไอดีโปรเจกต์ (projectId)'
    })
  }

  if (!event.context.auth?.user) {
    throw createError({ statusCode: 401, message: 'กรุณาเข้าสู่ระบบ' })
  }
  const userId = event.context.auth.user.id

  const [isMember, project] = await Promise.all([
    prisma.projectMember.findFirst({
      where: { projectId, userId },
      select: { id: true }
    }),
    prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true }
    })
  ])
  const isOwner = project && project.ownerId === userId

  if (!isMember && !isOwner) {
    throw createError({ statusCode: 403, message: 'คุณไม่มีสิทธิ์เข้าถึงโปรเจกต์นี้ ❌' })
  }

  // กำหนด Headers สำหรับสตรีมข้อมูล SSE
  setHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no' // ป้องกัน Proxy (เช่น Nginx) บัฟเฟอร์ข้อมูล
  })

  const resStream = event.node.res

  // ส่งข้อมูลเริ่มต้นเพื่อเช็คความพร้อมของการเชื่อมต่อ
  resStream.write('data: connected\n\n')

  const client = {
    projectId,
    send(data: any) {
      resStream.write(`data: ${JSON.stringify(data)}\n\n`)
    }
  }

  // ส่งข้อความความเคลื่อนไหวหลอก (Heartbeat/Ping) ทุก ๆ 15 วินาที เพื่อไม่ให้ Nginx/Proxy ตัดสาย
  const heartbeatInterval = setInterval(() => {
    try {
      resStream.write(': heartbeat\n\n')
    } catch (e) {
      clearInterval(heartbeatInterval)
    }
  }, 15000)

  addSseClient(projectId, client)

  // เมื่อฝั่งบราว์เซอร์ทำการปิดแท็บ หรือตัดการเชื่อมต่อ
  event.node.req.on('close', () => {
    clearInterval(heartbeatInterval)
    removeSseClient(projectId, client)
  })

  // ป้องกันเซิร์ฟเวอร์ Nitro ปิดการส่งกระแสสตรีมโดยอัตโนมัติ
  event._handled = true
})
