// qa/test_admin_portal.mjs
import { execSync } from 'child_process'
import { PrismaClient } from '@prisma/client'

const BASE_URL = 'http://localhost:3000'
const prisma = new PrismaClient()

class CookieJar {
  constructor() { this.cookies = {} }
  set(cookieHeader) {
    if (!cookieHeader) return
    const parts = Array.isArray(cookieHeader) ? cookieHeader : [cookieHeader]
    for (const p of parts) {
      const match = p.trim().match(/^([^=;]+)=([^;]+)/)
      if (match) this.cookies[match[1].trim()] = match[2].trim()
    }
  }
  toHeader() {
    return Object.entries(this.cookies).map(([k, v]) => `${k}=${v}`).join('; ')
  }
}

async function run() {
  console.log('🛡️ Starting FlowSpace Admin Portal Automated QA Test...')

  const ts = Date.now()
  const adminEmail = `admin_test_${ts}@flowspace.test`
  const targetEmail = `target_user_${ts}@flowspace.test`
  const password = 'TestPassword123'

  const nonAdminJar = new CookieJar()
  const adminJar = new CookieJar()

  // Step 1: Register admin candidate and target user
  console.log('\n1. Registering admin candidate and target user...')
  for (const email of [adminEmail, targetEmail]) {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username: email.split('@')[0], password })
    })
    const data = await res.json()
    if (!res.ok) throw new Error('Registration failed for ' + email + ': ' + JSON.stringify(data))
  }

  // ยืนยันอีเมลของ adminEmail ใน DB เพื่อให้ล็อกอินทดสอบ Normal User ได้
  await prisma.user.update({
    where: { email: adminEmail },
    data: { isVerified: true }
  })
  // ปล่อย targetEmail ให้ isVerified: false ไว้ เพื่อทดสอบ Manual Admin Verify
  console.log('✅ Users registered (adminCandidate isVerified: true, targetUser isVerified: false)')

  // Step 2: Login as normal user and attempt to access /api/admin/stats (Expect 403)
  console.log('\n2. Testing Access Control Guard: Non-admin accessing /api/admin/stats...')
  const nonAdminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password })
  })
  nonAdminJar.set(nonAdminLoginRes.headers.getSetCookie ? nonAdminLoginRes.headers.getSetCookie() : nonAdminLoginRes.headers.get('set-cookie'))

  const forbiddenRes = await fetch(`${BASE_URL}/api/admin/stats`, {
    headers: { Cookie: nonAdminJar.toHeader() }
  })
  if (forbiddenRes.status !== 403) {
    throw new Error('Expected 403 Forbidden for non-admin, got: ' + forbiddenRes.status)
  }
  console.log('✅ Access Control Guard passed: Non-admin blocked with 403')

  // Step 3: Promote candidate to ADMIN via CLI script
  console.log('\n3. Promoting candidate to ADMIN via CLI script...')
  const promoteOut = execSync(`node scripts/promote-admin.mjs ${adminEmail}`).toString()
  console.log('Script output:\n' + promoteOut.trim())
  if (!promoteOut.includes('ADMIN')) throw new Error('Promote script did not succeed')
  console.log('✅ CLI promotion script executed successfully')

  // Step 4: Login as newly promoted ADMIN
  console.log('\n4. Logging in as newly promoted ADMIN...')
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password })
  })
  const adminLoginData = await adminLoginRes.json()
  if (adminLoginData.user.role !== 'ADMIN') {
    throw new Error('Expected role ADMIN in login response, got: ' + adminLoginData.user.role)
  }
  adminJar.set(adminLoginRes.headers.getSetCookie ? adminLoginRes.headers.getSetCookie() : adminLoginRes.headers.get('set-cookie'))
  const adminCookie = adminJar.toHeader()
  const adminId = adminLoginData.user.id
  console.log('✅ Logged in as ADMIN, user ID:', adminId)

  // Step 5: Test GET /api/admin/stats
  console.log('\n5. Testing GET /api/admin/stats...')
  const statsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
    headers: { Cookie: adminCookie }
  })
  const statsData = await statsRes.json()
  if (!statsRes.ok || !statsData.success || typeof statsData.stats.totalUsers !== 'number') {
    throw new Error('Stats API failed: ' + JSON.stringify(statsData))
  }
  console.log(`✅ Stats fetched: ${statsData.stats.totalUsers} users, ${statsData.stats.totalProjects} projects, ${statsData.stats.verificationRate}% verified`)

  // Step 6: Test GET /api/admin/users
  console.log('\n6. Testing GET /api/admin/users...')
  const usersRes = await fetch(`${BASE_URL}/api/admin/users?q=${targetEmail.split('@')[0]}`, {
    headers: { Cookie: adminCookie }
  })
  const usersData = await usersRes.json()
  if (!usersRes.ok || !usersData.success || usersData.users.length === 0) {
    throw new Error('Users API search failed: ' + JSON.stringify(usersData))
  }
  const targetUser = usersData.users[0]
  console.log(`✅ Target user found: ID ${targetUser.id}, email: ${targetUser.email}, isVerified: ${targetUser.isVerified}`)

  // Step 7: Test manual email verify override
  console.log('\n7. Testing manual email verify override on target user...')
  const verifyRes = await fetch(`${BASE_URL}/api/admin/users/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({ userId: targetUser.id })
  })
  const verifyData = await verifyRes.json()
  if (!verifyRes.ok || !verifyData.user.isVerified) {
    throw new Error('Manual verify failed: ' + JSON.stringify(verifyData))
  }
  console.log('✅ Manual verify passed:', verifyData.message)

  // Step 8: Test Anti-Self-Ban Guard
  console.log('\n8. Testing Anti-Self-Ban Guard (Admin banning oneself)...')
  const selfBanRes = await fetch(`${BASE_URL}/api/admin/users/ban`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({ userId: adminId, isBanned: true, banReason: 'self-ban' })
  })
  if (selfBanRes.status !== 400) {
    throw new Error('Expected 400 for self-ban, got: ' + selfBanRes.status)
  }
  console.log('✅ Anti-Self-Ban Guard passed: Admin cannot ban oneself (400 rejected)')

  // Step 9: Test Anti-Self-Demote Guard
  console.log('\n9. Testing Anti-Self-Demote Guard (Admin demoting oneself)...')
  const selfDemoteRes = await fetch(`${BASE_URL}/api/admin/users/role`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({ userId: adminId, role: 'USER' })
  })
  if (selfDemoteRes.status !== 400) {
    throw new Error('Expected 400 for self-demote, got: ' + selfDemoteRes.status)
  }
  console.log('✅ Anti-Self-Demote Guard passed: Admin cannot demote oneself (400 rejected)')

  // Step 10: Test banning target user
  console.log('\n10. Testing banning target user...')
  const banRes = await fetch(`${BASE_URL}/api/admin/users/ban`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({ userId: targetUser.id, isBanned: true, banReason: 'สแปมข้อความในระบบ' })
  })
  const banData = await banRes.json()
  if (!banRes.ok || !banData.user.isBanned) {
    throw new Error('Ban failed: ' + JSON.stringify(banData))
  }
  console.log('✅ Target user banned successfully')

  // Step 11: Verify banned user cannot login
  console.log('\n11. Verifying banned user login is blocked (403)...')
  const bannedLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: targetEmail, password })
  })
  const bannedLoginData = await bannedLoginRes.json()
  if (bannedLoginRes.status !== 403 || !bannedLoginData.message.includes('ถูกระงับการใช้งาน')) {
    throw new Error('Banned login was not blocked properly: ' + JSON.stringify(bannedLoginData))
  }
  console.log('✅ Banned user login blocked with 403 Forbidden and reason displayed')

  // Step 12: Unban target user
  console.log('\n12. Unbanning target user...')
  const unbanRes = await fetch(`${BASE_URL}/api/admin/users/ban`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({ userId: targetUser.id, isBanned: false })
  })
  const unbanData = await unbanRes.json()
  if (!unbanRes.ok || unbanData.user.isBanned) throw new Error('Unban failed: ' + JSON.stringify(unbanData))
  console.log('✅ Target user unbanned successfully')

  // Step 13: Admin resets target user password
  console.log('\n13. Admin resetting target user password...')
  const resetRes = await fetch(`${BASE_URL}/api/admin/users/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({ userId: targetUser.id })
  })
  const resetData = await resetRes.json()
  if (!resetRes.ok || !resetData.temporaryPassword) {
    throw new Error('Admin reset password failed: ' + JSON.stringify(resetData))
  }
  const tempPassword = resetData.temporaryPassword
  console.log('✅ Temporary password generated by Admin:', tempPassword)

  // Step 14: Target user logs in with temporary password
  console.log('\n14. Target user logging in with temporary password...')
  const tempLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: targetEmail, password: tempPassword })
  })
  const tempLoginData = await tempLoginRes.json()
  if (!tempLoginRes.ok || !tempLoginData.user) {
    throw new Error('Login with temporary password failed: ' + JSON.stringify(tempLoginData))
  }
  console.log('✅ Target user successfully logged in with temporary password!')

  // Step 15: Admin lists workspaces/projects
  console.log('\n15. Testing GET /api/admin/projects...')
  const projectsRes = await fetch(`${BASE_URL}/api/admin/projects`, {
    headers: { Cookie: adminCookie }
  })
  const projectsData = await projectsRes.json()
  if (!projectsRes.ok || !projectsData.success || typeof projectsData.pagination.total !== 'number') {
    throw new Error('Admin projects list failed: ' + JSON.stringify(projectsData))
  }
  console.log(`✅ Admin projects list verified: ${projectsData.pagination.total} total workspaces found`)

  console.log('\n🎉 ALL 15 ADMIN PORTAL CHECKS PASSED 100%! 🎉\n')
}

run()
  .catch((err) => {
    console.error('❌ Admin Portal QA Test failed:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
