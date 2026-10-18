<!-- app/pages/register.vue -->
<template>
  <div class="min-h-screen min-h-[100dvh] bg-gradient-to-br from-[#fcf8f2] via-[#f7f0e4] to-[#f3e9d7] dark:from-[#070b14] dark:via-[#0b1120] dark:to-[#0f172a] flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-x-hidden bg-grid text-stone-800 dark:text-slate-100 transition-colors duration-300">
    
    <!-- Ambient Aurora Mesh Glow -->
    <div class="hidden sm:block absolute top-[-12%] left-[-8%] w-[500px] h-[500px] bg-amber-400/20 dark:bg-amber-500/12 rounded-full blur-3xl pointer-events-none" aria-hidden="true"></div>
    <div class="hidden sm:block absolute bottom-[-12%] right-[-8%] w-[500px] h-[500px] bg-indigo-400/15 dark:bg-indigo-500/12 rounded-full blur-3xl pointer-events-none" aria-hidden="true"></div>

    <!-- Top Utility Header (Brand + Theme Toggle on every page) -->
    <header class="w-full max-w-6xl mx-auto flex items-center justify-between relative z-20 mb-4 sm:mb-6">
      <NuxtLink to="/login" class="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/85 dark:bg-slate-900/80 backdrop-blur-md border border-amber-200/80 dark:border-slate-700/80 shadow-xs hover:border-amber-400 transition-all">
        <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-sm shadow-amber-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4" aria-hidden="true">
            <rect width="7" height="9" x="3" y="3" rx="1" />
            <rect width="7" height="5" x="14" y="3" rx="1" />
            <rect width="7" height="9" x="14" y="12" rx="1" />
            <rect width="7" height="5" x="3" y="16" rx="1" />
          </svg>
        </div>
        <div class="text-left">
          <span class="text-base font-black tracking-tight text-stone-900 dark:text-white block leading-none">FlowSpace</span>
          <span class="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Workspace OS</span>
        </div>
      </NuxtLink>

      <div class="flex items-center gap-2">
        <a
          href="/manual.html"
          target="_blank"
          class="min-h-[42px] px-3 py-2 rounded-xl bg-white/85 dark:bg-slate-900/80 backdrop-blur-md border border-stone-200/90 dark:border-slate-700/80 text-xs font-bold text-stone-600 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-400 inline-flex items-center gap-1.5 transition-all shadow-2xs"
          title="เปิดคู่มือการใช้งาน FlowSpace"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          <span class="hidden sm:inline">คู่มือระบบ</span>
        </a>
        <ThemeToggle :showLabel="true" />
      </div>
    </header>

    <!-- Main Split-Screen SaaS Bento Container -->
    <div class="w-full max-w-6xl mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch relative z-10">
      
      <!-- Left Column on Desktop / Bottom Onboarding Showcase on Mobile & Tablet -->
      <aside class="order-2 lg:order-1 flex lg:col-span-7 rounded-3xl bg-gradient-to-br from-slate-900 via-[#111827] to-[#1e1b4b] text-white p-5 sm:p-8 xl:p-10 flex-col justify-between relative overflow-hidden shadow-2xl border border-slate-800/90 max-w-md lg:max-w-none mx-auto w-full">
        <div class="hidden sm:block absolute -top-24 -right-24 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" aria-hidden="true"></div>
        <div class="hidden sm:block absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" aria-hidden="true"></div>

        <div class="relative z-10">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-amber-300 text-[11px] sm:text-xs font-bold mb-4 sm:mb-6">
            <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0"></span>
            <span>เริ่มต้นใช้งานฟรีใน 30 วินาที</span>
          </div>

          <h2 class="text-2xl sm:text-3xl xl:text-4xl font-black tracking-tight leading-tight text-white mb-2.5 sm:mb-3">
            สร้างพื้นที่ทำงานร่วมกัน <br />
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400">
              สำหรับคุณและทีมของคุณ
            </span>
          </h2>
          <p class="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-lg font-medium">
            ตั้งแต่การวางแผนโปรเจกต์ส่วนตัวไปจนถึงการทำงานร่วมกันทั้งทีม FlowSpace ช่วยให้ทุกการ์ดงานชัดเจน มีผู้รับผิดชอบ และตรวจสอบประวัติย้อนหลังได้ครบถ้วน
          </p>
        </div>

        <!-- 3-Step Visual Onboarding Bento Cards -->
        <div class="relative z-10 my-5 sm:my-6 space-y-3">
          <div class="rounded-2xl bg-white/8 backdrop-blur-md border border-white/12 p-3.5 sm:p-4 flex items-center gap-3.5 sm:gap-4">
            <div class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300 flex items-center justify-center font-black text-sm shrink-0">01</div>
            <div>
              <h3 class="text-xs sm:text-sm font-extrabold text-white">สร้างบัญชีและยืนยันตัวตนอัตโนมัติ</h3>
              <p class="text-xs text-slate-300 mt-0.5">กดลิงก์ยืนยันจากอีเมล แล้วระบบจะพากลับเข้าสู่แดชบอร์ดทันทีโดยไม่ต้องล็อกอินซ้ำ</p>
            </div>
          </div>

          <div class="rounded-2xl bg-white/8 backdrop-blur-md border border-white/12 p-3.5 sm:p-4 flex items-center gap-3.5 sm:gap-4">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center font-black text-sm shrink-0">02</div>
            <div>
              <h3 class="text-xs sm:text-sm font-extrabold text-white">สร้างบอร์ดใหม่ หรือใช้รหัสเชิญ 6 หลัก</h3>
              <p class="text-xs text-slate-300 mt-0.5">เป็นเจ้าของโปรเจกต์เอง หรือนำรหัสเชิญจากหัวหน้าทีมมากรอกเพื่อเข้าบอร์ดได้ทันที</p>
            </div>
          </div>

          <div class="rounded-2xl bg-white/8 backdrop-blur-md border border-white/12 p-3.5 sm:p-4 flex items-center gap-3.5 sm:gap-4">
            <div class="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 text-sky-300 flex items-center justify-center font-black text-sm shrink-0">03</div>
            <div>
              <h3 class="text-xs sm:text-sm font-extrabold text-white">ลากวางการ์ดงาน แนบไฟล์ และพูดคุยแบบเรียลไทม์</h3>
              <p class="text-xs text-slate-300 mt-0.5">รองรับป้ายกำกับสี งานย่อย เช็กลิสต์ คอมเมนต์ และแจ้งเตือนทันทีที่มีการเคลื่อนไหว</p>
            </div>
          </div>
        </div>

        <div class="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-white/10 text-xs text-slate-400">
          <span>🔒 ป้องกันข้อมูลด้วย JWT HttpOnly & RBAC</span>
          <span class="text-amber-300 font-bold">FlowSpace v2.0</span>
        </div>
      </aside>

      <!-- Right Column on Desktop / Top Registration Card on Mobile & Tablet -->
      <main class="order-1 lg:order-2 lg:col-span-5 bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-amber-200/80 dark:border-slate-700/80 p-6 sm:p-8 lg:p-9 rounded-3xl w-full max-w-md mx-auto lg:max-w-none shadow-2xl shadow-amber-950/5 dark:shadow-black/40 relative overflow-hidden flex flex-col justify-center">
        <!-- Top Accent Line -->
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500" aria-hidden="true"></div>

        <div v-if="!isSuccess || verifyLink" class="mb-6">
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100/80 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 text-[11px] font-extrabold mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
            </svg>
            <span>Create Free Account</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
            สมัครสมาชิก
          </h1>
          <p class="text-stone-500 dark:text-slate-400 text-xs sm:text-sm mt-1.5 font-medium leading-relaxed">
            สร้างบัญชีใหม่เพื่อเริ่มต้นบริหารจัดการเวิร์กสเปซและทีมของคุณ
          </p>
        </div>

        <!-- สถานะส่งอีเมลสำเร็จ (Real-time Verification Waiting State) -->
        <div v-if="isSuccess && !verifyLink" class="text-center py-2 space-y-4" role="status" aria-live="polite">
          <div class="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner relative">
            <svg v-if="isVerifiedComplete" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8 text-emerald-600" aria-hidden="true">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8" aria-hidden="true">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <span v-if="!isVerifiedComplete" class="absolute -top-1 -right-1 flex h-4 w-4" aria-hidden="true">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
            </span>
          </div>

          <div v-if="isVerifiedComplete" class="space-y-3 py-2">
            <div class="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold shadow-xs">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>ยืนยันอีเมลสำเร็จเรียบร้อยแล้ว!</span>
            </div>
            <h2 class="text-xl font-black text-stone-800">กำลังนำคุณเข้าสู่แดชบอร์ด...</h2>
            <div class="animate-spin rounded-full h-6 w-6 border-2 border-amber-600 border-t-transparent mx-auto mt-3" aria-hidden="true"></div>
          </div>

          <div v-else class="space-y-3.5">
            <h2 class="text-xl font-black text-stone-800">ส่งอีเมลยืนยันตัวตนแล้ว</h2>
            <p class="text-xs sm:text-sm text-stone-600 font-medium leading-relaxed">
              ระบบได้ส่งลิงก์เปิดใช้งานบัญชีไปยัง <span class="font-bold text-amber-900 break-all">{{ email }}</span> เรียบร้อยแล้ว (ลิงก์มีอายุ 15 นาที)
            </p>

            <!-- Real-time Polling Status -->
            <div class="p-3 bg-amber-50/90 border border-amber-200/90 rounded-xl text-xs text-amber-900 font-semibold flex items-center justify-center gap-2">
              <span class="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" aria-hidden="true"></span>
              <span>เมื่อกดยืนยันในอีเมลแล้ว หน้านี้จะพาเข้าสู่แดชบอร์ดอัตโนมัติ</span>
            </div>

            <div class="p-3.5 bg-stone-50 border border-stone-200/80 rounded-xl text-xs text-stone-600 font-medium text-left space-y-1.5">
              <p class="font-bold text-stone-800 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
                </svg>
                <span>คำแนะนำการตรวจสอบอีเมล</span>
              </p>
              <p>• เปิดกล่องจดหมายอีเมลของคุณและคลิกปุ่ม <b>"ยืนยันอีเมลของคุณ"</b></p>
              <p>• หากยังไม่ได้รับภายใน 1 นาที สามารถกดส่งลิงก์ซ้ำด้านล่างได้ทันที</p>
            </div>

            <!-- Humane Resend Action directly in waiting state -->
            <div class="pt-1 space-y-2">
              <button
                type="button"
                @click="handleResendVerification"
                :disabled="isResending"
                class="w-full min-h-[44px] bg-white hover:bg-stone-50 text-amber-900 font-bold py-2 px-4 rounded-xl border border-amber-300 transition-all text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4" aria-hidden="true">
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 16h5v5" />
                </svg>
                <span>{{ isResending ? 'กำลังส่งอีเมลซ้ำ...' : 'ส่งลิงก์ยืนยันใหม่อีกครั้ง' }}</span>
              </button>
              <p v-if="resendFeedback" class="text-xs font-bold text-emerald-700">{{ resendFeedback }}</p>
            </div>

            <div class="pt-2 border-t border-stone-200/60">
              <NuxtLink to="/login" class="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-amber-800 font-bold py-1">
                <span>← กลับไปหน้าเข้าสู่ระบบ</span>
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Registration Form -->
        <form v-else @submit.prevent="handleRegister" class="space-y-4" novalidate>
          <!-- Username Field -->
          <div>
            <label for="register-username" class="block text-xs sm:text-sm font-bold text-stone-700 dark:text-slate-200 mb-1.5">
              ชื่อผู้ใช้งาน <span class="text-stone-400 font-medium">(Username)</span>
            </label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input 
                id="register-username"
                v-model="username" 
                type="text" 
                autocomplete="username"
                placeholder="เช่น geaw_dev" 
                required 
                class="w-full bg-stone-50/70 dark:bg-slate-950 border border-stone-200 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 min-h-[46px] text-base sm:text-sm text-stone-800 dark:text-slate-100 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-2xs" 
              />
            </div>
          </div>

          <!-- Email Field -->
          <div>
            <label for="register-email" class="block text-xs sm:text-sm font-bold text-stone-700 dark:text-slate-200 mb-1.5">
              อีเมล <span class="text-stone-400 font-medium">(Email)</span>
            </label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </span>
              <input 
                id="register-email"
                v-model="email" 
                type="email" 
                autocomplete="email"
                placeholder="name@example.com" 
                required 
                class="w-full bg-stone-50/70 dark:bg-slate-950 border border-stone-200 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 min-h-[46px] text-base sm:text-sm text-stone-800 dark:text-slate-100 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-2xs" 
              />
            </div>
          </div>

          <!-- Password Field -->
          <div>
            <label for="register-password" class="block text-xs sm:text-sm font-bold text-stone-700 dark:text-slate-200 mb-1.5">
              รหัสผ่าน <span class="text-stone-400 font-medium">(Password)</span>
            </label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input 
                id="register-password"
                v-model="password" 
                :type="isPasswordVisible ? 'text' : 'password'" 
                autocomplete="new-password"
                placeholder="อย่างน้อย 6 ตัวอักษร" 
                required 
                minlength="6"
                aria-describedby="register-password-hint"
                class="w-full bg-stone-50/70 dark:bg-slate-950 border border-stone-200 dark:border-slate-700 rounded-xl pl-10 pr-12 py-2.5 min-h-[46px] text-base sm:text-sm text-stone-800 dark:text-slate-100 placeholder-stone-400 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-2xs" 
              />
              <button 
                type="button" 
                @click="isPasswordVisible = !isPasswordVisible" 
                :aria-label="isPasswordVisible ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'"
                :aria-pressed="isPasswordVisible"
                class="absolute right-0 top-0 bottom-0 w-11 min-h-[44px] flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors focus:outline-none focus:text-amber-700 cursor-pointer"
                title="แสดง/ซ่อนรหัสผ่าน"
              >
                <svg v-if="isPasswordVisible" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              </button>
            </div>
            <p id="register-password-hint" class="text-[11px] text-stone-400 font-medium mt-1">
              รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร
            </p>
          </div>

          <!-- Feedback Alert -->
          <div 
            v-if="message" 
            role="alert" 
            aria-live="polite"
            :class="isSuccess ? 'text-emerald-800 bg-emerald-50/90 border-emerald-200' : 'text-rose-800 bg-rose-50/90 border-rose-200'" 
            class="border px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 transition-all"
          >
            <svg v-if="isSuccess" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
            <span class="flex-1">{{ message }}</span>
          </div>

          <!-- Primary Submit CTA -->
          <button 
            type="submit" 
            :disabled="isLoading" 
            class="w-full min-h-[46px] bg-gradient-to-r from-amber-500 via-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-stone-300 disabled:to-stone-400 disabled:cursor-not-allowed text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-amber-500/25 mt-2 active:scale-[0.99] flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            <span v-if="isLoading" class="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" aria-hidden="true"></span>
            <span>{{ isLoading ? 'กำลังสร้างบัญชี...' : 'สมัครสมาชิก' }}</span>
            <svg v-if="!isLoading" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4" aria-hidden="true">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        </form>

        <!-- Local Dev Quick Verify Fallback (when SMTP is not configured) -->
        <div v-if="verifyLink" class="mt-4 p-4 bg-amber-50/90 border border-amber-200 rounded-xl text-center text-xs font-bold text-stone-700 space-y-2.5">
          <p class="flex items-center justify-center gap-1.5 text-amber-900">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4" aria-hidden="true">
              <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
            </svg>
            <span>(โหมดพัฒนาในเครื่อง) ยืนยันอีเมลได้ทันที:</span>
          </p>
          <a 
            :href="verifyLink" 
            class="min-h-[44px] w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black px-4 py-2.5 rounded-xl inline-flex items-center justify-center gap-1.5 shadow-xs transition-all"
          >
            <span>คลิกเพื่อยืนยันอีเมล</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4" aria-hidden="true">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </a>
        </div>

        <div v-if="!isSuccess || verifyLink" class="mt-6 pt-5 border-t border-stone-200/80 dark:border-slate-800 text-center">
          <p class="text-xs sm:text-sm text-stone-500 dark:text-slate-400 font-medium">
            มีบัญชีอยู่แล้วใช่ไหม?
            <NuxtLink 
              to="/login" 
              class="text-amber-700 dark:text-amber-400 hover:text-amber-900 font-bold hover:underline transition-colors ml-1 inline-flex items-center py-1 px-1 rounded focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            >
              เข้าสู่ระบบที่นี่
            </NuxtLink>
          </p>
        </div>
      </main>
    </div>

    <footer class="w-full max-w-6xl mx-auto text-center text-[11px] text-stone-400 dark:text-slate-500 font-medium mt-6 relative z-10">
      FlowSpace Modern Workflow Platform — ออกแบบตามมาตรฐาน UI/UX & Accessibility
    </footer>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'

