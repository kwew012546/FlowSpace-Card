# FlowSpace แบบจำลองความต้องการของระบบ (Requirement Model)

> **ขั้นตอน**: ขั้นตอนที่ 1 การทำความเข้าใจความต้องการ (`requirement-analysis`)  
> **โค้ดเบสอ้างอิง**: `main` @ `f0737a0`  
> **วันที่สร้างแบบจำลอง**: 2026-10-15  
> **แหล่งข้อมูลอ้างอิง**:  
> - หลักฐานเอกสาร (E1): `public/manual.html` (FlowSpace User Manual v1.0), `README.md`  
> - หลักฐานโค้ด (E2): `prisma/schema.prisma`, `server/api/**/*.ts`, `server/middleware/*.ts`, `app/pages/**/*.vue`

---

## 1. แบบจำลองความต้องการเชิงโครงสร้าง (Machine-Readable Schema)

```yaml
requirement_model:
  goal: "ให้บริการแพลตฟอร์มจัดการงานสไตล์ Kanban ที่รองรับการทำงานร่วมกันแบบ Real-time หลายบทบาท พร้อมความพร้อมใช้งานสูงและปลอดภัย"
  success_criteria:
    - "รองรับการยืนยันตัวตนที่ปลอดภัย ไม่มีการเปิดเผยรหัสผ่าน พร้อมลิงก์ยืนยันอีเมลอายุ 15 นาที"
    - "รองรับการเข้าร่วมโปรเจกต์อย่างรวดเร็วด้วยรหัสเชิญ 6 หลัก และการแยกสิทธิ์ตามบทบาทสไตล์ Discord"
    - "รองรับการจัดการคอลัมน์คานบันแบบกำหนดเอง (เพิ่ม/ลบ/แก้ไข/เรียงลำดับ) และการจัดการวงจรชีวิตของการ์ดงาน (Checklist, Attachment, Comment, Activity Log)"
    - "รองรับการซิงค์ข้อมูลข้ามเครื่องแบบ Real-time ด้วย SSE (Optimistic UI 0 วินาที พร้อมระบบเชื่อมต่อใหม่อัตโนมัติ)"
    - "การป้องกันรอบด้าน: Rate Limiting, ป้องกัน IDOR, ป้องกัน Orphan State และป้องกัน Deadlock/Soft-lock"

  scope:
    in_scope:
      - "Module 1: ระบบยืนยันตัวตนและบัญชีผู้ใช้ (ลงทะเบียน, ล็อกอิน, ยืนยันอีเมลใน 15 นาที, ขอส่งอีเมลซ้ำ, JWT Cookie Session, ออกจากระบบ)"
      - "Module 2: การควบคุมอัตราการเรียกและจำกัด Polling (จำกัดระดับเซิร์ฟเวอร์ 20/120 rpm, ฝั่งไคลเอนต์จำกัด bounded polling ไม่เกิน 5 นาที)"
      - "Module 3: การจัดการพื้นที่ทำงานและโปรเจกต์ (สร้างโปรเจกต์, เปลี่ยนชื่อ, ลบโปรเจกต์, จัดการรหัสเชิญ 6 หลัก, เชิญทางอีเมล, ออกจากโปรเจกต์)"
      - "Module 4: ระบบสิทธิ์และบทบาท (Project Owner มีอำนาจเด็ดขาด, กำหนด Custom Role ได้, สิทธิ์ 4 กลุ่มหลัก, การเตะสมาชิก)"
      - "Module 5: คอลัมน์คานบันแบบกำหนดเอง (สร้างคอลัมน์, เปลี่ยนชื่อ, ป้องกันการลบ, ปรับลำดับ)"
      - "Module 6: การ์ดงานขั้นสูง (สร้าง, แก้ไข, ลำดับความสำคัญ LOW/MEDIUM/HIGH/URGENT, มอบหมายผู้รับผิดชอบ, วันกำหนดส่ง, ลบงาน)"
      - "Module 7: ส่วนเสริมของการ์ดงาน (Subtasks รายการตรวจสอบ, Comments ความคิดเห็น, Attachments ไฟล์แนบ, TaskLog บันทึกกิจกรรม)"
      - "Module 8: การทำงานร่วมกันแบบเรียลไทม์และการแจ้งเตือน (SSE Event Stream, Heartbeat คงการเชื่อมต่อ, Optimistic UI, ซิงค์เมื่อสลับแท็บกลับมา, ศูนย์แจ้งเตือน)"
    out_of_scope:
      - "ระบบหลายองค์กรระดับ Enterprise Multi-tenancy (ปัจจุบันเป็นโมเดลผู้ใช้เดียวถือได้หลายโปรเจกต์)"
      - "การล็อกอินผ่านผู้ให้บริการบุคคลที่สาม (OAuth เช่น Google/GitHub)"
      - "ระบบคิดเงินและตัดบัตรชำระเงิน (SaaS Billing & Subscriptions)"
      - "การแก้ไข Markdown ร่วมกันแบบเรียลไทม์ (Operational Transformation / CRDT)"

  roles:
    - name: "Anonymous / Guest (ผู้เยี่ยมชมที่ยังไม่ล็อกอิน)"
      can:
        - "เข้าถึงหน้าเข้าสู่ระบบ `/login` และหน้าสมัครสมาชิก `/register`"
        - "รับและคลิกลิงก์ยืนยันตัวตนทางอีเมล `/verify-email?token=...`"
      cannot:
        - "เข้าถึง `/dashboard` หรือ `/project/[id]`"
        - "เรียกใช้ API ใดๆ ที่ต้องผ่านการยืนยันตัวตน (`/api/*`)"

    - name: "Project Owner (เจ้าของโปรเจกต์ / ผู้สร้างบอร์ด)"
      can:
        - "มีอำนาจสูงสุดเต็มรูปแบบในโปรเจกต์นั้นๆ (เหนือกว่าทุกการตั้งค่า Role)"
        - "แก้ไขชื่อและคำอธิบายโปรเจกต์"
        - "เปิด/ปิด การเข้าร่วมผ่านรหัสเชิญ และรีเซ็ตรหัสเชิญ 6 หลักใหม่ได้ตลอดเวลา"
        - "สร้าง แก้ไข และลบบทบาทที่กำหนดเอง (Custom Roles) ภายในโปรเจกต์"
        - "แต่งตั้ง เปลี่ยนแปลง หรือถอดยศบทบาทของสมาชิกในโปรเจกต์"
        - "เตะสมาชิกออกจากโปรเจกต์ (ระบบจะปลดงานที่ผูกกับสมาชิกคนนั้นออกอัตโนมัติ)"
        - "ลบโปรเจกต์ทั้งหมด (ลบแบบ Cascade ทั้งคอลัมน์ การ์ด ไฟล์แนบ และประวัติ)"
        - "สร้าง เปลี่ยนชื่อ และลบคอลัมน์คานบัน (คอลัมน์ที่มีการ์ดงานจะได้รับการป้องกัน)"
        - "สร้าง แก้ไข ลากย้าย และลบการ์ดงานทั้งหมด"
      cannot:
        - "กดออกจากโปรเจกต์ของตัวเองโดยตรง (ต้องโอนสิทธิ์หรือลบโปรเจกต์แทน)"
        - "ถูกเปลี่ยนบทบาทหรือถูกเตะออกจากโปรเจกต์โดยผู้ดูแลคนอื่น"

    - name: "Project Member with MANAGE_PROJECT (สมาชิกที่มีสิทธิ์บริหารโปรเจกต์)"
      can:
        - "แก้ไขชื่อและรายละเอียดโปรเจกต์"
        - "เปิด/ปิด หรือรีเซ็ตรหัสเชิญโปรเจกต์"
        - "จัดการบทบาท (สร้าง/แก้ไข/ลบ Role)"
        - "ปรับเปลี่ยนบทบาทของสมาชิกคนอื่นที่ไม่ใช่ Owner"
        - "เตะสมาชิกคนอื่นที่ไม่ใช่ Owner ออกจากโปรเจกต์"
        - "สร้าง เปลี่ยนชื่อ และลบคอลัมน์ที่ว่างเปล่า"
      cannot:
        - "ลบโปรเจกต์ทั้งหมด"
        - "แก้ไขบทบาทของ Owner หรือเตะ Owner ออก"
        - "เตะตัวเองออกจากโปรเจกต์"

    - name: "Project Member with INVITE_MEMBERS (สมาชิกที่มีสิทธิ์เชิญ)"
      can:
        - "ดูและคัดลอกรหัสเชิญโปรเจกต์ 6 หลัก"
        - "ค้นหาและเชิญผู้ใช้อื่นในระบบผ่านอีเมล"
      cannot:
        - "รีเซ็ตรหัสเชิญ หรือปิดการรับคนเข้าโปรเจกต์ (ต้องใช้ MANAGE_PROJECT)"
        - "จัดการบทบาทสมาชิก หรือเตะผู้อื่นออก"

    - name: "Project Member with CREATE_TASK (สมาชิกที่มีสิทธิ์สร้างงาน)"
      can:
        - "สร้างการ์ดงานใหม่ในทุกคอลัมน์"
        - "แก้ไขชื่องาน รายละเอียด ลำดับความสำคัญ ผู้รับผิดชอบ และวันกำหนดส่ง"
        - "ลากย้ายการ์ดงานระหว่างคอลัมน์ต่างๆ"
        - "เพิ่ม ติ๊กถูก และลบรายการงานย่อย (Subtasks Checklist)"
        - "เขียนความคิดเห็นในการ์ดงาน"
        - "อัปโหลดไฟล์แนบในการ์ดงาน"
      cannot:
        - "ลบการ์ดงาน (ต้องใช้สิทธิ์ DELETE_TASK)"
        - "จัดการคอลัมน์คานบัน (ต้องใช้สิทธิ์ MANAGE_PROJECT)"

    - name: "Project Member with DELETE_TASK (สมาชิกที่มีสิทธิ์ลบงาน)"
      can:
        - "ลบการ์ดงานที่ไม่ต้องการออกจากโปรเจกต์"
      cannot:
        - "จัดการคอลัมน์ หรือจัดการสมาชิก"

    - name: "Viewer / Ordinary Member (สมาชิกทั่วไปที่ไม่มีสิทธิ์พิเศษ)"
      can:
        - "เปิดดูบอร์ดคานบัน รายละเอียดการ์ด ประวัติกิจกรรม และความคิดเห็น"
        - "รับการแจ้งเตือนเมื่อตนเองได้รับมอบหมายงานหรือถูกเปลี่ยนบทบาท"
        - "กดออกจากโปรเจกต์ด้วยตนเอง (ระบบจะปลดภาระงานที่ผูกไว้ออกให้อัตโนมัติ)"
      cannot:
        - "สร้างหรือแก้ไขการ์ดงาน"
        - "ลากย้ายการ์ดงาน"
        - "ลบการ์ดงาน"
        - "จัดการคอลัมน์ หรือดูการตั้งค่าการเชิญ"

  inputs:
    - name: "User Registration Payload"
      source: "แบบฟอร์มหน้าเว็บ (`/register`)"
      format: "JSON: { username: string, email: string, password: string }"
      constraints: "email ต้องมีค่าและรูปแบบถูกต้อง (ตัดช่องว่าง trim & แปลงตัวพิมพ์เล็ก toLowerCase อัตโนมัติ), password ยาว >= 6 ตัวอักษร"
    - name: "Task Creation Payload"
      source: "Modal สร้างงาน (`/project/[id]`)"
      format: "JSON: { title: string, columnId: number, projectId: number, priority?: enum, assigneeId?: number, dueDate?: string }"
      constraints: "title ยาว 1-150 ตัวอักษร, columnId ต้องอยู่ใน projectId เดียวกัน, assignee ต้องเป็นสมาชิกของโปรเจกต์นั้น"
    - name: "Column Creation Payload"
      source: "แถบเครื่องมือบนบอร์ด (`/project/[id]`)"
      format: "JSON: { projectId: number, title: string }"
      constraints: "title ยาว 1-100 ตัวอักษร"
    - name: "Invite Code Input"
      source: "Modal เข้าร่วมโปรเจกต์ (`/dashboard`)"
      format: "JSON: { inviteCode: string }"
      constraints: "สตริง 6 ตัวอักษร (ตัวพิมพ์ใหญ่และตัวเลข HEX), ตัดช่องว่าง trim() ก่อนตรวจสอบ"

  outputs:
    - name: "JWT Auth Token Cookie"
      destination: "คุกกี้ในเบราว์เซอร์ของผู้ใช้ (`auth_token`)"
      format: "HttpOnly, Secure (ในโหมด production), SameSite: lax, อายุการใช้งาน 7 วัน"
      consumer: "Server Auth Middleware"
    - name: "SSE Project Events Stream"
      destination: "Client EventSource (`/api/projects/events?projectId=...`)"
      format: "text/event-stream: data: { type: 'TASKS_UPDATED' | 'TEAM_UPDATED' }"
      consumer: "หน้าจอบอร์ดคานบัน (Reactive Board View)"
    - name: "In-App Notifications"
      destination: "ถาดการแจ้งเตือนของผู้ใช้"
      format: "Array of Notification objects (title, message, isRead, createdAt)"
      consumer: "ไอคอนกระดิ่งแจ้งเตือนบน Header"

  states:
    - entity: "User Account"
      initial: "Unverified"
      transitions:
        - from: "Unverified"
          to: "Verified"
          event: "คลิกลิงก์ยืนยันตัวตนทางอีเมลที่ถูกต้องภายใน 15 นาที"
        - from: "Unverified"
          to: "Unverified (Token Renewed)"
          event: "กดขอส่งอีเมลยืนยันซ้ำ หรือสมัครซ้ำด้วยอีเมลเดิมที่ยังไม่ได้ยืนยัน"
    - entity: "Project Invite Status"
      initial: "Active"
      transitions:
        - from: "Active"
          to: "Disabled"
          event: "Owner หรือผู้ดูแลกดสลับ isInviteActive = false"
        - from: "Disabled"
          to: "Active"
          event: "Owner หรือผู้ดูแลกดสลับ isInviteActive = true"
        - from: "Active / Disabled"
          to: "Active / Disabled (New Code)"
          event: "กดปุ่มสุ่มรหัสเชิญใหม่ (รหัสเดิมจะถูกยกเลิกทันที)"
    - entity: "Task Lifecycle"
      initial: "Created (สร้างในคอลัมน์เป้าหมาย)"
      transitions:
        - from: "Column A"
          to: "Column B"
          event: "ลากการ์ดวางข้ามคอลัมน์ หรืออัปเดต columnId"
        - from: "Any Column"
          to: "Deleted"
          event: "สมาชิกที่มีสิทธิ์ DELETE_TASK ยืนยันการลบ"

  rules:
    - id: "R01_RATE_LIMIT"
      desc: "API ถูกจำกัดอัตราการเรียกตาม IP: เอนด์พอยต์ยืนยันตัวตนจำกัดที่ 20 ครั้ง/นาที, API ทั่วไปจำกัด 120 ครั้ง/นาที, เกินกว่านั้นตอบกลับ HTTP 429"
      evidence:
        level: "E2"
        source: "server/middleware/rateLimit.ts:39-74"
    - id: "R02_REGISTRATION_IDEMPOTENCY"
      desc: "การสมัครซ้ำด้วยอีเมลที่ยังไม่ได้ยืนยันตัวตน จะไม่แจ้งข้อผิดพลาดว่าอีเมลซ้ำ แต่จะอัปเดตข้อมูลและออกโทเค็นยืนยันตัวตนอายุ 15 นาทีชุดใหม่ให้ทันทีเพื่อป้องกัน Deadlock"
      evidence:
        level: "E2"
        source: "server/api/auth/register.post.ts:29-50"
    - id: "R03_VERIFY_TOKEN_LIFETIME"
      desc: "ลิงก์ยืนยันอีเมลมีอายุจำกัดที่ 15 นาทีอย่างเข้มงวด หากหมดอายุจะส่งไปยังหน้าแจ้งเตือนพร้อมส่งพารามิเตอร์อีเมลเพื่อให้ผู้ใช้กดส่งใหม่ได้ใน 1 คลิก"
      evidence:
        level: "E4"
        source: "server/api/auth/verify-email.get.ts:60-71, server/api/auth/resend-verification.post.ts:37-40"
    - id: "R04_AUTH_VERIFIED_LOGIN"
      desc: "ผู้ใช้ที่ยังไม่ยืนยันอีเมลจะไม่สามารถเข้าสู่ระบบได้ โดย API จะส่งกลับ 403 Forbidden พร้อมลิงก์สำหรับกดส่งอีเมลยืนยันตัวตนใหม่"
      evidence:
        level: "E2"
        source: "server/api/auth/login.post.ts:48-53"
    - id: "R05_OWNER_PROTECTION"
      desc: "Owner ของโปรเจกต์มีอำนาจสูงสุดเด็ดขาด ไม่สามารถถูกเตะ ไม่สามารถถูกเปลี่ยนยศ และไม่สามารถกดออกจากโปรเจกต์ของตนเองได้"
      evidence:
        level: "E2"
        source: "server/api/members/kick.delete.ts:35-40, server/api/projects/leave.delete.ts:20-25"
    - id: "R06_ORPHAN_TASK_PREVENTION"
      desc: "เมื่อสมาชิกถูกเตะหรือกดออกจากโปรเจกต์ ระบบจะปลดผู้รับผิดชอบบนการ์ดงานทั้งหมดของสมาชิกคนนั้นเป็นค่าว่าง (assigneeId = null) ใน Transaction เดียวกัน ป้องกันงานค้างเป็นผี (No Orphan Tasks)"
      evidence:
        level: "E2"
        source: "server/api/members/kick.delete.ts:73-81, server/api/projects/leave.delete.ts:34-42"
    - id: "R07_ZERO_COLUMN_PREVENTION"
      desc: "บอร์ดคานบันต้องมีคอลัมน์คงเหลืออยู่อย่างน้อย 1 คอลัมน์เสมอ ไม่อนุญาตให้ลบคอลัมน์สุดท้ายเพื่อป้องกันบอร์ดกลายเป็นบอร์ดเปล่าที่ใช้งานไม่ได้"
      evidence:
        level: "E2"
        source: "server/api/columns/delete.delete.ts:28-37"
    - id: "R08_NON_EMPTY_COLUMN_PROTECTION"
      desc: "คอลัมน์ที่ยังมีการ์ดงานค้างอยู่จะไม่สามารถลบได้ ต้องทำการย้ายงานไปยังคอลัมน์อื่นหรือลบงานออกก่อนจึงจะลบคอลัมน์ได้"
      evidence:
        level: "E2"
        source: "server/api/columns/delete.delete.ts:39-49"
    - id: "R09_IDOR_PREVENTION"
      desc: "การดึงข้อมูลโปรเจกต์ การสร้างโปรเจกต์ หรือการเข้าร่วม ต้องดึง user.id จาก Session ของเซิร์ฟเวอร์เท่านั้น ห้ามเชื่อถือ id ที่ส่งมาจาก client query/body เด็ดขาด"
      evidence:
        level: "E2"
        source: "server/api/projects/list.get.ts:10-15, server/api/projects/create.post.ts:9-15"
    - id: "R10_CLOSED_LOOP_REACTIVE_SYNC"
      desc: "ทุกการเปลี่ยนแปลงของสมาชิก บทบาท และการ์ดงาน จะต้องบรอดแคสต์ผ่าน SSE Event Stream บนเซิร์ฟเวอร์ และฝั่งไคลเอนต์จะมีกลไก Debounce 1.5 วินาที พร้อมซิงค์ทันทีเมื่อสลับแท็บกลับมา"
      evidence:
        level: "E2"
        source: "app/pages/project/[id].vue:1270-1315, server/utils/sse.ts:1-35"

  exceptions:
    - cond: "Token ยืนยันตัวตนหมดอายุ หรือถูกดัดแปลง"
      expect: "นำทางผู้ใช้ไปยังหน้าแจ้งเตือนข้อผิดพลาด พร้อมปุ่มสำหรับกดขอรับอีเมลใหม่ได้ทันที ไม่เกิด Unhandled 500"
    - cond: "พยายามลบคอลัมน์ที่ยังมีการ์ดงานค้างอยู่"
      expect: "ตอบกลับ HTTP 400 Bad Request พร้อมข้อความแจ้งเตือนจำนวนการ์ดที่ค้างอยู่และคำแนะนำให้ย้ายการ์ดก่อน"
    - cond: "สมาชิกที่มีงานค้างอยู่ถูกเตะออกจากโปรเจกต์"
      expect: "การ์ดยังคงอยู่ในคอลัมน์เดิม แต่ผู้รับผิดชอบจะถูกเปลี่ยนเป็น 'ยังไม่มอบหมาย' (Unassigned) อัตโนมัติ"
    - cond: "การเชื่อมต่อเครือข่ายหลุด หรือสภาพแวดล้อม Serverless หลับชั่วคราว"
      expect: "SSE จะทำ Exponential Backoff และเชื่อมต่อใหม่อัตโนมัติ (3.5s) โดยหน้าเว็บใช้ Optimistic UI ไม่พัง"

  dependencies:
    - name: "PostgreSQL Database (Neon)"
      type: "ฐานข้อมูลหลัก จัดการผ่าน Prisma ORM"
    - name: "JWT Token Engine"
      type: "ระบบสร้างและตรวจสอบ Session และ Verification Token แบบ Stateless"
    - name: "Nitro / SSE Subsystem"
      type: "ระบบบรอดแคสต์เหตุการณ์แบบ In-Memory ประจำแต่ละโปรเจกต์"

  open_questions: []
```

---

## 2. การตรวจสอบความสอดคล้องระหว่างเอกสารและโค้ดจริง (Consistency Verification)

1. **การจับคู่สิทธิ์ตามบทบาท (เอกสาร E1 vs โค้ดจริง E2)**:
   - *ในคู่มือ `manual.html`* ระบุชื่อสิทธิ์แบบละเอียด (`MANAGE_COLUMNS`, `MANAGE_ROLES`, `KICK_MEMBERS`)
   - *ในโค้ดจริง `server/utils/permissions.ts` และ `app/pages/project/[id].vue`* ได้ทำการรวมกลุ่มสิทธิ์ด้านการจัดการเข้าด้วยกันเป็น **`MANAGE_PROJECT`** ร่วมกับอีก 3 สิทธิ์สำคัญคือ **`CREATE_TASK`**, **`DELETE_TASK`** และ **`INVITE_MEMBERS`**
   - *หลักการตัดสิน*: ยึดตามโค้ดจริง (E2) เป็นหลัก โดยการทดสอบจะครอบคลุมสิทธิ์หลักทั้ง 4 กลุ่มนี้อย่างครบถ้วน
2. **เกณฑ์ด้าน Non-functional Requirements (NFRs)**:
   - ความเร็วในการตอบสนอง (Latency): API ทั่วไปต้องมีค่า P95 < 500ms
   - การรองรับอุปกรณ์มือถือ: ปฏิบัติตามกฎ 8 Pragmatic Laws อย่างเคร่งครัด พื้นที่สัมผัส (Touch Targets) ≥ 44×44px, ใช้ความสูง `100dvh` เพื่อป้องกันปัญหาแอดเดรสบาร์บัง และไม่มีปัญหาจอด้านข้างล้น (No Horizontal Overflow)
