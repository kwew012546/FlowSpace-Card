// app/composables/useProjectUrl.ts
export const toProjectSlug = (name?: string | null): string => {
  const raw = String(name || '').trim().toLowerCase()
  if (!raw) return ''
  // รองรับทั้งตัวอักษรภาษาอังกฤษ ตัวเลข และภาษาไทย (\u0E00-\u0E7F) เปลี่ยนช่องว่างเป็นขีดกลาง (-)
  return raw
    .replace(/[^a-z0-9\u0E00-\u0E7F]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const buildProjectUrl = (id: number | string, name?: string | null): string => {
  const slug = toProjectSlug(name)
  return slug ? `/project/${id}-${slug}` : `/project/${id}`
}

export const parseProjectId = (rawParam: string | string[] | undefined): number => {
  const val = Array.isArray(rawParam) ? rawParam[0] : String(rawParam || '')
  const match = val.match(/^(\d+)/)
  return match ? Number(match[1]) : Number(val)
}
