# FlowSpace กลยุทธ์การทดสอบทั้งระบบ (Test Strategy)

> **ขั้นตอน**: ขั้นตอนที่ 2 กลยุทธ์การทดสอบ (`test-strategy`)  
> **ความต้องการที่เกี่ยวข้อง**: [`qa/需求模型.md`](file:///d:/Code/my-kanban-app/qa/需求模型.md)  
> **โค้ดเบสอ้างอิง**: `main` @ `f0737a0`  
> **วันที่จัดทำกลยุทธ์**: 2026-10-15  

---

## 1. ตารางวิเคราะห์ความเสี่ยง (Risk Map)

| รหัส | รายละเอียดความเสี่ยง | มิติผลกระทบ | ความรุนแรง (Impact 1-5) | โอกาสเกิด (Likelihood 1-5) | ระดับความเสี่ยง (Impact × Likelihood) | แหล่งอ้างอิงโค้ด (Evidence) | กลยุทธ์รับมือ |
|---|---|---|---|---|---|---|---|
| **R1** | การเจาะสิทธิ์แนวตั้งและแนวนอน (IDOR) เพื่อเข้าถึง แก้ไข หรือขโมยข้อมูลโปรเจกต์ของผู้อื่น | สิทธิ์ / ความปลอดภัย | 5 | 2 | **Critical (10)** | E2: `server/api/projects/list.get.ts`, `server/api/members/index.get.ts` | กำหนดระดับ Full ทดสอบ API อ่าน/เขียนทุกตัวแบบไม่มี Token และสวมรอยข้ามโปรเจกต์ |
| **R2** | บอร์ดตายสนิทจากการลบคอลัมน์จนหมด (Zero-Column Deadlock) | สถานะ / ความพร้อมใช้งาน | 5 | 2 | **Critical (10)** | E2: `server/api/columns/delete.delete.ts:28-37` | ตรวจสอบ Zero-Column Guard บนเซิร์ฟเวอร์และปุ่มเทาบนหน้าเว็บ |
| **R3** | การเปลี่ยนสมาชิกทำให้การ์ดงานกลายเป็นงานผีไร้เจ้าของ (Orphan Assignment) และบอร์ดไม่ซิงค์ | ความถูกต้องของข้อมูล | 4 | 2 | **High (8)** | E2: `server/api/members/kick.delete.ts:73`, `server/api/projects/leave.delete.ts:34` | ตรวจสอบ Transaction ปลด `assigneeId` ให้ว่างและบรอดแคสต์ `TASKS_UPDATED` ทันที |
| **R4** | การยิงรีเควสต์ความถี่สูงจนเซิร์ฟเวอร์ล่ม (DoS / สุ่มรหัสเชิญ / รหัสผ่าน) | ความปลอดภัยของระบบ | 4 | 2 | **High (8)** | E2: `server/middleware/rateLimit.ts:39-74` | ตรวจสอบ Rate Limit 20/120 rpm และการตอบกลับ HTTP 429 Retry-After |
| **R5** | ลบคอลัมน์ที่มีการ์ดงานค้างอยู่โดยไม่ตั้งใจจนงานสูญหาย | ความถูกต้องของข้อมูล | 4 | 2 | **High (8)** | E2: `server/api/columns/delete.delete.ts:39-49` | ตรวจสอบการสกัดกั้นการลบคอลัมน์ที่มีงานค้างอยู่ |
| **R6** | การเชื่อมต่อ SSE ขัดข้องจนหน้าเว็บกลายเป็นสถานะผีดิบ (Zombie State ไม่ซิงค์) | ความเสถียรของระบบ | 3 | 2 | **Medium (6)** | E2: `app/pages/project/[id].vue:1288-1298` | ตรวจสอบการเชื่อมต่อใหม่อัตโนมัติและกลไกฟื้นฟูเมื่อแท็บกลับมาทำงาน (`visibilitychange`) |

---

## 2. โครงสร้างกลยุทธ์การทดสอบ (Machine-Readable Strategy Schema)

```yaml
test_strategy:
  feature: "FlowSpace Kanban Full System"

  functional_scope:
    functional:
      include: true
      depth: full
      rationale: "โฟลว์ CRUD หลักของบอร์ดคานบัน คอลัมน์ และการ์ดงานเป็นคุณค่าทางธุรกิจหลักของระบบ"
      risk_refs: ["R2", "R5"]
    boundary:
      include: true
      depth: standard
      rationale: "ครอบคลุมความยาวข้อความสูงสุด (150/1000 อักษร), ความยาวรหัสผ่าน, อัตรา Rate Limit 20/120 rpm"
      risk_refs: ["R4"]
    permission:
      include: true
      depth: full
      rationale: "ครอบคลุมอำนาจเด็ดขาดของ Owner และการแยกสิทธิ์ MANAGE_PROJECT, INVITE_MEMBERS, CREATE_TASK, DELETE_TASK"
      risk_refs: ["R1"]
    state:
      include: true
      depth: standard
      rationale: "ครอบคลุมสถานะผู้ใช้ (Unverified/Verified), สถานะเปิด/ปิดรหัสเชิญ, การย้ายการ์ดข้ามคอลัมน์"
    data_consistency:
      include: true
      depth: standard
      rationale: "ครอบคลุมความถูกต้องของข้อมูลเมื่อเตะสมาชิก/สมาชิกออกเอง ผู้รับผิดชอบงานต้องถูกเคลียร์เป็นค่าว่างใน Transaction เดียวกัน"
      risk_refs: ["R3"]
    regression:
      include: true
      depth: standard
      rationale: "ทดสอบซ้ำการทำงานเดิมเพื่อป้องกันผลกระทบจากการปรับปรุงระบบความปลอดภัยล่าสุด"

  type_scope:
    performance: { decision: include, depth: light, signals: ["API P95 < 500ms Baseline"], executor: agent, execution_status: ready }
    security_business: { decision: include, depth: full, signals: ["Multi-roles", "Internal: permission>=standard", "IDOR Prevention", "Session Auth"], risk_refs: ["R1", "R4"], executor: agent, execution_status: ready }
    reliability: { decision: include, depth: standard, signals: ["SSE retry: project/[id].vue:1294", "RateLimit: rateLimit.ts:41"], risk_refs: ["R6"], executor: agent, execution_status: ready }
    concurrency: { decision: include, depth: light, signals: ["Drag card concurrency", "SSE broadcast"], executor: agent, execution_status: ready }
    compatibility: { decision: include, depth: light, signals: ["Vue 3", "100dvh", "44px touch targets"], executor: agent, execution_status: ready }
    accessibility: { decision: include, depth: light, signals: ["Interactive UI"], executor: agent, execution_status: ready }
    visual: { decision: include, depth: light, signals: ["Kanban Board responsive grid"], executor: agent, execution_status: ready }
    i18n: { decision: exclude, rationale: "เวอร์ชันปัจจุบันมุ่งเน้นภาษาหลักภาษาเดียว ยังไม่มีแพ็กเกจแปลหลายภาษา", scanned: ["Requirement(G)", "No i18n lib(S)"] }
    migration: { decision: include, depth: light, signals: ["Prisma Schema: schema.prisma"], executor: agent, execution_status: ready }
    contract_integration: { decision: include, depth: standard, signals: ["Postgres DB", "SSE Event-stream"], executor: agent, execution_status: ready }

  depth_budget:
    full_axes: ["functional", "permission", "security_business"]
    ranking_rationale: "R1 (越权/IDOR Critical) > R2 (คอลัมน์เป็น 0 Deadlock Critical) > R4 (Security Brute Force High) สอดคล้องตามเงื่อนไข full <= 3 แกน"

  automation_plan:
    approach: "การทดสอบอัตโนมัติแบบแบ่งชั้น: ใช้ API Integration Testing ที่รวดเร็วและครอบคลุมทุกขอบเขตสิทธิ์เป็นฐานหลัก เสริมด้วยการทดสอบโฟลว์สำคัญ"
    tools:
      api: "Node.js Integration Suite / Vitest (ตรวจสอบ HTTP Status, Cookie Session, Rate Limit, Permission Isolation, ข้อผิดพลาด 400/403/404)"
      e2e: "Playwright E2E UI Automation (สำหรับทดสอบในเบราว์เซอร์จริง การล็อกอิน การลากการ์ด และการซิงค์แบบเรียลไทม์)"

  regression_plan:
    p0_smoke_anchors:
      - "TC-AUTH-01: สมัครสมาชิก -> ยืนยันตัวตน 15 นาที -> ล็อกอินรับ HttpOnly Cookie"
      - "TC-PROJ-01: สร้างโปรเจกต์ -> สร้าง 3 คอลัมน์เริ่มต้นอัตโนมัติ -> สร้างรหัสเชิญ 6 หลัก"
      - "TC-TASK-01: สร้างการ์ดงาน -> ลากย้ายข้ามคอลัมน์ -> อัปเดตข้อมูลแบบเรียลไทม์"
      - "TC-SEC-01: สกัดกั้นการเข้าถึงโปรเจกต์โดยไม่ล็อกอินหรือข้ามโปรเจกต์ (401/403)"
    cadence: "รัน P0 Smoke Test ก่อนรวมโค้ด (PR) และรัน Full Regression ก่อน Deploy ขึ้น Production"

  risk_map_ref: "หัวข้อที่ 1 ในเอกสารนี้"
```

---

## 3. สรุปการจัดสรรงบประมาณความลึกของการทดสอบ (Depth Budget Summary)

* **แกนทดสอบระดับลึกที่สุด Full Depth (3 แกน)**: `functional` (ฟังก์ชันการทำงานหลัก), `permission` (การแบ่งแยกสิทธิ์และบทบาท), `security_business` (ความปลอดภัยทางธุรกิจและการป้องกันการเข้าถึงข้อมูลโดยมิชอบ)
* **แกนทดสอบระดับมาตรฐาน Standard Depth**: `boundary`, `state`, `data_consistency`, `reliability`, `contract_integration`
* **แกนทดสอบระดับพื้นฐาน Light Depth**: `performance`, `concurrency`, `compatibility`, `accessibility`, `visual`, `migration`
* **แกนที่ยกเว้น Exclude**: `i18n` (ยังไม่มีข้อกำหนดด้านหลายภาษาในสเปกปัจจุบัน)