definePageMeta({
  middleware: 'auth'
})

const username = ref('')
const email = ref('')
const password = ref('')
const isPasswordVisible = ref(false)
const message = ref('')
const isSuccess = ref(false)
const isLoading = ref(false)
const verifyLink = ref('')
const pollToken = ref('')
const isVerifiedComplete = ref(false)
const isResending = ref(false)
const resendFeedback = ref('')
let pollTimer = null

let pollCount = 0
const MAX_POLLS = 150 // 150 ครั้ง x 2 วินาที = 5 นาที

const startPolling = () => {
  if (pollTimer) clearInterval(pollTimer)
  pollCount = 0
  pollTimer = setInterval(async () => {
    if (!pollToken.value || isVerifiedComplete.value) return
    pollCount++

    if (pollCount > MAX_POLLS) {
      if (pollTimer) clearInterval(pollTimer)
      pollTimer = null
      return
    }

    try {
      const res = await $fetch('/api/auth/check-verified', {
        method: 'GET',
        params: { token: pollToken.value }
      })
      if (res && res.verified && res.user) {
        if (pollTimer) clearInterval(pollTimer)
        pollTimer = null
        isVerifiedComplete.value = true
        localStorage.setItem('user', JSON.stringify(res.user))
        setTimeout(() => {
          navigateTo('/dashboard')
        }, 1000)
      }
    } catch (e) {
      if (e.statusCode === 400 || e.statusCode === 404) {
        if (pollTimer) clearInterval(pollTimer)
        pollTimer = null
      }
    }
  }, 2000)
}

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})

