<!-- app/pages/login.vue -->
<template>
  <div class="min-h-screen min-h-[100dvh] bg-gradient-to-br from-[#fcf8f2] via-[#f7f0e4] to-[#f3e9d7] dark:from-[#070b14] dark:via-[#0b1120] dark:to-[#0f172a] flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-x-hidden bg-grid text-stone-800 dark:text-slate-100 transition-colors duration-300">
    
    <!-- Ambient Aurora Mesh Glow (ui-ux-pro-max Style #10 Aurora UI) -->
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
      
      <!-- Left Column on Desktop / Bottom Showcase on Mobile & Tablet -->
      <aside class="order-2 lg:order-1 flex lg:col-span-7 rounded-3xl bg-gradient-to-br from-slate-900 via-[#111827] to-[#1e1b4b] text-white p-5 sm:p-8 xl:p-10 flex-col justify-between relative overflow-hidden shadow-2xl border border-slate-800/90 max-w-md lg:max-w-none mx-auto w-full">
        <!-- Decorative Mesh & Grid inside Showcase -->
        <div class="hidden sm:block absolute -top-24 -right-24 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" aria-hidden="true"></div>
        <div class="hidden sm:block absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" aria-hidden="true"></div>

        <div class="relative z-10">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-amber-300 text-[11px] sm:text-xs font-bold mb-4 sm:mb-6">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <span class="truncate">Real-Time Kanban & Role-Based Access Control</span>
          </div>

          <h2 class="text-2xl sm:text-3xl xl:text-4xl font-black tracking-tight leading-tight text-white mb-2.5 sm:mb-3">
            บริหารจัดการเวิร์กโฟลว์ <br />
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400">
              ยืดหยุ่น รวดเร็ว และชัดเจน
            </span>
          </h2>
          <p class="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-lg font-medium">
            ออกแบบคอลัมน์ได้อิสระ กำหนดสิทธิ์สมาชิกตามยศ (RBAC) ติดตามงานย่อยพร้อมไฟล์แนบ และซิงก์สถานะการ์ดแบบเรียลไทม์ไม่ต้องกดรีเฟรช
          </p>
        </div>

        <!-- Live Mini Kanban Board Visual Mockup (1 col on mobile, 2 cols on sm+) -->
        <div class="relative z-10 my-5 sm:my-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <!-- Mock Column 1 -->
          <div class="rounded-2xl bg-white/8 backdrop-blur-md border border-white/12 p-3.5 space-y-2.5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-amber-400"></span>
                <span class="text-xs font-extrabold text-slate-200">กำลังดำเนินการ (Doing)</span>
              </div>
              <span class="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 tabular-nums">2</span>
            </div>

            <!-- Mock Task Card 1 -->
            <div class="rounded-xl bg-slate-900/90 border border-white/10 p-3 shadow-lg space-y-2">
              <div class="flex items-center justify-between gap-1">
                <span class="text-[9px] font-black px-2 py-0.5 rounded bg-indigo-500/80 text-white">UI / UX</span>
                <span class="text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">URGENT</span>
              </div>
              <p class="text-xs font-bold text-white leading-snug">อัปเกรดระบบ Dark Mode & Bento Grid</p>
              <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div class="bg-gradient-to-r from-emerald-400 to-teal-400 h-full w-3/4 rounded-full"></div>
              </div>
              <div class="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span class="tabular-nums font-bold text-emerald-400">✓ 3/4 งานย่อย</span>
                <span class="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-[9px]">FS</span>
              </div>
            </div>
          </div>

          <!-- Mock Column 2 -->
          <div class="rounded-2xl bg-white/8 backdrop-blur-md border border-white/12 p-3.5 space-y-2.5 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-2.5">
                <div class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span class="text-xs font-extrabold text-slate-200">ระบบยศและสิทธิ์ (RBAC)</span>
                </div>
                <span class="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300">Active</span>
              </div>
              <div class="rounded-xl bg-slate-900/90 border border-white/10 p-3 space-y-2">
                <div class="flex items-center justify-between text-[11px]">
                  <span class="text-slate-300 font-bold">Owner / Admin</span>
                  <span class="text-amber-400 font-extrabold">Full Access</span>
                </div>
                <div class="flex items-center justify-between text-[11px]">
                  <span class="text-slate-300 font-bold">Project Editor</span>
                  <span class="text-emerald-400 font-extrabold">Move & Edit</span>
                </div>
                <div class="flex items-center justify-between text-[11px]">
                  <span class="text-slate-300 font-bold">Viewer</span>
                  <span class="text-sky-400 font-extrabold">Comment Only</span>
                </div>
              </div>
            </div>

            <div class="rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/15 border border-amber-400/30 p-2.5 flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
                </svg>
              </div>
              <div class="min-w-0">
                <p class="text-[11px] font-extrabold text-amber-200">เข้าร่วมทีมด้วยรหัสเชิญ 6 หลัก</p>
                <p class="text-[10px] text-slate-300 truncate">เปิด-ปิดรับสมาชิกหรือสุ่มรหัสใหม่ได้ทันที</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom 3 Feature Pills (1 col on mobile, 3 cols on sm+) -->
        <div class="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-4 border-t border-white/10 text-xs">
          <div class="flex items-center gap-2 text-slate-300 font-semibold">
            <span class="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-amber-400 font-black shrink-0">1</span>
            <span>คอลัมน์ยืดหยุ่น</span>
          </div>
          <div class="flex items-center gap-2 text-slate-300 font-semibold">
            <span class="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-emerald-400 font-black shrink-0">2</span>
            <span>แนบไฟล์สูงสุด 30MB</span>
          </div>
          <div class="flex items-center gap-2 text-slate-300 font-semibold">
            <span class="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-sky-400 font-black shrink-0">3</span>
            <span>อัปเดตเรียลไทม์ (SSE)</span>
          </div>
        </div>
      </aside>

      <!-- Right Column on Desktop / Top Auth Card on Mobile & Tablet -->
      <main class="order-1 lg:order-2 lg:col-span-5 bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-amber-200/80 dark:border-slate-700/80 p-6 sm:p-8 lg:p-9 rounded-3xl w-full max-w-md mx-auto lg:max-w-none shadow-2xl shadow-amber-950/5 dark:shadow-black/40 relative overflow-hidden flex flex-col justify-center">
        <!-- Top Accent Line -->
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500" aria-hidden="true"></div>

        <div class="mb-6">
          <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100/80 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 text-[11px] font-extrabold mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            <span>Secure Workspace Sign-In</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
            เข้าสู่ระบบ
          </h1>
          <p class="text-stone-500 dark:text-slate-400 text-xs sm:text-sm mt-1.5 font-medium leading-relaxed">
            ยินดีต้อนรับกลับมา! เข้าสู่เวิร์กสเปซเพื่อจัดการงานต่อได้ทันที
          </p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4" novalidate>
          <!-- Email Field -->
          <div>
            <label for="login-email" class="block text-xs sm:text-sm font-bold text-stone-700 dark:text-slate-200 mb-1.5">
              อีเมล <span class="text-stone-400 dark:text-slate-400 font-medium">(Email)</span>
            </label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </span>
              <input 
                id="login-email"
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
            <div class="flex items-center justify-between mb-1.5">
              <label for="login-password" class="block text-xs sm:text-sm font-bold text-stone-700 dark:text-slate-200">
                รหัสผ่าน <span class="text-stone-400 dark:text-slate-400 font-medium">(Password)</span>
              </label>
              <NuxtLink 
                to="/forgot-password" 
                class="text-xs text-amber-700 dark:text-amber-400 hover:text-amber-900 font-bold hover:underline transition-colors py-1 px-1 -mr-1 rounded focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              >
                ลืมรหัสผ่าน?
              </NuxtLink>
            </div>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input 
                id="login-password"
                v-model="password" 
                :type="isPasswordVisible ? 'text' : 'password'" 
                autocomplete="current-password"
                placeholder="••••••••" 
                required 
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
          </div>

          <!-- Feedback Alert & Humane Recovery (Rule 8) -->
          <div v-if="message" role="alert" aria-live="polite" class="space-y-2.5 pt-1">
            <div 
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

            <!-- 1-Click Resend Verification Recovery -->
            <div v-if="isUnverifiedError" class="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 text-center">
              <button 
                type="button" 
                @click="handleResendFromLogin" 
                :disabled="isResending" 
                class="min-h-[38px] inline-flex items-center justify-center gap-1.5 text-xs text-amber-800 hover:text-amber-950 font-bold underline transition-colors cursor-pointer disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5" aria-hidden="true">
                  <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
                </svg>
                <span>{{ isResending ? 'กำลังส่งลิงก์ยืนยันใหม่...' : 'ส่งลิงก์ยืนยันอีเมลใหม่อีกครั้ง' }}</span>
              </button>
              <p v-if="resendSuccessMsg" class="text-xs text-emerald-700 font-bold mt-1">{{ resendSuccessMsg }}</p>
            </div>
          </div>

          <!-- Primary Action Button -->
          <button 
            type="submit" 
            :disabled="isLoading" 
            class="w-full min-h-[46px] bg-gradient-to-r from-amber-500 via-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-stone-300 disabled:to-stone-400 disabled:cursor-not-allowed text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-amber-500/25 mt-2 active:scale-[0.99] flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            <span v-if="isLoading" class="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" aria-hidden="true"></span>
            <span>{{ isLoading ? 'กำลังตรวจสอบสิทธิ์...' : 'เข้าสู่ระบบ' }}</span>
            <svg v-if="!isLoading" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4" aria-hidden="true">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        </form>

        <div class="mt-6 pt-5 border-t border-stone-200/80 dark:border-slate-800 text-center">
          <p class="text-xs sm:text-sm text-stone-500 dark:text-slate-400 font-medium">
            ยังไม่มีบัญชีสมาชิก?
            <NuxtLink 
              to="/register" 
              class="text-amber-700 dark:text-amber-400 hover:text-amber-900 font-bold hover:underline transition-colors ml-1 inline-flex items-center py-1 px-1 rounded focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            >
              สมัครสมาชิกที่นี่
            </NuxtLink>
          </p>
        </div>
      </main>
    </div>

    <!-- Subtle Footer -->
    <footer class="w-full max-w-6xl mx-auto text-center text-[11px] text-stone-400 dark:text-slate-500 font-medium mt-6 relative z-10">
      FlowSpace Modern Workflow Platform — ออกแบบตามมาตรฐาน UI/UX & Accessibility
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

definePageMeta({
  middleware: 'auth'
})

const email = ref('')
const password = ref('')
const isPasswordVisible = ref(false)
const message = ref('')
const isSuccess = ref(false)
const isLoading = ref(false)
const isResending = ref(false)
const resendSuccessMsg = ref('')

const isUnverifiedError = computed(() => message.value && message.value.includes('ยืนยันอีเมล'))

const handleResendFromLogin = async () => {
  if (!email.value) return
  isResending.value = true
  resendSuccessMsg.value = ''
  try {
    const res = await $fetch('/api/auth/resend-verification', {
      method: 'POST',
      body: { email: email.value }
    })
    resendSuccessMsg.value = res.message || 'ส่งลิงก์ยืนยันใหม่เรียบร้อยแล้ว'
  } catch (err) {
    resendSuccessMsg.value = err.data?.message || 'ส่งลิงก์ไม่สำเร็จ กรุณาลองใหม่'
  } finally {
    isResending.value = false
  }
}

const handleLogin = async () => {
  if (!email.value.trim() || !password.value) {
    isSuccess.value = false
    message.value = 'กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน'
    return
  }
  isLoading.value = true
  message.value = ''
  resendSuccessMsg.value = ''
  try {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email: email.value.trim(), password: password.value }
    })
    isSuccess.value = true
    message.value = response.message
    localStorage.setItem('user', JSON.stringify(response.user))
    setTimeout(() => { navigateTo('/') }, 800)
  } catch (error) {
    isSuccess.value = false
    message.value = error.data?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
  } finally {
    isLoading.value = false
  }
}
</script>