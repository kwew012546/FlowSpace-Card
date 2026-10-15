<!-- app/pages/forgot-password.vue -->
<template>
  <div class="min-h-screen min-h-[100dvh] bg-gradient-to-br from-[#fcf8f2] via-[#f7f0e4] to-[#f3e9d7] flex items-center justify-center p-4 relative overflow-x-hidden bg-grid">
    
    <!-- Background ambient lighting -->
    <div class="absolute top-[-10%] left-[-10%] w-[320px] sm:w-[400px] h-[320px] sm:h-[400px] bg-amber-200/40 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[320px] sm:w-[400px] h-[320px] sm:h-[400px] bg-orange-200/30 rounded-full blur-3xl pointer-events-none"></div>

    <div class="bg-[#fdfaf5] border border-amber-200/80 p-6 sm:p-8 rounded-2xl w-full max-w-md shadow-xl shadow-amber-900/5 relative z-10">
      
      <div class="text-center mb-6">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 text-2xl mb-3 shadow-inner">
          🔑
        </div>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-stone-800">
          ลืมรหัสผ่าน?
        </h2>
        <p class="text-stone-500 text-xs sm:text-sm mt-1.5 font-medium max-w-xs mx-auto">
          กรอกอีเมลที่คุณใช้ลงทะเบียน เราจะส่งคำแนะนำและลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้คุณ
        </p>
      </div>

      <!-- ข้อความแจ้งผลลัพธ์ -->
      <div v-if="message" class="mb-5">
        <div 
          :class="isSuccess ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'"
          class="border rounded-xl p-3.5 text-xs sm:text-sm font-medium transition-all"
        >
          <div class="flex items-start gap-2.5">
            <span class="text-base shrink-0">{{ isSuccess ? '📬' : '⚠️' }}</span>
            <div class="flex-1">
              <p class="font-bold mb-0.5">{{ isSuccess ? 'ส่งคำขอสำเร็จ' : 'เกิดข้อผิดพลาด' }}</p>
              <p>{{ message }}</p>
              <!-- ลิงก์ทดสอบสำหรับ Local Development กรณีไม่มี SMTP -->
              <div v-if="devResetUrl" class="mt-3 pt-2.5 border-t border-emerald-200/60">
                <p class="text-[11px] text-stone-500 font-bold uppercase tracking-wider mb-1">💻 ลิงก์สำหรับทดสอบ (Local Dev):</p>
                <NuxtLink :to="devResetUrl" class="text-xs text-amber-700 hover:text-amber-900 font-bold underline break-all block">
                  คลิกที่นี่เพื่อตั้งรหัสผ่านใหม่ →
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form v-if="!isSuccess" @submit.prevent="handleForgotPassword" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-stone-600 mb-1">อีเมลของคุณ (Email)</label>
          <input 
            v-model="email" 
            type="email" 
            placeholder="name@example.com" 
            required 
            :disabled="isLoading"
            class="w-full bg-white border border-amber-200 rounded-xl px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200/60 transition-all shadow-sm" 
          />
        </div>

        <button 
          type="submit" 
          :disabled="isLoading || !email.trim()" 
          class="w-full min-h-[44px] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-stone-300 disabled:to-stone-400 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-amber-600/20 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <span v-if="isLoading" class="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
          {{ isLoading ? 'กำลังส่งข้อมูล...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน ✉️' }}
        </button>
      </form>

      <div class="mt-6 pt-5 border-t border-stone-200/60 text-center space-y-2">
        <NuxtLink 
          to="/login" 
          class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-stone-600 hover:text-amber-800 transition-colors py-1"
        >
          <span>←</span> กลับไปหน้าเข้าสู่ระบบ
        </NuxtLink>
      </div>

    </div>
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
