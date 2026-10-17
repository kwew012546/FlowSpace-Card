<!-- app/pages/verify-email.vue -->
<template>
  <div class="min-h-screen min-h-[100dvh] bg-gradient-to-br from-[#fcf8f2] via-[#f7f0e4] to-[#f3e9d7] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-x-hidden bg-grid text-stone-800">
    
    <!-- Ambient Lighting (Reduced GPU load on mobile, rich glow on desktop) -->
    <div class="hidden sm:block absolute top-[-10%] left-[-10%] w-[420px] h-[420px] bg-amber-200/35 rounded-full blur-3xl pointer-events-none" aria-hidden="true"></div>
    <div class="hidden sm:block absolute bottom-[-10%] right-[-10%] w-[420px] h-[420px] bg-orange-200/25 rounded-full blur-3xl pointer-events-none" aria-hidden="true"></div>

    <!-- Brand Identity Header -->
    <div class="mb-6 text-center relative z-10">
      <div class="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-[#fdfaf5]/90 border border-amber-200/80 shadow-sm mb-3">
        <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-sm shadow-amber-600/20">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4" aria-hidden="true">
            <rect width="7" height="9" x="3" y="3" rx="1" />
            <rect width="7" height="5" x="14" y="3" rx="1" />
            <rect width="7" height="9" x="14" y="12" rx="1" />
            <rect width="7" height="5" x="3" y="16" rx="1" />
          </svg>
        </div>
        <span class="text-base font-black tracking-tight text-stone-800">FlowSpace</span>
      </div>
    </div>

    <!-- Card -->
    <main class="bg-[#fdfaf5] border border-amber-200/80 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-xl shadow-amber-950/5 text-center relative z-10 overflow-hidden">
      <!-- Top Accent Line -->
      <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500" aria-hidden="true"></div>

      <!-- SUCCESS STATE -->
      <div v-if="status === 'success'" class="space-y-5" role="status" aria-live="polite">
        <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-8 h-8" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
          </svg>
        </div>
        <h1 class="text-xl sm:text-2xl font-extrabold text-stone-800 tracking-tight">ยืนยันอีเมลสำเร็จ!</h1>
        <p class="text-xs sm:text-sm text-stone-600 font-medium leading-relaxed">
          บัญชี FlowSpace ของคุณได้รับการเปิดใช้งานเรียบร้อยแล้ว ยินดีต้อนรับเข้าสู่เวิร์กสเปซบริหารจัดการงานของคุณ
        </p>
      </div>

      <!-- ERROR STATE -->
      <div v-else class="space-y-4" role="alert">
        <div class="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.2" stroke="currentColor" class="w-8 h-8" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h1 class="text-xl sm:text-2xl font-extrabold text-stone-800 tracking-tight">ยืนยันอีเมลไม่สำเร็จ</h1>
        <p class="text-xs sm:text-sm text-stone-600 font-medium leading-relaxed">{{ errorMessage }}</p>

        <!-- ฟอร์ม / ปุ่มขอรับลิงก์ยืนยันตัวตนใหม่ทันที (Rule 8: Humane Recovery) -->
        <div class="pt-2">
          <div v-if="resendSuccess" class="p-3.5 bg-emerald-50/90 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{{ resendSuccess }}</span>
          </div>
          <div v-else class="space-y-2.5 text-left">
            <div v-if="!targetEmail">
              <label for="verify-resend-email" class="block text-xs font-bold text-stone-700 mb-1">
                อีเมลของคุณ
              </label>
              <input 
                id="verify-resend-email"
                v-model="inputEmail" 
                type="email" 
                autocomplete="email"
                placeholder="กรอกอีเมลของคุณเพื่อขอรับลิงก์ใหม่..."
                class="w-full min-h-[44px] bg-white border border-amber-200/90 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20" 
              />
            </div>
            <button 
              type="button"
              @click="handleResend" 
              :disabled="isResending" 
              class="w-full min-h-[44px] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-stone-300 disabled:to-stone-400 text-white font-bold py-2.5 px-4 rounded-xl shadow-md shadow-amber-600/20 text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span v-if="isResending" class="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" aria-hidden="true"></span>
              <span>{{ isResending ? 'กำลังส่งลิงก์ใหม่...' : 'ส่งลิงก์ยืนยันใหม่อีกครั้ง' }}</span>
            </button>
            <p v-if="resendError" class="text-xs text-rose-600 font-bold text-center">{{ resendError }}</p>
          </div>
        </div>
      </div>

      <!-- Action Button / Success Auto-redirect -->
      <div class="mt-6 pt-5 border-t border-amber-200/60 flex flex-col items-center gap-3">
        <p v-if="status === 'success'" class="text-xs text-stone-500 font-bold tabular-nums">
          ระบบจะนำคุณไปยังแดชบอร์ดหลักอัตโนมัติใน {{ countdown }} วินาที...
        </p>
        <button 
          v-if="status === 'success'"
          type="button"
          @click="goToDashboard" 
          class="w-full min-h-[44px] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black py-2.5 px-4 rounded-xl shadow-md shadow-amber-600/20 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>เข้าสู่แดชบอร์ดเดี๋ยวนี้</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4" aria-hidden="true">
            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
          </svg>
        </button>
        <NuxtLink 
          v-else
          to="/login" 
          class="w-full min-h-[44px] bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-2.5 px-4 rounded-xl transition-all border border-stone-200 text-sm flex items-center justify-center gap-1.5"
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
import { ref, onMounted, onUnmounted, computed } from 'vue'

