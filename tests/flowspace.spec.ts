// tests/flowspace.spec.ts
import { test, expect } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

test.describe('Nuxt FlowSpace Board E2E Testing', () => {
  let testUser: any = null
  let testProject: any = null
  let defaultColumn: any = null

  test.beforeEach(async ({ page, context }) => {
    const rand = Math.floor(Math.random() * 1000000)
    // 1. สร้างผู้ใช้
    testUser = await prisma.user.create({
      data: {
        username: `pw_user_${rand}`,
        email: `pw_user_${rand}@example.com`,
        password: 'password123'
      }
    })

    // 2. สร้างโปรเจกต์
    testProject = await prisma.project.create({
      data: {
        name: `Playwright FlowSpace Test ${rand}`,
        ownerId: testUser.id,
        inviteCode: `PW${Math.floor(1000 + Math.random() * 9000)}`
      }
    })

    // 3. สร้างคอลัมน์มาตรฐาน (To Do, Doing, Done) เพื่อให้หน้าบอร์ดแสดงผลได้ทันที
    defaultColumn = await prisma.column.create({
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

    // 4. ล็อกอินจำลอง
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

    // เดินทางไปหน้าบอร์ดโปรเจกต์
    await page.goto(`http://localhost:3000/project/${testProject.id}`)
    await page.waitForLoadState('domcontentloaded')
  })

  test.afterEach(async () => {
    if (testProject) {
      await prisma.project.delete({ where: { id: testProject.id } }).catch(() => {})
    }
    if (testUser) {
      await prisma.user.delete({ where: { id: testUser.id } }).catch(() => {})
    }
  })

  test('ควรจะสามารถเพิ่มงานใหม่ และการ์ดงานโผล่ในช่อง To Do ได้ถูกต้อง', async ({ page }) => {
    const taskTitle = `งานทดสอบอัตโนมัติ #${Date.now()}`
    const taskDesc = 'รายละเอียดที่ถูกพิมพ์โดยหุ่นยนต์ Playwright'

    // ค้นหาและกดปุ่ม "+ เพิ่มงานใหม่" ใน Header
    await page.click('button:has-text("+ เพิ่มงานใหม่")')

    // กรอกข้อมูลหัวข้อและรายละเอียดลงใน Modal
    await page.fill('input[placeholder="เช่น เขียนคู่มือระบบ..."]', taskTitle)
    await page.fill('textarea[placeholder="อธิบายรายละเอียดงานเล็กน้อย..."]', taskDesc)

    // กดปุ่ม "บันทึกงาน"
    await page.click('button:has-text("บันทึกงาน")')

    // ตรวจสอบ
    const toDoColumn = page.locator('div[data-testid="column-container"]:has-text("To Do")').first()
    await expect(toDoColumn).toContainText(taskTitle)
  })

  test('ควรจะสามารถกดปุ่มย้ายงานเพื่อเปลี่ยนสถานะได้', async ({ page }) => {
    // สร้างการ์ดงานเตรียมไว้ก่อน เพื่อให้ปุ่มเริ่มทำปรากฏขึ้นจริง
    await prisma.task.create({
      data: {
        projectId: testProject.id,
        columnId: defaultColumn.id,
        title: 'งานจำลองเริ่มทำ',
        description: 'งานที่เตรียมย้ายช่อง'
      }
    })

    await page.reload()
    await page.waitForLoadState('domcontentloaded')

    const startButton = page.locator('button:has-text("เริ่มทำ ⚡")').first()
    await expect(startButton).toBeVisible()
    await startButton.click()
    
    await page.waitForTimeout(1000)
    
    const doingColumn = page.locator('div[data-testid="column-container"]:has-text("Doing")').first()
    await expect(doingColumn).not.toContainText('ไม่มีงานค้างอยู่ในช่องนี้')
  })
})