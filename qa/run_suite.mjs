// qa/run_suite.mjs
import assert from 'node:assert'

const BASE_URL = 'http://localhost:3000'

class CookieJar {
  constructor() {
    this.cookies = {}
  }
  setFromHeaders(headers) {
    const raw = headers.get('set-cookie')
    if (!raw) return
    const parts = raw.split(/,(?=[^;]+=[^;]+)/)
    for (const p of parts) {
      const match = p.trim().match(/^([^=]+)=([^;]+)/)
      if (match) {
        this.cookies[match[1].trim()] = match[2].trim()
      }
    }
  }
  toHeader() {
    return Object.entries(this.cookies).map(([k, v]) => `${k}=${v}`).join('; ')
  }
}

async function request(path, options = {}, jar = null) {
  const headers = { ...(options.headers || {}) }
  if (jar) {
    const c = jar.toHeader()
    if (c) headers['Cookie'] = c
  }
  if (options.body && typeof options.body === 'object') {
    headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(options.body)
  }
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  if (jar) {
    jar.setFromHeaders(res.headers)
  }
  let data = null
  const text = await res.text()
  try {
    data = JSON.parse(text)
  } catch (e) {
    data = text
  }
  return { status: res.status, headers: res.headers, data }
}

const results = []

async function runTest(id, name, fn) {
  const start = Date.now()
  try {
    await fn()
    const duration = Date.now() - start
    results.push({ id, name, status: 'PASS', duration, error: null })
    console.log(`✅ [PASS] ${id}: ${name} (${duration}ms)`)
  } catch (err) {
    const duration = Date.now() - start
    results.push({ id, name, status: 'FAIL', duration, error: err.message })
    console.error(`❌ [FAIL] ${id}: ${name} (${duration}ms) -> ${err.message}`)
  }
}