const route = useRoute()
const status = computed(() => route.query.status)
const message = computed(() => route.query.message)
const targetEmail = computed(() => (route.query.email ? String(route.query.email) : ''))

const inputEmail = ref('')
const isResending = ref(false)
const resendSuccess = ref('')
const resendError = ref('')

const handleResend = async () => {
  const emailToSend = targetEmail.value || inputEmail.value.trim().toLowerCase()
  if (!emailToSend) {
    resendError.value = 'กรุณาระบุอีเมลของคุณ'
    return
  }
  isResending.value = true
  resendError.value = ''
  resendSuccess.value = ''
  try {
    const res = await $fetch('/api/auth/resend-verification', {
      method: 'POST',
      body: { email: emailToSend }
    })
    resendSuccess.value = res?.message || 'ส่งลิงก์ยืนยันใหม่เรียบร้อยแล้ว'
  } catch (err) {
    resendError.value = err.data?.message || 'ส่งลิงก์ไม่สำเร็จ กรุณาลองใหม่'
  } finally {
    isResending.value = false
  }
}

const errorMessage = computed(() => {
  switch (message.value) {
    case 'token_missing':
      return 'ไม่พบโทเคนสำหรับยืนยันตัวตน กรุณาตรวจสอบลิงก์อีกครั้ง'
    case 'invalid_payload':
      return 'ข้อมูลภายในโทเคนไม่ถูกต้อง ไม่สามารถระบุตัวตนของคุณได้'
    case 'user_not_found':
      return 'ไม่พบบัญชีผู้ใช้งานนี้ในระบบการลงทะเบียน'
    case 'expired':
      return 'ลิงก์ยืนยันตัวตนนี้หมดอายุแล้ว (มีอายุใช้งาน 15 นาที) คุณสามารถกดขอรับลิงก์ใหม่ได้ทันทีด้านล่างนี้:'
    case 'invalid':
    default:
      return 'ลิงก์ยืนยันตัวตนไม่ถูกต้องหรือถูกดัดแปลงข้อมูล'
  }
})

const countdown = ref(3)
let timer = null

const goToDashboard = () => {
  if (timer) clearInterval(timer)
  navigateTo('/dashboard')
}

onMounted(() => {
  if (status.value === 'success') {
    if (route.query.user) {
      try {
        const userObj = JSON.parse(decodeURIComponent(String(route.query.user)))
        localStorage.setItem('user', JSON.stringify(userObj))
      } catch (e) {}
    }
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        goToDashboard()
      }
    }, 1000)
  }
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
