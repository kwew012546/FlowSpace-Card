export default defineEventHandler((event) => {
  if (!event.context.auth?.user) {
    throw createError({
      statusCode: 401,
      message: 'ยังไม่ได้เข้าสู่ระบบ หรือเซสชันหมดอายุ'
    })
  }

  return {
    success: true,
    user: event.context.auth.user
  }
})