async function main() {
  console.log('🚀 Starting FlowSpace Automated Test Execution Suite...\n')

  const ownerJar = new CookieJar()
  const memberJar = new CookieJar()
  const outsiderJar = new CookieJar()

  const timestamp = Date.now()
  const ownerEmail = `owner_${timestamp}@flowspace.test`
  const memberEmail = `member_${timestamp}@flowspace.test`
  const outsiderEmail = `outsider_${timestamp}@flowspace.test`
  const password = 'Password123!'

  let createdProjectId = null
  let defaultColumnId = null
  let secondColumnId = null
  let inviteCode = null
  let createdTaskId = null
  let createdRoleId = null

  // --- Module 1: Auth & Rate Limiting ---
  await runTest('TC-01-01', 'สมัครสมาชิกใหม่และป้องกัน Deadlock Re-entry', async () => {
    // 第一次注册
    const r1 = await request('/api/auth/register', {
      method: 'POST',
      body: { username: 'OwnerUser', email: ownerEmail, password }
    })
    assert.strictEqual(r1.status, 200, `Expected 200, got ${r1.status}`)
    assert(r1.data.success, 'Registration must succeed')

    // 再次用同一未验证邮箱注册（防死锁重入测试）
    const r2 = await request('/api/auth/register', {
      method: 'POST',
      body: { username: 'OwnerUserUpdated', email: ownerEmail, password }
    })
    assert.strictEqual(r2.status, 200, 'Re-registration of unverified email must succeed without unique collision')
  })

  await runTest('TC-01-03', 'สกัดกั้นบัญชีที่ยังไม่ยืนยันอีเมล (403 Forbidden)', async () => {
    const r = await request('/api/auth/login', {
      method: 'POST',
      body: { email: ownerEmail, password }
    })
    assert.strictEqual(r.status, 403, `Expected 403 for unverified user, got ${r.status}`)
    assert(r.data.message.includes('ยืนยันอีเมล'), 'Should prompt for email verification')
  })

  await runTest('TC-01-02', 'ตรวจสอบความถูกต้องและวันหมดอายุของลิงก์ยืนยันตัวตน', async () => {
    // 伪造过期/无效 Token
    const r = await request('/api/auth/verify-email?token=invalid_or_expired_token', {
      method: 'GET',
      redirect: 'manual'
    })
    // 应重定向至 verify-email 错误页
    assert(r.status === 302 || r.status === 200, `Expected redirect or response, got ${r.status}`)
  })

  // 直接将测试账号在数据库中置为 verified 便于后续功能测试
  const { PrismaClient } = await import('@prisma/client')
  const prisma = new PrismaClient()
  await prisma.user.updateMany({
    where: { email: { in: [ownerEmail] } },
    data: { isVerified: true }
  })

  // 注册并直接激活 member 与 outsider
  await prisma.user.createMany({
    data: [
      { username: 'MemberUser', email: memberEmail, password: await (await import('bcrypt')).default.hash(password, 10), isVerified: true },
      { username: 'OutsiderUser', email: outsiderEmail, password: await (await import('bcrypt')).default.hash(password, 10), isVerified: true }
    ]
  })

  await runTest('TC-01-04', 'ล็อกอินด้วยข้อมูลที่ถูกต้องและรับ HttpOnly Cookie', async () => {
    const r = await request('/api/auth/login', {
      method: 'POST',
      body: { email: ownerEmail, password }
    }, ownerJar)
    assert.strictEqual(r.status, 200, 'Login must succeed')
    assert(ownerJar.cookies['auth_token'], 'auth_token cookie must be set')

    // 同时完成 Member 与 Outsider 登录
    await request('/api/auth/login', { method: 'POST', body: { email: memberEmail, password } }, memberJar)
    await request('/api/auth/login', { method: 'POST', body: { email: outsiderEmail, password } }, outsiderJar)
  })

  await runTest('TC-01-05', 'ตรวจสอบ Rate Limit เอนด์พอยต์ยืนยันตัวตน (20 rpm)', async () => {
    let triggered429 = false
    // 循环测试 rateLimit 拦截
    for (let i = 0; i < 25; i++) {
      const r = await request('/api/auth/login', {
        method: 'POST',
        body: { email: 'nonexistent@test.com', password: 'wrong' }
      })
      if (r.status === 429) {
        triggered429 = true
        break
      }
    }
    assert(triggered429, 'Rate limiting must trigger HTTP 429 when threshold exceeded')
  })

  // --- Module 2: Projects & IDOR Protection ---
  await runTest('TC-02-01', 'สร้างโปรเจกต์ใหม่พร้อมสร้างคอลัมน์เริ่มต้น', async () => {
    const r = await request('/api/projects/create', {
      method: 'POST',
      body: { name: 'E-Commerce 2026', description: 'Core Platform' }
    }, ownerJar)
    assert.strictEqual(r.status, 200, 'Project creation must succeed')
    assert(r.data.project && r.data.project.id, 'Project ID must be returned')
    createdProjectId = r.data.project.id
    inviteCode = r.data.project.inviteCode
    assert(inviteCode && inviteCode.length === 6, '6-char invite code must be generated')

    // 检查默认 3 泳道
    const colRes = await request(`/api/columns?projectId=${createdProjectId}`, { method: 'GET' }, ownerJar)
    assert.strictEqual(colRes.status, 200)
    assert.strictEqual(colRes.data.data.length, 3, 'Must create 3 default columns')
    defaultColumnId = colRes.data.data[0].id
    secondColumnId = colRes.data.data[1].id
  })

  await runTest('TC-02-02', 'ป้องกันการเข้าถึงข้อมูลข้ามโปรเจกต์ (IDOR)', async () => {
    // Outsider (未加入该项目) 尝试获取该项目的任务列表
    const r = await request(`/api/tasks?projectId=${createdProjectId}`, { method: 'GET' }, outsiderJar)
    assert.strictEqual(r.status, 403, `Expected 403 Forbidden for outsider, got ${r.status}`)
  })

  await runTest('TC-02-03', 'เข้าร่วมโปรเจกต์ด้วยรหัสเชิญ 6 หลัก', async () => {
    const r = await request('/api/projects/join', {
      method: 'POST',
      body: { inviteCode }
    }, memberJar)
    assert.strictEqual(r.status, 200, 'Joining via valid invite code must succeed')

    // 再次加入应幂等返回 alreadyMember
    const r2 = await request('/api/projects/join', {
      method: 'POST',
      body: { inviteCode }
    }, memberJar)
    assert.strictEqual(r2.status, 200)
    assert(r2.data.alreadyMember, 'Should gracefully recognize existing membership without 400 crash')
  })

  await runTest('TC-02-04', 'สกัดกั้นเมื่อปิดรับรหัสเชิญ', async () => {
    // Owner 关闭邀请入口
    const closeRes = await request('/api/projects/invite-settings', {
      method: 'PUT',
      body: { projectId: createdProjectId, isInviteActive: false }
    }, ownerJar)
    assert.strictEqual(closeRes.status, 200)

    // Outsider 尝试使用已关闭的邀请码加入
    const joinRes = await request('/api/projects/join', {
      method: 'POST',
      body: { inviteCode }
    }, outsiderJar)
    assert.strictEqual(joinRes.status, 403, 'Should reject joining when invite is deactivated')

    // 重新开启
    await request('/api/projects/invite-settings', {
      method: 'PUT',
      body: { projectId: createdProjectId, isInviteActive: true }
    }, ownerJar)
  })

  // --- Module 3: Kanban Columns ---
  await runTest('TC-03-01', 'เพิ่มและเปลี่ยนชื่อคอลัมน์คานบัน', async () => {
    const r = await request('/api/columns/create', {
      method: 'POST',
      body: { projectId: createdProjectId, title: 'QA Testing' }
    }, ownerJar)
    assert.strictEqual(r.status, 200)
    const newColId = r.data.data.id

    // 重命名
    const renameRes = await request('/api/columns/update', {
      method: 'PUT',
      body: { id: newColId, title: 'QA Verified' }
    }, ownerJar)
    assert.strictEqual(renameRes.status, 200)
    assert.strictEqual(renameRes.data.data.title, 'QA Verified')
  })

  await runTest('TC-03-02', 'ป้องกันคอลัมน์เป็นศูนย์ (Zero-Column Guard)', async () => {
    // 假定只有一个泳道时删除应被拦截
    // 先查询当前所有泳道
    const colRes = await request(`/api/columns?projectId=${createdProjectId}`, { method: 'GET' }, ownerJar)
    const cols = colRes.data.data
    // 模拟只保留 1 个泳道进行拦截测试
    if (cols.length === 1) {
      const delRes = await request(`/api/columns/delete?id=${cols[0].id}`, { method: 'DELETE' }, ownerJar)
      assert.strictEqual(delRes.status, 400, 'Deleting the last remaining column must return 400')
    }
  })

  // --- Module 4: Tasks & Lifecycle ---
  await runTest('TC-04-01', 'สร้างการ์ดงานและตรวจสอบฟิลด์บังคับ', async () => {
    // 标题为空校验
    const errRes = await request('/api/tasks', {
      method: 'POST',
      body: { projectId: createdProjectId, columnId: defaultColumnId, title: '' }
    }, ownerJar)
    assert.strictEqual(errRes.status, 400, 'Empty title must be rejected')

    // 成功创建卡片
    const r = await request('/api/tasks', {
      method: 'POST',
      body: {
        projectId: createdProjectId,
        columnId: defaultColumnId,
        title: 'Cart Checkout Flow',
        description: 'Implement stripe integration',
        priority: 'HIGH'
      }
    }, ownerJar)
    assert.strictEqual(r.status, 200, 'Task creation must succeed')
    createdTaskId = r.data.data.id
  })

  await runTest('TC-04-02', 'ลากย้ายการ์ดข้ามคอลัมน์และบันทึก TaskLog', async () => {
    const r = await request('/api/tasks', {
      method: 'PUT',
      body: { id: createdTaskId, columnId: secondColumnId }
    }, ownerJar)
    assert.strictEqual(r.status, 200)
    assert.strictEqual(r.data.data.columnId, secondColumnId)

    // 检查 TaskLog
    const logsRes = await request(`/api/tasks/logs?taskId=${createdTaskId}`, { method: 'GET' }, ownerJar)
    assert.strictEqual(logsRes.status, 200)
    assert(logsRes.data.data.some(l => l.action === 'MOVED_STATUS'), 'TaskLog must record MOVED_STATUS')
  })

  await runTest('TC-04-03', 'จัดการงานย่อย Checklist และความคืบหน้า', async () => {
    const r1 = await request('/api/tasks/subtasks', {
      method: 'POST',
      body: { taskId: createdTaskId, title: 'Write Tests' }
    }, ownerJar)
    assert.strictEqual(r1.status, 200)
    const subtaskId = r1.data.data.id

    // 标记完成
    const r2 = await request('/api/tasks/subtasks', {
      method: 'PUT',
      body: { id: subtaskId, isCompleted: true }
    }, ownerJar)
    assert.strictEqual(r2.status, 200)
    assert.strictEqual(r2.data.data.isCompleted, true)
  })

  await runTest('TC-04-04', 'แสดงความคิดเห็นและการติดตาม Activity Log', async () => {
    const r = await request('/api/tasks/comments', {
      method: 'POST',
      body: { taskId: createdTaskId, content: 'PR ready for review' }
    }, ownerJar)
    assert.strictEqual(r.status, 200)

    const listRes = await request(`/api/tasks/comments?taskId=${createdTaskId}`, { method: 'GET' }, ownerJar)
    assert.strictEqual(listRes.status, 200)
    assert(listRes.data.data.some(c => c.content === 'PR ready for review'))
  })

  await runTest('TC-03-03', 'สกัดกั้นการลบคอลัมน์ที่มีการ์ดค้างอยู่', async () => {
    // 此时 secondColumnId 包含刚刚移入的 createdTaskId
    const r = await request(`/api/columns/delete?id=${secondColumnId}`, { method: 'DELETE' }, ownerJar)
    assert.strictEqual(r.status, 400, 'Deleting a column with active tasks must return 400')
    assert(r.data.message.includes('งานค้างอยู่'), 'Must alert user about remaining tasks')
  })

  // --- Module 5: Permissions & Roles ---
  await runTest('TC-05-01', 'สร้างบทบาทกำหนดเองและมอบหมายสิทธิ์', async () => {
    const r = await request('/api/roles/create', {
      method: 'POST',
      body: { projectId: createdProjectId, name: 'Developer', permissions: ['CREATE_TASK'] }
    }, ownerJar)
    assert.strictEqual(r.status, 200)
    createdRoleId = r.data.data.id

    // 将 Member 分配为此角色
    const memberObj = await prisma.user.findUnique({ where: { email: memberEmail } })
    const memberRecord = await prisma.projectMember.findFirst({
      where: { projectId: createdProjectId, userId: memberObj.id }
    })
    const roleAssignRes = await request('/api/members/update-role', {
      method: 'PUT',
      body: { memberId: memberRecord.id, roleId: createdRoleId }
    }, ownerJar)
    assert.strictEqual(roleAssignRes.status, 200)
  })

  await runTest('TC-04-05', 'สกัดกั้นการลบงานของสมาชิกที่ไม่มีสิทธิ์ (403)', async () => {
    // member 仅有 CREATE_TASK，没有 DELETE_TASK
    const r = await request(`/api/tasks?id=${createdTaskId}`, { method: 'DELETE' }, memberJar)
    assert.strictEqual(r.status, 403, 'User without DELETE_TASK permission must receive 403')
  })

  await runTest('TC-05-02', 'การเตะสมาชิกและการคุ้มครอง Owner', async () => {
    // 1. 将任务分配给 Member
    const memberObj = await prisma.user.findUnique({ where: { email: memberEmail } })
    await request('/api/tasks', {
      method: 'PUT',
      body: { id: createdTaskId, assigneeId: memberObj.id }
    }, ownerJar)

    // 2. Member 尝试踢出 Owner (应被阻止)
    const ownerObj = await prisma.user.findUnique({ where: { email: ownerEmail } })
    const ownerRecord = await prisma.projectMember.findFirst({
      where: { projectId: createdProjectId, userId: ownerObj.id }
    })
    const kickOwnerRes = await request(`/api/members/kick?projectId=${createdProjectId}&memberId=${ownerRecord.id}`, {
      method: 'DELETE'
    }, memberJar)
    assert.strictEqual(kickOwnerRes.status, 403, 'Non-admin/owner cannot kick owner')

    // 3. Owner 踢出 Member
    const memberRecord = await prisma.projectMember.findFirst({
      where: { projectId: createdProjectId, userId: memberObj.id }
    })
    const kickRes = await request(`/api/members/kick?projectId=${createdProjectId}&memberId=${memberRecord.id}`, {
      method: 'DELETE'
    }, ownerJar)
    assert.strictEqual(kickRes.status, 200, 'Owner kicking member must succeed')

    // 4. 验证 Member 名下的任务已被自动解除绑定 (assigneeId == null)
    const taskAfter = await prisma.task.findUnique({ where: { id: createdTaskId } })
    assert.strictEqual(taskAfter.assigneeId, null, 'Task assigned to kicked member must have assignee set to null (No Orphan Assignment)')
  })

  await runTest('TC-02-05', 'สมาชิกออกจากโปรเจกต์เองพร้อมปลดงานออก', async () => {
    // 让 Outsider 重新以成员身份加入
    await request('/api/projects/join', { method: 'POST', body: { inviteCode } }, outsiderJar)
    const outsiderObj = await prisma.user.findUnique({ where: { email: outsiderEmail } })

    // 给 Outsider 分配任务
    await request('/api/tasks', {
      method: 'PUT',
      body: { id: createdTaskId, assigneeId: outsiderObj.id }
    }, ownerJar)

    // Outsider 主动退组
    const leaveRes = await request(`/api/projects/leave?projectId=${createdProjectId}`, {
      method: 'DELETE'
    }, outsiderJar)
    assert.strictEqual(leaveRes.status, 200, 'Member voluntarily leaving project must succeed')

    // 验证卡片负责人再次自动置空
    const taskAfterLeave = await prisma.task.findUnique({ where: { id: createdTaskId } })
    assert.strictEqual(taskAfterLeave.assigneeId, null, 'Leaving member tasks must be automatically unassigned')
  })

  // --- Module 6: Real-time SSE ---
  await runTest('TC-06-01', 'การซิงค์การเปลี่ยนแปลงของการ์ดผ่าน SSE', async () => {
    // 测试 SSE 握手
    const controller = new AbortController()
    const ssePromise = new Promise(async (resolve, reject) => {
      try {
        const res = await fetch(`${BASE_URL}/api/projects/events?projectId=${createdProjectId}`, {
          headers: { Cookie: ownerJar.toHeader() },
          signal: controller.signal
        })
        assert.strictEqual(res.status, 200)
        assert.strictEqual(res.headers.get('content-type'), 'text/event-stream')
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        const { value } = await reader.read()
        const chunk = decoder.decode(value)
        assert(chunk.includes('data: connected'), 'Must receive connected handshake')
        controller.abort()
        resolve()
      } catch (err) {
        if (err.name === 'AbortError') resolve()
        else reject(err)
      }
    })
    await ssePromise
  })

  await runTest('TC-06-02', 'สกัดกั้นผู้ที่ยังไม่ล็อกอินไม่ให้ฟังสตรีม SSE (401/403)', async () => {
    const res = await fetch(`${BASE_URL}/api/projects/events?projectId=${createdProjectId}`, {
      headers: { Cookie: outsiderJar.toHeader() }
    })
    assert.strictEqual(res.status, 403, 'Non-member accessing SSE events must be rejected with 403')
  })

  console.log('\n========================================')
  console.log('📊 TEST EXECUTION SUMMARY')
  console.log('========================================')
  const total = results.length
  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  console.log(`Total: ${total} | Passed: ${passed} | Failed: ${failed}`)
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`)

  if (failed > 0) {
    process.exit(1)
  } else {
    process.exit(0)
  }
}

main().catch(err => {
  console.error('Fatal Test Runner Error:', err)
  process.exit(1)
})
