// server/utils/targetRateLimit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

/**
 * โครงสร้างข้อมูลสำหรับเก็บบันทึกโควต้าในหน่วยความจำ (In-Memory Fallback)
 */
interface InMemoryRecord {
  count: number
  resetTime: number
}

const memoryStore = new Map<string, InMemoryRecord>()

// เคลียร์ข้อมูลที่หมดอายุในหน่วยความจำทุก 5 นาที ป้องกัน Memory Leak
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of memoryStore.entries()) {
      if (now > record.resetTime) {
        memoryStore.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}

// Singleton Redis Client
let redisInstance: Redis | null = null
let forgotPasswordLimiter: Ratelimit | null = null
let resendVerificationLimiter: Ratelimit | null = null
let globalForgotLimiter: Ratelimit | null = null
let globalRegisterLimiter: Ratelimit | null = null

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()

  if (!url || !token) {
    return null
  }

  if (!redisInstance) {
    redisInstance = new Redis({ url, token })
  }

  return redisInstance
}

function getLimiters() {
  const redis = getRedis()
  if (!redis) return null

  if (!forgotPasswordLimiter || !resendVerificationLimiter || !globalForgotLimiter || !globalRegisterLimiter) {
    // โควต้า Forgot Password ต่ออีเมล: สูงสุด 3 ครั้งใน 15 นาที (900 วินาที)
    forgotPasswordLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, '900 s'),
      analytics: false,
      prefix: 'flowspace_tgt_forgot'
    })

    // โควต้า Resend Verification ต่ออีเมล: สูงสุด 3 ครั้งใน 15 นาที (900 วินาที)
    resendVerificationLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, '900 s'),
      analytics: false,
      prefix: 'flowspace_tgt_resend'
    })

    // โควต้า Forgot Password รวมทั้งระบบ: 60 ครั้งต่อ 1 นาที (ป้องกัน Email Bombing กวาดล้างโควต้า SMTP)
    globalForgotLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, '60 s'),
      analytics: false,
      prefix: 'flowspace_glb_forgot'
    })

    // โควต้า สมัครสมาชิก รวมทั้งระบบ: 20 ครั้งต่อ 1 นาที (ป้องกันบอทสร้างบัญชีขยะพร้อมกัน)
    globalRegisterLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '60 s'),
      analytics: false,
      prefix: 'flowspace_glb_reg'
    })
  }

  return {
    redis,
    forgotPasswordLimiter,
    resendVerificationLimiter,
    globalForgotLimiter,
    globalRegisterLimiter
  }
}

/**
 * 1. ตรวจจับ Honeypot Field
 * สกัดบอทอัตโนมัติที่พยายามกรอกฟิลด์ล่องหนที่ซ่อนอยู่จากมนุษย์
 */
export function verifyHoneypot(body: any) {
  if (process.env.NODE_ENV === 'test' || process.env.PLAYWRIGHT_TEST) {
    return
  }

  if (!body || typeof body !== 'object') {
    return
  }

  // ป้องกันเฉพาะฟิลด์ดักบอทลับ (_fs_bot_honey_token หรือ _hp)
  // จะไม่ดักจับฟิลด์ทั่วไปอย่าง website ที่ browser autofill / password manager อาจเผลอกรอกให้มนุษย์
  const honeypotValue = body._fs_bot_honey_token || body._hp
  if (typeof honeypotValue === 'string' && honeypotValue.trim().length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'คำขอไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง'
    })
  }
}

/**
 * 2. ตรวจสอบโควต้าการขอรีเซ็ตรหัสผ่าน (Target Rate Limiting ตาม Email)
 * ป้องกันการกระจายหลาย IP มาแกล้งยิงส่งอีเมลซ้ำๆ ไปยังกล่องจดหมายของเหยื่อ (Email Bombing)
 */
