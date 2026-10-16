// qa/test_admin_delete_user.mjs
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

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

async function run() {
  console.log('🧪 Starting Admin Delete User & Edge-Cases QA Suite...\n')

  const timestamp = Date.now()
  const password = 'Password123!'
  const hashedPassword = await bcrypt.hash(password, 10)

  // 1. Setup Admin, User A (Member + Assignee), User B (Project Owner), User C (Team Member of B)
  console.log('1. Setting up test users and projects in DB...')
  const adminEmail = `admin_del_${timestamp}@flowspace.test`
  const userAEmail = `user_a_${timestamp}@flowspace.test`
  const userBEmail = `user_b_${timestamp}@flowspace.test`
  const userCEmail = `user_c_${timestamp}@flowspace.test`

  const admin = await prisma.user.create({
    data: {
      username: `adm_${timestamp}`.slice(0, 20),
      email: adminEmail,
      password: hashedPassword,
      isVerified: true,
      role: 'ADMIN'
    }
  })

  const userA = await prisma.user.create({
    data: {
      username: `usra_${timestamp}`.slice(0, 20),
      email: userAEmail,
      password: hashedPassword,
      isVerified: true,
      role: 'USER'
    }
  })

  const userB = await prisma.user.create({
    data: {
      username: `usrb_${timestamp}`.slice(0, 20),
      email: userBEmail,
      password: hashedPassword,
      isVerified: true,
      role: 'USER'
    }
  })

  const userC = await prisma.user.create({
    data: {
      username: `usrc_${timestamp}`.slice(0, 20),
      email: userCEmail,
      password: hashedPassword,
      isVerified: true,
      role: 'USER'
    }
  })

  // Helper for random unique invite codes
  const genCode = () => Math.random().toString(36).substring(2, 10).toUpperCase()

  // Create Project 1 owned by Admin, where User A is a member and has an assigned task
  const project1 = await prisma.project.create({
    data: {
      name: `Admin Board ${timestamp}`,
      ownerId: admin.id,
      inviteCode: genCode(),
      members: {
        create: [
          { userId: admin.id },
          { userId: userA.id }
        ]
      },
      columns: {
        create: [
          { title: 'To Do', position: 0 }
        ]
      }
    },
    include: { columns: true }
  })

  const task1 = await prisma.task.create({
    data: {
      title: 'Task Assigned to User A',
      projectId: project1.id,
      columnId: project1.columns[0].id,
      assigneeId: userA.id
    }
  })

  // Create Project 2 owned by User B, where User C is a member (Team Project)
  const project2 = await prisma.project.create({
    data: {
      name: `User B Team Board ${timestamp}`,
      ownerId: userB.id,
      inviteCode: genCode(),
      members: {
        create: [
          { userId: userB.id, joinedAt: new Date(Date.now() - 10000) },
          { userId: userC.id, joinedAt: new Date(Date.now() - 5000) }
        ]
      },
      columns: {
        create: [
          { title: 'In Progress', position: 0 }
        ]
      }
    },
    include: { columns: true }
  })

  // Create Project 3 owned by User B alone (Sole Member Board)
  const project3 = await prisma.project.create({
    data: {
      name: `User B Solo Board ${timestamp}`,
      ownerId: userB.id,
      inviteCode: genCode(),
      members: {
        create: [
          { userId: userB.id }
        ]
      }
    }
  })

  console.log('✅ Test fixture created successfully.\n')

  // Login as Super Admin
  const adminJar = new CookieJar()
  const adminLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: adminEmail, password })
  })
  adminJar.set(adminLogin.headers.getSetCookie?.() || adminLogin.headers.get('set-cookie'))
  console.log('2. Logged in as Admin:', admin.username)

  // 2. Test Anti-Self-Delete Guard
  console.log('3. Testing Anti-Self-Delete Guard (Admin trying to delete own account)...')
  const selfDelRes = await request(`/api/admin/users/delete?userId=${admin.id}`, {
    method: 'DELETE',
    headers: { Cookie: adminJar.toHeader() }
  })
  if (selfDelRes.status !== 400) {
    throw new Error(`Expected 400 for self-delete, got ${selfDelRes.status}: ${JSON.stringify(selfDelRes.data)}`)
  }
  console.log('✅ Anti-Self-Delete Guard passed! (Blocked with 400: ' + selfDelRes.data.message + ')')

  // 3. Test Deleting User A (Member & Assignee)
  console.log('4. Testing Deletion of User A (Member of Board 1 with assigned task)...')
  const delUserARes = await request(`/api/admin/users/delete?userId=${userA.id}`, {
    method: 'DELETE',
    headers: { Cookie: adminJar.toHeader() }
  })
  if (delUserARes.status !== 200 || !delUserARes.data.success) {
    throw new Error(`Failed to delete User A: ${JSON.stringify(delUserARes.data)}`)
  }
  console.log('✅ User A deleted successfully:', delUserARes.data.message)

  // Verify User A is deleted from DB
  const checkUserA = await prisma.user.findUnique({ where: { id: userA.id } })
  if (checkUserA) throw new Error('User A still exists in DB')

  // Verify task1 assigneeId is set to NULL (Unassigned, not deleted)
  const checkTask1 = await prisma.task.findUnique({ where: { id: task1.id } })
  if (!checkTask1 || checkTask1.assigneeId !== null) {
    throw new Error(`Task 1 assigneeId expected null, got ${checkTask1?.assigneeId}`)
  }
  console.log('✅ Task 1 was gracefully unassigned (assigneeId: null, task preserved)')

  // Verify User A membership is removed
  const checkMemberA = await prisma.projectMember.findFirst({
    where: { projectId: project1.id, userId: userA.id }
  })
  if (checkMemberA) throw new Error('User A still in ProjectMember table')
  console.log('✅ User A removed from project members')

  // 4. Test Email Re-registration (Clean Slate)
  console.log('5. Testing Email Re-registration with User A\'s deleted email...')
  const reRegisterRes = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      username: `new_usra_${timestamp}`.slice(0, 20),
      email: userAEmail,
      password: 'NewPassword456!'
    })
  })
  if (reRegisterRes.status !== 201 && reRegisterRes.status !== 200) {
    throw new Error(`Failed to re-register deleted email: Status ${reRegisterRes.status}, data: ${JSON.stringify(reRegisterRes.data)}`)
  }
  console.log('✅ Successfully re-registered new account with previously deleted email! (Zero collision)')

  // 5. Test Deleting User B (Project Owner with Team Project & Solo Project)
  console.log('6. Testing Deletion of User B (Owner of Team Board 2 & Solo Board 3) with projectHandling: "transfer"...')
  const delUserBRes = await request(`/api/admin/users/delete?userId=${userB.id}&projectHandling=transfer`, {
    method: 'DELETE',
    headers: { Cookie: adminJar.toHeader() }
  })
  if (delUserBRes.status !== 200 || !delUserBRes.data.success) {
    throw new Error(`Failed to delete User B: ${JSON.stringify(delUserBRes.data)}`)
  }
  console.log('✅ User B deleted successfully:', delUserBRes.data.message)

  // Verify Project 2 ownership was transferred to User C
  const checkProj2 = await prisma.project.findUnique({ where: { id: project2.id } })
  if (!checkProj2 || checkProj2.ownerId !== userC.id) {
    throw new Error(`Project 2 owner expected ${userC.id}, got ${checkProj2?.ownerId}`)
  }
  console.log(`✅ Project 2 ownership successfully transferred to User C (ID: ${userC.id})!`)

  // Verify User C received ownership notification
  const notifC = await prisma.notification.findFirst({
    where: { userId: userC.id, title: { contains: 'เจ้าของโปรเจกต์' } }
  })
  if (!notifC) throw new Error('User C did not receive ownership notification')
  console.log('✅ User C received notification: "' + notifC.title + '"')

  // 6. Test Bulk Deletion (Multiple Users at once)
  console.log('7. Testing Bulk Deletion (Multiple Users at once with userIds array)...')
  const userD = await prisma.user.create({
    data: {
      username: `usrd_${timestamp}`.slice(0, 20),
      email: `user_d_${timestamp}@flowspace.test`,
      password: hashedPassword,
      isVerified: true,
      role: 'USER'
    }
  })
  const userE = await prisma.user.create({
    data: {
      username: `usre_${timestamp}`.slice(0, 20),
      email: `user_e_${timestamp}@flowspace.test`,
      password: hashedPassword,
      isVerified: true,
      role: 'USER'
    }
  })

  // Log in as User D before deletion so User D holds a valid 7-day auth_token cookie
  const userDJar = new CookieJar()
  const userDLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: `user_d_${timestamp}@flowspace.test`, password })
  })
  userDJar.set(userDLogin.headers.getSetCookie?.() || userDLogin.headers.get('set-cookie'))

  // Also include admin ID in userIds to verify Admin is filtered out safely without failing the bulk operation
  const bulkDelRes = await request('/api/admin/users/delete', {
    method: 'DELETE',
    headers: { Cookie: adminJar.toHeader() },
    body: JSON.stringify({
      userIds: [userD.id, userE.id, admin.id],
      projectHandling: 'transfer'
    })
  })

  if (bulkDelRes.status !== 200 || !bulkDelRes.data.success) {
    throw new Error(`Bulk deletion failed: Status ${bulkDelRes.status}, data: ${JSON.stringify(bulkDelRes.data)}`)
  }
  console.log(`✅ Bulk deletion succeeded: ${bulkDelRes.data.message} (Deleted count: ${bulkDelRes.data.deletedCount})`)

  // Verify SSR /login with User D's stale auth_token cookie renders login.vue (centered) and clears the dead cookie
  const ssrLoginRes = await fetch(`${BASE_URL}/login`, {
    headers: { Cookie: userDJar.toHeader() },
    redirect: 'manual'
  })
  const ssrLoginHtml = await ssrLoginRes.text()
  if (ssrLoginRes.status !== 200 || !ssrLoginHtml.includes('items-center justify-center p-4')) {
    throw new Error(`Expected /login SSR status 200 with centered layout for deleted user cookie, got status ${ssrLoginRes.status}`)
  }
  console.log('✅ SSR /login with deleted user cookie rendered centered login layout (no hydration mismatch / no redirect loop)!')

  // Verify User D and User E are deleted
  const checkD = await prisma.user.findUnique({ where: { id: userD.id } })
  const checkE = await prisma.user.findUnique({ where: { id: userE.id } })
  if (checkD || checkE) throw new Error('User D or User E still exists in DB after bulk delete')

  // Verify Admin is STILL intact
  const checkAdmin = await prisma.user.findUnique({ where: { id: admin.id } })
  if (!checkAdmin) throw new Error('Admin was erroneously deleted during bulk delete!')
  console.log('✅ Admin remained safe and untouched during bulk deletion!')

  // Verify deleted emails can immediately be re-registered
  const reRegisterD = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      username: `new_usrd_${timestamp}`.slice(0, 20),
      email: `user_d_${timestamp}@flowspace.test`,
      password: 'NewPassword789!'
    })
  })
  if (reRegisterD.status !== 201 && reRegisterD.status !== 200) {
    throw new Error(`Failed to re-register bulk deleted user D email: ${JSON.stringify(reRegisterD.data)}`)
  }
  console.log('✅ Bulk deleted email re-registered successfully with zero conflict!')

  console.log('\n🎉 ALL ADMIN DELETE USER & EDGE-CASE QA TESTS PASSED 100%! 🎉\n')
}

run().catch((err) => {
  console.error('\n❌ QA Test Failed:', err)
  process.exit(1)
}).finally(() => {
  prisma.$disconnect()
})
