<template>
  <div class="min-h-screen bg-gradient-to-tr from-[#fdfaf5] via-[#f7f0e3] to-[#ebdcc5] flex items-center justify-center p-4">
    <!-- Premium Glassmorphic Card -->
    <div class="bg-white/80 backdrop-blur-md border border-amber-200/60 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden">
      <!-- Decorative top accent bar -->
      <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-orange-500"></div>

      <!-- SUCCESS STATE -->
      <div v-if="status === 'success'" class="space-y-6">
        <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-8 h-8 animate-bounce">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
          </svg>
        </div>
        <h1 class="text-2xl font-black text-stone-800">🎉 ยืนยันอีเมลสำเร็จ!</h1>
        <p class="text-sm text-stone-600 font-medium">บัญชี FlowSpace ของคุณได้รับการเปิดใช้งานเรียบร้อยแล้ว ยินดีต้อนรับเข้าสู่เวิร์กสเปซบริหารจัดการงานสุดพรีเมียม!</p>
      </div>

      <!-- ERROR STATE -->
      <div v-else class="space-y-6">
        <div class="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-8 h-8 animate-pulse">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h1 class="text-2xl font-black text-stone-800">❌ ยืนยันอีเมลล้มเหลว</h1>
        <p class="text-sm text-stone-600 font-medium leading-relaxed">{{ errorMessage }}</p>
      </div>

      <!-- Redirect Countdown & Button -->
      <div class="mt-8 pt-6 border-t border-amber-100 flex flex-col items-center gap-4">
        <p class="text-xs text-stone-400 font-bold">ระบบจะนำคุณไปยังหน้าเข้าสู่ระบบอัตโนมัติใน {{ countdown }} วินาที...</p>
        <button @click="goToLogin" class="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black py-2.5 rounded-xl shadow-md transition-all text-sm">
          เข้าสู่ระบบเดี๋ยวนี้ 🔑
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const route = useRoute()
const status = computed(() => route.query.status)
const message = computed(() => route.query.message)

const errorMessage = computed(() => {
  switch (message.value) {
    case 'token_missing':
      return 'ไม่พบโทเคนสำหรับยืนยันตัวตน กรุณาตรวจสอบลิงก์อีกครั้ง'
    case 'invalid_payload':
      return 'ข้อมูลภายในโทเคนไม่ถูกต้อง ไม่สามารถระบุตัวตนของคุณได้'
    case 'user_not_found':
      return 'ไม่พบบัญชีผู้ใช้งานนี้ในระบบการลงทะเบียน'
    case 'expired':
      return 'ลิงก์ยืนยันตัวตนนี้หมดอายุแล้ว (มีอายุใช้งาน 15 นาที) กรุณาสมัครใหม่อีกครั้ง'
    case 'invalid':
    default:
      return 'ลิงก์ยืนยันตัวตนไม่ถูกต้องหรือถูกดัดแปลงข้อมูล'
  }
})

const countdown = ref(5)
let timer = null

const goToLogin = () => {
  if (timer) clearInterval(timer)
  navigateTo('/login')
}

onMounted(() => {
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      goToLogin()
    }
  }, 1000)
})
</script>