export async function checkEmailForgotPasswordLimit(email: string) {
  if (process.env.NODE_ENV === 'test' || process.env.PLAYWRIGHT_TEST) {
    return
  }

  const normalizedEmail = email.trim().toLowerCase()
  const now = Date.now()
  const limiters = getLimiters()

  // 2.1 ตรวจสอบเพดานรวมทั้งระบบก่อน (Global Burst Protection)
  if (limiters) {
    try {
      const globalCheck = await limiters.globalForgotLimiter.limit('global_forgot_window')
      if (!globalCheck.success) {
        const waitSec = Math.max(1, Math.ceil((globalCheck.reset - now) / 1000))
        throw createError({
          statusCode: 429,
          statusMessage: 'Too Many Requests',
          message: `มีคำขอรีเซ็ตรหัสผ่านเข้ามาหนาแน่น กรุณารออีก ${waitSec} วินาทีแล้วลองใหม่อีกครั้ง ⏳`
        })
      }
    } catch (err: any) {
      if (err.statusCode === 429) throw err
      console.warn('[TargetRateLimit] Global forgot check fallback:', err.message)
    }
  }

  // 2.2 ตรวจสอบโควต้าเฉพาะอีเมลนี้ (สูงสุด 3 ครั้งต่อ 15 นาที)
  const WINDOW_MS = 15 * 60 * 1000 // 15 นาที
  const MAX_PER_EMAIL = 3

  if (limiters) {
    try {
      const emailCheck = await limiters.forgotPasswordLimiter.limit(normalizedEmail)
      if (!emailCheck.success) {
        const waitMin = Math.max(1, Math.ceil((emailCheck.reset - now) / 60000))
        throw createError({
          statusCode: 429,
          statusMessage: 'Too Many Requests',
          message: `คำขอรีเซ็ตรหัสผ่านสำหรับอีเมลนี้เกินกำหนด (สูงสุด ${MAX_PER_EMAIL} ครั้งใน 15 นาที) เพื่อความปลอดภัย กรุณารออีก ${waitMin} นาทีแล้วลองใหม่อีกครั้ง ⏳`
        })
      }
      return
    } catch (err: any) {
      if (err.statusCode === 429) throw err
      console.warn('[TargetRateLimit] Email forgot check fallback to in-memory:', err.message)
    }
  }

  // Fallback: In-Memory
  const key = `forgot:${normalizedEmail}`
  const record = memoryStore.get(key)

  if (!record || now > record.resetTime) {
    memoryStore.set(key, { count: 1, resetTime: now + WINDOW_MS })
    return
  }

  record.count++
  if (record.count > MAX_PER_EMAIL) {
    const waitMin = Math.max(1, Math.ceil((record.resetTime - now) / 60000))
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      message: `คำขอรีเซ็ตรหัสผ่านสำหรับอีเมลนี้เกินกำหนด (สูงสุด ${MAX_PER_EMAIL} ครั้งใน 15 นาที) เพื่อความปลอดภัย กรุณารออีก ${waitMin} นาทีแล้วลองใหม่อีกครั้ง ⏳`
    })
  }
}

/**
 * 2.3 ตรวจสอบโควต้าการขอส่งลิงก์ยืนยันตัวตนใหม่ (Target Rate Limiting สำหรับ Resend Verification)
 * สูงสุด 3 ครั้งต่อ 15 นาทีต่ออีเมล
 */
