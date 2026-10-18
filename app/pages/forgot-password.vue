<!-- app/pages/forgot-password.vue -->
<template>
  <div class="min-h-screen min-h-[100dvh] bg-gradient-to-br from-[#fcf8f2] via-[#f7f0e4] to-[#f3e9d7] dark:from-[#070b14] dark:via-[#0b1120] dark:to-[#0f172a] flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-x-hidden bg-grid text-stone-800 dark:text-slate-100 transition-colors duration-300">
    
    <!-- Ambient Lighting -->
    <div class="hidden sm:block absolute top-[-10%] left-[-10%] w-[460px] h-[460px] bg-amber-400/20 dark:bg-amber-500/12 rounded-full blur-3xl pointer-events-none" aria-hidden="true"></div>
    <div class="hidden sm:block absolute bottom-[-10%] right-[-10%] w-[460px] h-[460px] bg-indigo-400/15 dark:bg-indigo-500/12 rounded-full blur-3xl pointer-events-none" aria-hidden="true"></div>

    <!-- Top Utility Header (Brand + Theme Toggle on every page) -->
    <header class="w-full max-w-5xl mx-auto flex items-center justify-between relative z-20 mb-4">
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
          <span class="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Account Recovery</span>
        </div>
      </NuxtLink>
      <ThemeToggle :showLabel="true" />
    </header>

    <!-- Auth Card -->
    <main class="my-auto mx-auto bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-amber-200/80 dark:border-slate-700/80 p-6 sm:p-8 rounded-3xl w-full max-w-md shadow-2xl shadow-amber-950/5 dark:shadow-black/40 relative z-10 overflow-hidden">
      <!-- Top Accent Line -->
      <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500" aria-hidden="true"></div>

      <div class="text-center mb-6">
        <div class="inline-flex items-center justify-center w-13 h-13 rounded-2xl bg-amber-100 text-amber-800 mb-3 shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6" aria-hidden="true">
            <circle cx="7.5" cy="15.5" r="5.5" />
            <path d="m21 2-9.6 9.6" />
            <path d="m15.5 7.5 3 3L22 7l-3-3" />
          </svg>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-stone-800 tracking-tight">
          ลืมรหัสผ่าน?
        </h1>
        <p class="text-stone-500 text-xs sm:text-sm mt-1.5 font-medium max-w-xs mx-auto leading-relaxed">
          กรอกอีเมลที่คุณใช้ลงทะเบียน เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้คุณทันที
        </p>
      </div>

      <!-- ข้อความแจ้งผลลัพธ์ -->
      <div v-if="message" role="alert" aria-live="polite" class="mb-5">
        <div 
          :class="isSuccess ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800' : 'bg-rose-50/90 border-rose-200 text-rose-800'"
          class="border rounded-xl p-4 text-xs sm:text-sm font-medium transition-all"
        >
          <div class="flex items-start gap-2.5">
            <svg v-if="isSuccess" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
            <div class="flex-1">
              <p class="font-bold mb-0.5">{{ isSuccess ? 'ส่งคำขอรีเซ็ตรหัสผ่านสำเร็จ' : 'เกิดข้อผิดพลาด' }}</p>
              <p class="leading-relaxed">{{ message }}</p>

              <!-- ลิงก์ทดสอบสำหรับ Local Development กรณีไม่มี SMTP -->
              <div v-if="devResetUrl" class="mt-3 pt-2.5 border-t border-emerald-200/60">
                <p class="text-[11px] text-stone-500 font-bold uppercase tracking-wider mb-1">ลิงก์สำหรับทดสอบ (Local Dev):</p>
                <NuxtLink :to="devResetUrl" class="text-xs text-amber-800 hover:text-amber-950 font-bold underline break-all inline-flex items-center gap-1">
                  <span>คลิกที่นี่เพื่อตั้งรหัสผ่านใหม่</span>
                  <span aria-hidden="true">→</span>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form v-if="!isSuccess" @submit.prevent="handleForgotPassword" class="space-y-4" novalidate>
        <div>
          <label for="forgot-email" class="block text-xs sm:text-sm font-bold text-stone-700 mb-1.5">
            อีเมลของคุณ <span class="text-stone-400 font-medium">(Email)</span>
          </label>
          <div class="relative">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </span>
            <input 
              id="forgot-email"
              v-model="email" 
              type="email" 
              autocomplete="email"
              placeholder="name@example.com" 
              required 
              :disabled="isLoading"
              class="w-full bg-white border border-amber-200/90 rounded-xl pl-10 pr-3.5 py-2.5 min-h-[44px] text-base sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-xs" 
            />
          </div>
        </div>

        <button 
          type="submit" 
          :disabled="isLoading || !email.trim()" 
          class="w-full min-h-[44px] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-stone-300 disabled:to-stone-400 disabled:cursor-not-allowed text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-amber-600/20 active:scale-[0.99] flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        >
          <span v-if="isLoading" class="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" aria-hidden="true"></span>
          <span>{{ isLoading ? 'กำลังส่งข้อมูล...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน' }}</span>
          <svg v-if="!isLoading" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4" aria-hidden="true">
            <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
          </svg>
        </button>
      </form>

      <!-- Humane Retry option if already sent -->
      <div v-else class="space-y-2.5">
        <button
          type="button"
          @click="isSuccess = false; message = ''"
          class="w-full min-h-[44px] bg-white hover:bg-stone-50 text-amber-900 font-bold py-2.5 px-4 rounded-xl border border-amber-300 transition-all text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>ส่งไปยังอีเมลอื่น หรือขอรับลิงก์อีกครั้ง</span>
        </button>
      </div>

      <div class="mt-6 pt-5 border-t border-amber-200/60 text-center">
        <NuxtLink 
          to="/login" 
          class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-stone-600 hover:text-amber-800 transition-colors py-1 px-2 rounded focus:outline-none focus:ring-2 focus:ring-amber-500/30"
        >
          <span aria-hidden="true">←</span>
          <span>กลับไปหน้าเข้าสู่ระบบ</span>
        </NuxtLink>
      </div>
    </main>
  </div>
</template>

<style scoped>
.bg-grid {
  background-image: radial-gradient(#bcaaa4 1px, transparent 1px);
  background-size: 24px 24px;
}
</style>

<script setup>
import { ref } from 'vue'

definePageMeta({
  middleware: 'auth'
})

const email = ref('')
const isLoading = ref(false)
const message = ref('')
const isSuccess = ref(false)
const devResetUrl = ref('')

const handleForgotPassword = async () => {
  if (!email.value.trim()) return
  isLoading.value = true
  message.value = ''
  isSuccess.value = false
  devResetUrl.value = ''

  try {
    const res = await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: email.value.trim() }
    })
    isSuccess.value = true
    message.value = res.message || 'หากอีเมลนี้มีอยู่ในระบบ เราได้ส่งคำแนะนำไปให้เรียบร้อยแล้ว'
    if (res.resetUrl) {
      devResetUrl.value = res.resetUrl
    }
  } catch (error) {
    isSuccess.value = false
    message.value = error.data?.message || 'เกิดข้อผิดพลาดในการส่งคำขอ กรุณาลองใหม่อีกครั้ง'
  } finally {
    isLoading.value = false
  }
}
</script>
