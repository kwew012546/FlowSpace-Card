// app/composables/useProjectUrl.ts

const FEISTEL_KEYS = [0x5A3, 0x9E7, 0x3C9, 0x7F1] as const

const feistelRound = (x: number, k: number): number => {
  return (((Math.imul(x, 2999) + k) ^ (x >>> 3)) & 0xFFF)
}

export const encodeProjectId = (id: number | string): string => {
  const n = Number(id)
  if (!Number.isInteger(n) || n <= 0 || n >= 0xFFFFFF) {
    return String(id)
  }
  let L = (n >>> 12) & 0xFFF
  let R = n & 0xFFF
  for (const k of FEISTEL_KEYS) {
    const nextL = R
    const nextR = (L ^ feistelRound(R, k)) & 0xFFF
    L = nextL
    R = nextR
  }
  const encoded = ((L << 12) | R) >>> 0
  return `fs${encoded.toString(36).padStart(5, '0')}`
}

export const decodeProjectId = (token: string): number => {
  const clean = token.trim().toLowerCase()
  const hashMatch = clean.match(/^fs([0-9a-z]{5})$/)
  if (!hashMatch) return NaN

  const encoded = parseInt(hashMatch[1], 36)
  if (!Number.isFinite(encoded) || encoded < 0 || encoded > 0xFFFFFF) return NaN

  let L = (encoded >>> 12) & 0xFFF
  let R = encoded & 0xFFF
  for (let i = FEISTEL_KEYS.length - 1; i >= 0; i--) {
    const k = FEISTEL_KEYS[i]!
    const prevR = L
    const prevL = (R ^ feistelRound(L, k)) & 0xFFF
    L = prevL
    R = prevR
  }
  return ((L << 12) | R) >>> 0
}

export const toProjectSlug = (name?: string | null): string => {
  const raw = String(name || '').trim().toLowerCase()
  if (!raw) return ''
  // รองรับทั้งตัวอักษรภาษาอังกฤษ ตัวเลข และภาษาไทย (\u0E00-\u0E7F) เปลี่ยนช่องว่างเป็นขีดกลาง (-)
  return raw
    .replace(/[^a-z0-9\u0E00-\u0E7F]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const buildProjectUrl = (id: number | string, name?: string | null): string => {
  const shortHash = encodeProjectId(id)
  const slug = toProjectSlug(name)
  return slug ? `/project/${shortHash}-${slug}` : `/project/${shortHash}`
}

export const parseProjectId = (rawParam: string | string[] | undefined): number => {
  const val = (Array.isArray(rawParam) ? rawParam[0] : String(rawParam || '')).trim()
  if (!val) return NaN

  // 1. รองรับ Short-Hash ID รูปแบบใหม่ เช่น /project/fs9x4qk-dead-by-daylight หรือ /project/fs9x4qk
  const hashPrefixMatch = val.match(/^(fs[0-9a-z]{5})(?:-|$)/i)
  if (hashPrefixMatch && hashPrefixMatch[1]) {
    const decoded = decodeProjectId(hashPrefixMatch[1])
    if (Number.isInteger(decoded) && decoded > 0) {
      return decoded
    }
  }

  // 2. รองรับลิงก์ตัวเลขแบบเดิม (Backward Compatibility & Automated Tests) เช่น /project/6 หรือ /project/6-dead-by-daylight
  const numericMatch = val.match(/^(\d+)(?:-|$)/)
  return numericMatch ? Number(numericMatch[1]) : Number(val)
}