export async function checkEmailResendVerificationLimit(email: string) {
  if (process.env.NODE_ENV === 'test' || process.env.PLAYWRIGHT_TEST) {
    return
  }

  const normalizedEmail = email.trim().toLowerCase()
  const now = Date.now()
  const limiters = getLimiters()

  const WINDOW_MS = 15 * 60 * 1000 // 15 นาที
  const MAX_PER_EMAIL = 3

  if (limiters) {
    try {
      const emailCheck = await limiters.resendVerificationLimiter.limit(normalizedEmail)
      if (!emailCheck.success) {
        const waitMin = Math.max(1, Math.ceil((emailCheck.reset - now) / 60000))
        throw createError({
          statusCode: 429,
          statusMessage: 'Too Many Requests',
          message: `คำขอรับลิงก์ยืนยันสำหรับอีเมลนี้เกินกำหนด (สูงสุด ${MAX_PER_EMAIL} ครั้งใน 15 นาที) เพื่อความปลอดภัย กรุณารออีก ${waitMin} นาทีแล้วลองใหม่อีกครั้ง ⏳`
        })
      }
      return
    } catch (err: any) {
      if (err.statusCode === 429) throw err
      console.warn('[TargetRateLimit] Email resend check fallback to in-memory:', err.message)
    }
  }

  // Fallback: In-Memory
  const key = `resend:${normalizedEmail}`
  const record = memoryStore.get(key)

  if (!record || now > record.resetTime) {
    memoryStore.set(key, { count: 1, resetTime: now + WINDOW_MS })
    return
  }

  record.count++
  if (record.count > MAX_PER_EMAIL) {
    const waitMin = Math.max(1, Math.ceil((record.resetTime - now) / 60000))
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      message: `คำขอรับลิงก์ยืนยันสำหรับอีเมลนี้เกินกำหนด (สูงสุด ${MAX_PER_EMAIL} ครั้งใน 15 นาที) เพื่อความปลอดภัย กรุณารออีก ${waitMin} นาทีแล้วลองใหม่อีกครั้ง ⏳`
    })
  }
}

/**
 * 3. ตรวจสอบการล็อคบัญชีชั่วคราวจากการใส่รหัสผ่านผิดติดต่อกัน (Failed Login Lockout / Backoff)
 * ป้องกันการกระจายหลายร้อย IP มารุมสุ่มรหัสผ่านของบัญชีเป้าหมายบัญชีเดียว (Distributed Brute Force)
 */
const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_SECONDS = 15 * 60 // 15 นาที

export async function checkFailedLoginLockout(email: string) {
  if (process.env.NODE_ENV === 'test' || process.env.PLAYWRIGHT_TEST) {
    return
  }

  const normalizedEmail = email.trim().toLowerCase()
  const redis = getRedis()
  const key = `flowspace_fail_login:${normalizedEmail}`
  const now = Date.now()

  if (redis) {
    try {
      const attempts = await redis.get<number>(key)
      if (attempts && attempts >= MAX_FAILED_ATTEMPTS) {
        const ttl = await redis.ttl(key)
        const waitMin = Math.max(1, Math.ceil((ttl > 0 ? ttl : LOCKOUT_SECONDS) / 60))
        throw createError({
          statusCode: 429,
          statusMessage: 'Account Temporarily Locked',
          message: `คุณใส่รหัสผ่านผิดติดต่อกันเกิน ${MAX_FAILED_ATTEMPTS} ครั้ง บัญชีนี้ถูกระงับชั่วคราวเพื่อความปลอดภัย กรุณารออีก ${waitMin} นาที หรือใช้ปุ่ม "ลืมรหัสผ่าน" เพื่อกำหนดรหัสผ่านใหม่ 🔒`
        })
      }
      return
    } catch (err: any) {
      if (err.statusCode === 429) throw err
      console.warn('[TargetRateLimit] Redis failed login check fallback to memory:', err.message)
    }
  }

  // Fallback: In-Memory
  const memRecord = memoryStore.get(key)
  if (memRecord && now <= memRecord.resetTime && memRecord.count >= MAX_FAILED_ATTEMPTS) {
    const waitMin = Math.max(1, Math.ceil((memRecord.resetTime - now) / 60000))
    throw createError({
      statusCode: 429,
      statusMessage: 'Account Temporarily Locked',
      message: `คุณใส่รหัสผ่านผิดติดต่อกันเกิน ${MAX_FAILED_ATTEMPTS} ครั้ง บัญชีนี้ถูกระงับชั่วคราวเพื่อความปลอดภัย กรุณารออีก ${waitMin} นาที หรือใช้ปุ่ม "ลืมรหัสผ่าน" เพื่อกำหนดรหัสผ่านใหม่ 🔒`
    })
  }
}

