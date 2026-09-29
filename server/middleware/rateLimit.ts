// server/middleware/rateLimit.ts
interface RateLimitRecord {
  count: number
  resetTime: number
}

// In-Memory Storage สำหรับจดจำจำนวนครั้งของแต่ละ IP
const store = new Map<string, RateLimitRecord>()

// เคลียร์ข้อมูล IP ที่หมดอายุทุกๆ 5 นาทีเพื่อป้องกัน Memory รั่วไหล
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of store.entries()) {
      if (now > record.resetTime) {
        store.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}

export default defineEventHandler((event) => {
  const path = getRequestPath(event)

  // ดักเฉพาะ API เท่านั้น (ไม่รบกวนหน้าเว็บปกติ, CSS, JS, รูปภาพ)
  if (!path.startsWith('/api/')) {
    return
  }

  // ข้ามการจำกัดอัตราหากอยู่ในช่วงรัน Automated Test
  if (process.env.NODE_ENV === 'test' || process.env.PLAYWRIGHT_TEST) {
    return
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) || event.node.req.socket?.remoteAddress || '127.0.0.1'
  const now = Date.now()

  // กำหนดโควต้าตามระดับความอ่อนไหวของ Endpoint
  const isAuthEndpoint = path.startsWith('/api/auth/login') || path.startsWith('/api/auth/register')
  const WINDOW_MS = 60 * 1000 // กรอบเวลา 1 นาที (60 วินาที)
  const MAX_LIMIT = isAuthEndpoint ? 20 : 120 // Auth ได้ 20 ครั้ง/นาที, API ทั่วไปได้ 120 ครั้ง/นาที

  const key = `${ip}:${isAuthEndpoint ? 'auth' : 'api'}`
  const record = store.get(key)

  if (!record || now > record.resetTime) {
    store.set(key, { count: 1, resetTime: now + WINDOW_MS })
    setHeaders(event, {
      'X-RateLimit-Limit': String(MAX_LIMIT),
      'X-RateLimit-Remaining': String(MAX_LIMIT - 1),
      'X-RateLimit-Reset': String(Math.ceil((now + WINDOW_MS) / 1000))
    })
    return
  }

  record.count++
  const remaining = Math.max(0, MAX_LIMIT - record.count)
  const resetSeconds = Math.ceil((record.resetTime - now) / 1000)

  setHeaders(event, {
    'X-RateLimit-Limit': String(MAX_LIMIT),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(Math.ceil(record.resetTime / 1000))
  })

  // หากคำขอเกินกำหนด ให้ปฏิเสธและตอบกลับด้วย HTTP 429
  if (record.count > MAX_LIMIT) {
    setHeader(event, 'Retry-After', String(resetSeconds))
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      message: `คุณส่งคำขอถี่เกินไป กรุณารออีก ${resetSeconds} วินาทีแล้วลองใหม่อีกครั้ง ⏳`
    })
  }
})
