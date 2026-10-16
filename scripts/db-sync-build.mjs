// scripts/db-sync-build.mjs
import { execSync } from 'node:child_process'

try {
  console.log('🔄 [DB Sync] Syncing Prisma schema with database (non-destructive)...')
  execSync('npx prisma db push --skip-generate', {
    stdio: 'inherit',
    timeout: 15000 // ป้องกันการค้างจาก Connection Pooler (PgBouncer) ตอน Build บน Vercel
  })
  console.log('✅ [DB Sync] Database schema is in sync!')
} catch (err) {
  console.warn(
    '⚠️ [DB Sync] Build-time prisma db push skipped or timed out (will fallback to runtime ensureDbSchema):',
    err?.message || err
  )
}
