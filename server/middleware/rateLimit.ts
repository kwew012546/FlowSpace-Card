// server/middleware/rateLimit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

interface RateLimitRecord {
  count: number
  resetTime: number
}

// In-Memory Storage สำหรับจดจำจำนวนครั้งของแต่ละ IP (Fallback / Local Dev)
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

// เตรียม Upstash Redis Client สำหรับ Distributed Serverless Rate Limiting
let ratelimitAuth: Ratelimit | null = null
let ratelimitApi: Ratelimit | null = null

function getDistributedLimiters() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()

  if (!url || !token) {
    return null
  }

  if (!ratelimitAuth || !ratelimitApi) {
    const redis = new Redis({ url, token })

    // โควต้า Auth: 20 ครั้งต่อ 1 นาที (Sliding Window)
    ratelimitAuth = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '60 s'),
      analytics: false,
      prefix: 'flowspace_rl_auth'
    })

    // โควต้า API ทั่วไป: 120 ครั้งต่อ 1 นาที (Sliding Window)
    ratelimitApi = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(120, '60 s'),
      analytics: false,
      prefix: 'flowspace_rl_api'
    })
  }

  return { auth: ratelimitAuth, api: ratelimitApi }
}

export default defineEventHandler(async (event) => {
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
  const isAuthEndpoint = path.startsWith('/api/auth/login') || path.startsWith('/api/auth/register')

  // 1. ลองใช้ Distributed Rate Limit ผ่าน Upstash Redis (หากมีการตั้งค่า)
  const distributedLimiters = getDistributedLimiters()
  if (distributedLimiters) {
    try {
      const activeLimiter = isAuthEndpoint ? distributedLimiters.auth : distributedLimiters.api
      const identifier = `${ip}:${isAuthEndpoint ? 'auth' : 'api'}`
      const { success, limit, remaining, reset } = await activeLimiter.limit(identifier)
      const resetSeconds = Math.max(1, Math.ceil((reset - now) / 1000))

      setHeaders(event, {
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': String(remaining),
        'X-RateLimit-Reset': String(Math.ceil(reset / 1000))
      })

      if (!success) {
        setHeader(event, 'Retry-After', String(resetSeconds))
        throw createError({
          statusCode: 429,
          statusMessage: 'Too Many Requests',
          message: `คุณส่งคำขอถี่เกินไป กรุณารออีก ${resetSeconds} วินาทีแล้วลองใหม่อีกครั้ง ⏳`
        })
      }
      return
    } catch (redisErr: any) {
      if (redisErr.statusCode === 429) {
        throw redisErr
      }
      console.warn('[RateLimit] Upstash Redis check failed, falling back to in-memory:', redisErr.message)
      // หาก Upstash มีปัญหาขัดข้อง ให้สลับไปใช้ In-Memory ทันที (Graceful Degradation กฎข้อ 6)
    }
  }

  // 2. Fallback: In-Memory Rate Limiting (สำหรับ Local Dev หรือกรณีไม่มี Upstash)
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
