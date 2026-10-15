// qa/test_admin_board_access_and_sync.mjs
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

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  }
  const res = await fetch(url, { ...options, headers })
  const text = await res.text()
  let data
  try {
    data = JSON.parse(text)
  } catch {
    data = text
  }
  return { status: res.status, headers: res.headers, data }
}

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

async function run() {
  console.log('🧪 Starting Board Access & Real-Time Sync QA Test...\n')

  const timestamp = Date.now()
  const ownerEmail = `board_owner_${timestamp}@flowspace.test`
  const adminEmail = `super_admin_${timestamp}@flowspace.test`
  const password = 'Password123!'
  const hashedPassword = await bcrypt.hash(password, 10)

  const ownerJar = new CookieJar()
  const adminJar = new CookieJar()

  // 1. Create owner and admin directly in DB (bypass rate limit)
  console.log('1. Creating board owner and admin in DB...')
  await prisma.user.create({
    data: {
      username: `own_${timestamp}`.slice(0, 20),
      email: ownerEmail,
      password: hashedPassword,
      isVerified: true
    }
  })
  await prisma.user.create({
    data: {
      username: `adm_${timestamp}`.slice(0, 20),
      email: adminEmail,
      password: hashedPassword,
      isVerified: true,
      role: 'ADMIN'
    }
  })

  // 2. Login owner and create project
  console.log('2. Owner logs in and creates a project...')
  const ownerLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: ownerEmail, password })
  })
  ownerJar.set(ownerLogin.headers.getSetCookie?.() || ownerLogin.headers.get('set-cookie'))

  const createProjRes = await request('/api/projects/create', {
    method: 'POST',
    headers: { Cookie: ownerJar.toHeader() },
    body: JSON.stringify({ name: `Test Board ${timestamp}`, description: 'Original Description' })
  })
  if (!createProjRes.data?.project) {
    throw new Error('Failed to create project: ' + JSON.stringify(createProjRes.data))
  }
  const projectId = createProjRes.data.project.id
  console.log(`✅ Project created with ID ${projectId}: "${createProjRes.data.project.name}"`)

  // 3. Admin logs in
  console.log('3. Super Admin logs in...')
  const adminLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: adminEmail, password })
  })
  adminJar.set(adminLogin.headers.getSetCookie?.() || adminLogin.headers.get('set-cookie'))
  if (adminLogin.data.user?.role !== 'ADMIN') {
    throw new Error('Admin user does not have ADMIN role')
  }
  console.log('✅ Admin logged in successfully with role ADMIN')

  // 3.5 Test Stale Token Auto-Repair & Live DB Fallback
  console.log('3.5 Testing Stale Cookie Auto-Repair (User promoted to ADMIN after cookie was issued)...')
  const staleToken = jwt.sign(
    { id: adminLogin.data.user.id, email: adminEmail, username: adminLogin.data.user.username, role: 'USER' },
    process.env.JWT_SECRET || 'super-secret-fallback-key',
    { expiresIn: '1h' }
  )
  const staleJar = new CookieJar()
  staleJar.set(`auth_token=${staleToken}`)

  // Direct tasks request with stale token must succeed because server/middleware/auth checks DB!
  const staleTasksRes = await request(`/api/tasks?projectId=${projectId}`, {
    method: 'GET',
    headers: { Cookie: staleJar.toHeader() }
  })
  if (staleTasksRes.status !== 200 || !staleTasksRes.data?.success) {
    throw new Error(`Stale token failed on tasks access: ${staleTasksRes.status}`)
  }
  console.log('✅ Stale token was dynamically recognized as ADMIN via DB check without 403!')

  // /api/auth/me should auto-reissue a fresh cookie
  const meRes = await request('/api/auth/me', {
    headers: { Cookie: staleJar.toHeader() }
  })
  if (meRes.status !== 200 || meRes.data?.user?.role !== 'ADMIN') {
    throw new Error('me endpoint failed to return ADMIN role with stale token')
  }
  const setCookieHeader = meRes.headers.getSetCookie?.() || meRes.headers.get('set-cookie')
  if (!setCookieHeader) {
    throw new Error('me endpoint did not auto-refresh stale cookie')
  }
  console.log('✅ /api/auth/me successfully auto-refreshed stale cookie with ADMIN role!')

  // 4. Admin accesses the owner's board (must NOT return 403)
  console.log('4. Admin opens owner\'s board directly (Inspecting without membership)...')
  const tasksRes = await request(`/api/tasks?projectId=${projectId}`, {
    method: 'GET',
    headers: { Cookie: adminJar.toHeader() }
  })
  if (tasksRes.status !== 200 || !tasksRes.data.success) {
    throw new Error(`Admin failed to open board tasks: Status ${tasksRes.status}, data: ${JSON.stringify(tasksRes.data)}`)
  }
  console.log(`✅ Tasks API returned 200! Project Name: "${tasksRes.data.projectName}"`)

  const colsRes = await request(`/api/columns?projectId=${projectId}`, {
    method: 'GET',
    headers: { Cookie: adminJar.toHeader() }
  })
  if (colsRes.status !== 200 || !colsRes.data.success) {
    throw new Error(`Admin failed to fetch columns: Status ${colsRes.status}`)
  }
  console.log(`✅ Columns API returned 200! (${colsRes.data.data.length} columns)`)

  const labelsRes = await request(`/api/projects/labels?projectId=${projectId}`, {
    method: 'GET',
    headers: { Cookie: adminJar.toHeader() }
  })
  if (labelsRes.status !== 200 || !labelsRes.data.success) {
    throw new Error(`Admin failed to fetch labels: Status ${labelsRes.status}`)
  }
  console.log('✅ Labels API returned 200!')

  // 5. Admin updates project name
  console.log('5. Admin renames the project...')
  const renameRes = await request('/api/projects/update', {
    method: 'PUT',
    headers: { Cookie: adminJar.toHeader() },
    body: JSON.stringify({
      id: projectId,
      name: `Renamed by Admin ${timestamp}`
    })
  })
  if (renameRes.status !== 200 || !renameRes.data.success) {
    throw new Error(`Failed to rename project: ${JSON.stringify(renameRes.data)}`)
  }
  console.log(`✅ Project successfully renamed to: "${renameRes.data.project.name}"`)

  // 6. Verify name update in Admin projects API
  console.log('6. Verifying project name in Admin Workspaces API...')
  const adminProjectsRes = await request(`/api/admin/projects?q=${encodeURIComponent(renameRes.data.project.name)}`, {
    headers: { Cookie: adminJar.toHeader() }
  })
  if (!adminProjectsRes.data.projects.some(p => p.id === projectId && p.name.includes('Renamed by Admin'))) {
    throw new Error('Project name not updated in admin projects list')
  }
  console.log('✅ Project name updated in Admin Workspaces list!')

  // 7. Admin deletes the project
  console.log('7. Admin deletes the project...')
  const deleteRes = await request(`/api/projects/delete?projectId=${projectId}`, {
    method: 'DELETE',
    headers: { Cookie: adminJar.toHeader() }
  })
  if (deleteRes.status !== 200 || !deleteRes.data.success) {
    throw new Error(`Failed to delete project: ${JSON.stringify(deleteRes.data)}`)
  }
  console.log(`✅ Project deleted: ${deleteRes.data.message}`)

  // 8. Verify fetching tasks on deleted board returns 404
  console.log('8. Verifying deleted board returns 404 on access...')
  const deletedTasksRes = await request(`/api/tasks?projectId=${projectId}`, {
    headers: { Cookie: adminJar.toHeader() }
  })
  if (deletedTasksRes.status !== 404) {
    throw new Error(`Expected 404 for deleted board, got ${deletedTasksRes.status}`)
  }
  console.log('✅ Deleted project correctly returned 404 (triggers graceful frontend redirect)')

  // 9. Verify project is removed from Admin workspaces list
  console.log('9. Verifying project is absent in Admin Workspaces list...')
  const adminProjectsAfterDelete = await request(`/api/admin/projects?q=${encodeURIComponent(renameRes.data.project.name)}`, {
    headers: { Cookie: adminJar.toHeader() }
  })
  if (adminProjectsAfterDelete.data.projects.some(p => p.id === projectId)) {
    throw new Error('Project still present in admin projects list after deletion')
  }
  console.log('✅ Project is completely removed from Workspaces list!')

  console.log('\n🎉 ALL BOARD ACCESS & SYNC QA CHECKS PASSED 100%! 🎉\n')
}

run().catch((err) => {
  console.error('\n❌ QA Test Failed:', err)
  process.exit(1)
}).finally(() => {
  prisma.$disconnect()
})