/**
 * บันทึกเมื่อผู้ใช้ใส่รหัสผ่านผิด (Failed Attempt)
 */
export async function recordFailedLogin(email: string) {
  if (process.env.NODE_ENV === 'test' || process.env.PLAYWRIGHT_TEST) {
    return { count: 0, remainingAttempts: MAX_FAILED_ATTEMPTS, isLocked: false }
  }

  const normalizedEmail = email.trim().toLowerCase()
  const redis = getRedis()
  const key = `flowspace_fail_login:${normalizedEmail}`
  const now = Date.now()

  let count = 1

  if (redis) {
    try {
      count = await redis.incr(key)
      if (count === 1) {
        await redis.expire(key, LOCKOUT_SECONDS)
      }
      return {
        count,
        remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - count),
        isLocked: count >= MAX_FAILED_ATTEMPTS
      }
    } catch (err: any) {
      console.warn('[TargetRateLimit] Redis incr failed, fallback to memory:', err.message)
    }
  }

  // Fallback: In-Memory
  const memRecord = memoryStore.get(key)
  if (!memRecord || now > memRecord.resetTime) {
    memoryStore.set(key, { count: 1, resetTime: now + LOCKOUT_SECONDS * 1000 })
    count = 1
  } else {
    memRecord.count++
    count = memRecord.count
  }

  return {
    count,
    remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - count),
    isLocked: count >= MAX_FAILED_ATTEMPTS
  }
}

/**
 * ล้างประวัติการใส่รหัสผ่านผิดเมื่อล็อกอินสำเร็จ (Reset on Success)
 */
export async function resetFailedLogin(email: string) {
  const normalizedEmail = email.trim().toLowerCase()
  const redis = getRedis()
  const key = `flowspace_fail_login:${normalizedEmail}`

  if (redis) {
    try {
      await redis.del(key)
    } catch (err: any) {
      console.warn('[TargetRateLimit] Redis del failed:', err.message)
    }
  }

  memoryStore.delete(key)
}

/**
 * 4. ตรวจสอบเพดานรวมการสมัครสมาชิก (Global Registration Burst Limit)
 * ป้องกันการระดมบอทหลาย IP มาสร้างบัญชีขยะพร้อมกัน
 */
export async function checkGlobalRegisterLimit() {
  if (process.env.NODE_ENV === 'test' || process.env.PLAYWRIGHT_TEST) {
    return
  }

  const limiters = getLimiters()
  const now = Date.now()

  if (limiters) {
    try {
      const regCheck = await limiters.globalRegisterLimiter.limit('global_register_window')
      if (!regCheck.success) {
        const waitSec = Math.max(1, Math.ceil((regCheck.reset - now) / 1000))
        throw createError({
          statusCode: 429,
          statusMessage: 'Too Many Requests',
          message: `มีคำขอสมัครสมาชิกเข้ามาหนาแน่นในขณะนี้ กรุณารออีก ${waitSec} วินาทีแล้วลองใหม่อีกครั้ง ⏳`
        })
      }
      return
    } catch (err: any) {
      if (err.statusCode === 429) throw err
      console.warn('[TargetRateLimit] Redis global register fallback to memory:', err.message)
    }
  }

  // Fallback: In-Memory
  const key = 'global:register'
  const WINDOW_MS = 60 * 1000
  const MAX_REG = 20
  const record = memoryStore.get(key)

  if (!record || now > record.resetTime) {
    memoryStore.set(key, { count: 1, resetTime: now + WINDOW_MS })
    return
  }

  record.count++
  if (record.count > MAX_REG) {
    const waitSec = Math.max(1, Math.ceil((record.resetTime - now) / 1000))
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      message: `มีคำขอสมัครสมาชิกเข้ามาหนาแน่นในขณะนี้ กรุณารออีก ${waitSec} วินาทีแล้วลองใหม่อีกครั้ง ⏳`
    })
  }
}
