# 🌌 FlowSpace: General-Purpose Workflow Workspace

[![Live Demo](https://img.shields.io/badge/Live_Demo-flow--space--card.vercel.app-d97706?style=for-the-badge&logo=vercel)](https://flow-space-card.vercel.app)
[![User Manual](https://img.shields.io/badge/User_Manual-HTML_%7C_PDF-b45309?style=for-the-badge&logo=readme)](https://flow-space-card.vercel.app/manual.html)

FlowSpace เป็นแพลตฟอร์มบริหารจัดการงานและจัดระเบียบกระบวนการทำงานในรูปแบบบอร์ดจำลองเอนกประสงค์ (General-Purpose Workflow Board) ที่ออกแบบมาอย่างเรียบหรูสไตล์พรีเมียมสีเอิร์ธโทน-วอร์มไลท์ (Sand/Warm Theme) โดยไม่ได้จำกัดเฉพาะสายพัฒนาซอฟต์แวร์ แต่ตอบโจทย์การบริหารโครงการ งานส่วนตัว และกระบวนการของตี้ทำงานในทุกมิติ

---

## 🌐 เข้าใช้งานระบบ (Live Demo & Manual)
* 🚀 **เว็บไซต์หลัก (Production)**: [https://flow-space-card.vercel.app](https://flow-space-card.vercel.app)
* 📖 **คู่มือการใช้งานระบบ (Online HTML)**: [https://flow-space-card.vercel.app/manual.html](https://flow-space-card.vercel.app/manual.html)
* 📑 **ดาวน์โหลดคู่มือฉบับเอกสาร (PDF)**: [FlowSpace_User_Manual.pdf](https://flow-space-card.vercel.app/FlowSpace_User_Manual.pdf)

---

## ✨ Features เด่น
* 🧩 **Flexible Columns Grid**: ปรับแต่ง เพิ่ม ลบ หรือเปลี่ยนชื่อคอลัมน์ได้อย่างอิสระโดยไม่ผูกมัดกับ Todo/Doing/Done
* 🛡️ **Role-Based Access Control (RBAC)**: จัดการสิทธิ์สมาชิกทีมย่อย มอบยศแบ่งสิทธิ์บทบาทการสร้าง ลบ หรือตั้งค่าโครงการได้สไตล์ Discord
* 📊 **Subtask Progress Bar**: แทรกแถบแสดงเปอร์เซ็นต์ความก้าวหน้าเช็คลิสต์ย่อยขยับด้วยแอนิเมชันให้สังเกตง่ายขึ้นผ่านตัวการ์ดหลัก
* 🏷️ **Labels & Tags filter**: คัดกรองการ์ดงานผ่านชิปแท็กป้ายสีกำกับบอร์ด และกรองตามผู้รับผิดชอบหรือความเร่งด่วนในทันที
* 💬 **Activity Timeline & Discussion**: ระบบหน้าต่างคอมเมนต์ภายในรายละเอียดการ์ดงาน พร้อมบันทึกประวัติฟีดเหตุการณ์ย้อนหลัง (Task Logs)
* 📎 **Secure File Attachments**: จัดระเบียบการอัปโหลดไฟล์แนบเก็บเข้าดิสก์อย่างปลอดภัย พร้อมการป้องกันการบุกรุกช่องโหว่ (RCE / Path Traversal)
* 🔔 **SSE Real-time Alerts Drawer**: แจ้งเตือนสตรีมสดพุชผ่านหลังบ้านแบบเรียลไทม์เมื่อมีผู้แก้ไขงานหรือได้รับมอบหมายงาน

---

## 🛠️ Tech Stack
* **Frontend**: Nuxt 4, Vue 3, Vanilla CSS & TailwindCSS (Warm-Light Palette)
* **Backend**: Nitro Server Engine (Server-Side Event Streams, Multipart File Handlers)
* **Database**: Prisma Client & Object Relationship Mapping (ORM)
* **Testing**: Playwright E2E Integration Test Suite
* **Container**: Multi-stage lightweight Dockerfile & Docker Compose

---

## 🚀 Setup & Installation

### 1. โคลนและเตรียมไฟล์คอนฟิก
คัดลอกไฟล์ต้นแบบสำหรับตัวแปรสภาพแวดล้อม:
```bash
cp .env.example .env
```
เปิดไฟล์ `.env` เพื่อระบุการเชื่อมต่อฐานข้อมูลและระบุคีย์ความปลอดภัย `JWT_SECRET`

### 2. ติดตั้งและเริ่มรันงานพัฒนา (Development)
รันคำสั่งเหล่านี้เพื่อดาวน์โหลดแพ็กเกจ สร้างโมเดลฐานข้อมูล และรันเซิร์ฟเวอร์จำลอง:
```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. ปล่อยการเชื่อมโยง Prisma และสร้าง Client
npx prisma generate
npx prisma db push

# 3. รันโปรแกรมในเซิร์ฟเวอร์พัฒนาท้องถิ่น (Local Dev)
npm run dev
```
เข้าใช้งานบอร์ดโครงการได้ผ่านลิงก์ `http://localhost:3000`

### 3. รันชุดทดสอบ (Playwright E2E Testing)
ตรวจสอบความเสถียรของฟังก์ชันและระบบสิทธิ์สมาชิกด้วยคำสั่ง:
```bash
npx playwright test
```

### 4. รันผ่าน Docker Container (Production)
เริ่มต้นคอนเทนเนอร์ฐานข้อมูล PostgreSQL และแอปพลิเคชัน FlowSpace ด้วยคำสั่งเดียว:
```bash
docker compose up --build
```
ระบบจะทำการบูทตัวแปลงคีย์ฐานข้อมูลและสั่งรัน Schema Migrations อัตโนมัติ พร้อมให้บริการทันที!
