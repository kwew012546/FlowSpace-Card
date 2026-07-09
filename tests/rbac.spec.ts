// tests/rbac.spec.ts
import { test, expect } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

test.describe('Nuxt FlowSpace Role-Based Access Control E2E', () => {
  let testUser: any = null
  let testOwner: any = null
  let testProject: any = null
  let testMember: any = null
  let testRole: any = null

  test.beforeEach(async () => {
    const rand = Math.floor(Math.random() * 1000000)
    // 1. สร้างผู้ใช้ทดลอง
    testUser = await prisma.user.create({
      data: {
        username: `pw_member_${rand}`,
        email: `pw_member_${Date.now()}_${rand}@example.com`,
        password: 'password123'
      }
    })

    testOwner = await prisma.user.create({
      data: {
        username: `pw_owner_${rand}`,
        email: `pw_owner_${Date.now()}_${rand + 1}@example.com`,
        password: 'password123'
      }
    })

    // 2. สร้างบอร์ดทดลอง
    testProject = await prisma.project.create({
      data: {
        name: 'Playwright RBAC Test',
        ownerId: testOwner.id,
        inviteCode: `PW${Math.floor(1000 + Math.random() * 9000)}`
      }
    })

    // สร้างคอลัมน์มาตรฐานเพื่อให้หน้าจอมีคอลัมน์และผ่านการรอ selector เสมอ
    await prisma.column.create({
      data: {
        projectId: testProject.id,
        title: 'To Do',
        position: 0
      }
    })
    await prisma.column.create({
      data: {
        projectId: testProject.id,
        title: 'Doing',
        position: 1
      }
    })
    await prisma.column.create({
      data: {
        projectId: testProject.id,
        title: 'Done',
        position: 2
      }
    })

    // 3. เอาผู้ใช้จำลองเข้าร่วมบอร์ด
    testMember = await prisma.projectMember.create({
      data: {
        userId: testUser.id,
        projectId: testProject.id
      }
    })

    // 4. สร้างยศที่มีสิทธิ์ CREATE_TASK (สร้างงานได้) และมอบสิทธิ์ให้ผู้ใช้จำลอง
    testRole = await prisma.role.create({
      data: {
        name: 'Playwright Editor',
        projectId: testProject.id,
        permissions: ['CREATE_TASK']
      }
    })

    await prisma.projectMember.update({
      where: { id: testMember.id },
      data: { roleId: testRole.id }
    })
  })

  test.afterEach(async () => {
    // ทำความสะอาดฐานข้อมูล
    if (testMember) {
      await prisma.projectMember.deleteMany({ where: { projectId: testProject.id } }).catch(() => {})
    }
    if (testRole) {
      await prisma.role.deleteMany({ where: { projectId: testProject.id } }).catch(() => {})
    }
    if (testProject) {
      await prisma.project.delete({ where: { id: testProject.id } }).catch(() => {})
    }
    if (testUser) {
      await prisma.user.delete({ where: { id: testUser.id } }).catch(() => {})
    }
    if (testOwner) {
      await prisma.user.delete({ where: { id: testOwner.id } }).catch(() => {})
    }
  })

  test('ควรจะซ่อนหรือแสดงปุ่ม เพิ่มงานใหม่ ตามสถานะของสิทธิ์ยศตำแหน่ง', async ({ page, context }) => {
    // 1. นำเข้าข้อมูลผู้ใช้ใน cookie และ localStorage เพื่อล็อกอินอย่างรวดเร็วและปลอดภัย
    const token = jwt.sign(
      { id: testUser.id, email: testUser.email, username: testUser.username },
      process.env.JWT_SECRET || 'super-secret-fallback-key'
    )
    await context.addCookies([
      {
        name: 'auth_token',
        value: token,
        domain: 'localhost',
        path: '/'
      }
    ])

    await page.goto('http://localhost:3000/')
    await page.evaluate((user) => {
      localStorage.setItem('user', JSON.stringify(user))
    }, { id: testUser.id, email: testUser.email, username: testUser.username })

    // 2. เดินทางไปหน้าโปรเจกต์
    await page.goto(`http://localhost:3000/project/${testProject.id}`)
    
    await page.waitForLoadState('domcontentloaded')
    await page.waitForSelector('div[data-testid="column-container"]')

    // 3. ตรวจสอบรอบแรก: มียศพร้อมสิทธิ์ CREATE_TASK -> ปุ่ม "+ เพิ่มงานใหม่" ต้องโผล่ขึ้นมาให้เห็น
    const addButton = page.locator('button:has-text("+ เพิ่มงานใหม่")')
    await expect(addButton).toBeVisible()

    // 4. ทำการอัปเดตยศทางหลังบ้านโดยตรง ดึงสิทธิ์ออก (จำลองการติ๊กเครื่องหมายสิทธิ์ออกใน UI)
    await prisma.role.update({
      where: { id: testRole.id },
      data: { permissions: [] }
    })

    // 5. โหลดหน้าใหม่
    await page.reload()
    await page.waitForLoadState('domcontentloaded')

    // 6. ตรวจสอบรอบสอง: ไม่มีสิทธิ์ CREATE_TASK แล้ว -> ปุ่ม "+ เพิ่มงานใหม่" ต้องถูกซ่อนไป
    await expect(addButton).not.toBeVisible()
  })
})