const handleResendVerification = async () => {
  if (!email.value.trim() || isResending.value) return
  isResending.value = true
  resendFeedback.value = ''
  try {
    const res = await $fetch('/api/auth/resend-verification', {
      method: 'POST',
      body: { email: email.value.trim() }
    })
    resendFeedback.value = res?.message || 'ส่งลิงก์ยืนยันใหม่เรียบร้อยแล้ว'
  } catch (err) {
    resendFeedback.value = err?.data?.message || 'ส่งลิงก์ไม่สำเร็จ กรุณาลองใหม่'
  } finally {
    isResending.value = false
  }
}

const handleRegister = async () => {
  if (!username.value.trim() || !email.value.trim() || !password.value) {
    isSuccess.value = false
    message.value = 'กรุณากรอกข้อมูลให้ครบทุกช่อง'
    return
  }
  isLoading.value = true
  message.value = ''
  verifyLink.value = ''
  resendFeedback.value = ''
  try {
    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: { username: username.value.trim(), email: email.value.trim(), password: password.value }
    })
    isSuccess.value = true
    message.value = response.message
    if (response.verifyUrl) {
      verifyLink.value = response.verifyUrl
    }
    if (response.checkToken) {
      pollToken.value = response.checkToken
      startPolling()
    }
  } catch (error) {
    isSuccess.value = false
    message.value = error.data?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก'
  } finally {
    isLoading.value = false
  }
}
</script>