// scripts/promote-admin.mjs
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const args = process.argv.slice(2)
  const email = args[0]?.trim().toLowerCase()
  const action = args[1]?.toLowerCase() || 'promote' // 'promote' or 'demote'

  if (!email) {
    console.log('📌 วิธีใช้งาน (Usage):')
    console.log('  node scripts/promote-admin.mjs <email> [promote|demote]\n')
    console.log('ตัวอย่าง (Example):')
    console.log('  node scripts/promote-admin.mjs admin@flowspace.app')
    console.log('  node scripts/promote-admin.mjs user@flowspace.app demote')
    process.exit(1)
  }

  const targetRole = action === 'demote' ? 'USER' : 'ADMIN'

  console.log(`🔍 ค้นหาผู้ใช้จากอีเมล: ${email}...`)
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    console.error(`❌ ไม่พบบัญชีผู้ใช้ที่ใช้อีเมล: ${email}`)
    process.exit(1)
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { role: targetRole }
  })

  console.log(`\n🎉 สำเร็จเรียบร้อย!`)
  console.log(`  - Username: ${updatedUser.username}`)
  console.log(`  - Email:    ${updatedUser.email}`)
  console.log(`  - Role ใหม่: ${updatedUser.role === 'ADMIN' ? '🛡️ ADMIN (ผู้ดูแลระบบ)' : '👤 USER (ผู้ใช้ทั่วไป)'}`)
}

main()
  .catch((e) => {
    console.error('❌ เกิดข้อผิดพลาด:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
