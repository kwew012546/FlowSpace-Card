<!-- app/pages/reset-password.vue -->
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

    <!-- Auth Card -->
    <main class="bg-[#fdfaf5] border border-amber-200/80 p-6 sm:p-8 rounded-2xl w-full max-w-md shadow-xl shadow-amber-950/5 relative z-10 overflow-hidden">
      <!-- Top Accent Line -->
      <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500" aria-hidden="true"></div>

      <!-- สถานะ: กำลังตรวจสอบลิงก์ -->
      <div v-if="pageState === 'verifying'" class="text-center py-8" role="status" aria-live="polite">
        <div class="inline-block animate-spin rounded-full h-10 w-10 border-4 border-amber-500 border-t-transparent mb-3" aria-hidden="true"></div>
        <p class="text-stone-700 font-bold text-sm">กำลังตรวจสอบความถูกต้องของลิงก์...</p>
        <p class="text-stone-400 text-xs mt-1">กรุณารอสักครู่</p>
      </div>

      <!-- สถานะ: ลิงก์ไม่ถูกต้องหรือหมดอายุ (Rule 8: Humane Recovery) -->
      <div v-else-if="pageState === 'invalid'" class="text-center py-3" role="alert">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 mb-3 shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="w-7 h-7" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <h1 class="text-xl sm:text-2xl font-extrabold text-stone-800 mb-2">
          ลิงก์หมดอายุหรือไม่ถูกต้อง
        </h1>
        <p class="text-stone-500 text-xs sm:text-sm font-medium mb-6 max-w-xs mx-auto leading-relaxed">
          {{ errorMessage || 'ลิงก์รีเซ็ตรหัสผ่านนี้หมดอายุการใช้งานแล้ว (อายุ 15 นาที) หรือถูกใช้งานไปก่อนหน้านี้แล้ว' }}
        </p>

        <div class="space-y-2.5">
          <NuxtLink 
            to="/forgot-password"
            class="w-full min-h-[44px] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <span>ขอลิงก์รีเซ็ตรหัสผ่านใหม่</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4" aria-hidden="true">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </NuxtLink>
          <NuxtLink 
            to="/login"
            class="w-full min-h-[44px] bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-2.5 px-4 rounded-xl transition-all border border-stone-200 flex items-center justify-center text-sm"
          >
            กลับไปหน้าเข้าสู่ระบบ
          </NuxtLink>
        </div>
      </div>

      <!-- สถานะ: เปลี่ยนรหัสผ่านสำเร็จเรียบร้อย (Rule 3: Closed-Loop UX) -->
      <div v-else-if="pageState === 'success'" class="text-center py-3" role="status" aria-live="polite">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 mb-3 shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="w-7 h-7" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h1 class="text-xl sm:text-2xl font-extrabold text-stone-800 mb-2">
          เปลี่ยนรหัสผ่านสำเร็จ!
        </h1>
        <p class="text-stone-500 text-xs sm:text-sm font-medium mb-6 max-w-xs mx-auto leading-relaxed">
          รหัสผ่านของคุณได้รับการอัปเดตเรียบร้อยแล้ว ระบบกำลังนำคุณไปที่หน้าเข้าสู่ระบบอัตโนมัติ...
        </p>

        <NuxtLink 
          to="/login"
          class="w-full min-h-[44px] bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <span>เข้าสู่ระบบทันที</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4" aria-hidden="true">
            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
          </svg>
        </NuxtLink>
      </div>

      <!-- สถานะ: พร้อมกรอกรหัสผ่านใหม่ (Ready Form) -->
      <div v-else>
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center w-13 h-13 rounded-2xl bg-amber-100 text-amber-800 mb-3 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-stone-800 tracking-tight">
            ตั้งรหัสผ่านใหม่
          </h1>
          <p class="text-stone-500 text-xs sm:text-sm mt-1.5 font-medium">
            สำหรับบัญชี: <span class="font-bold text-amber-900 break-all">{{ targetEmail }}</span>
          </p>
        </div>

        <form @submit.prevent="handleResetPassword" class="space-y-4" novalidate>
          <!-- ข้อความ Error ถ้ามี -->
          <div v-if="submitError" role="alert" aria-live="polite" class="bg-rose-50/90 border border-rose-200 text-rose-800 text-xs sm:text-sm rounded-xl p-3 font-semibold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
            <span>{{ submitError }}</span>
          </div>

          <div>
            <label for="reset-new-password" class="block text-xs sm:text-sm font-bold text-stone-700 mb-1.5">
              รหัสผ่านใหม่ <span class="text-stone-400 font-medium">(อย่างน้อย 6 ตัวอักษร)</span>
            </label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input 
                id="reset-new-password"
                v-model="newPassword" 
                :type="isNewPasswordVisible ? 'text' : 'password'" 
                autocomplete="new-password"
                placeholder="••••••••" 
                required 
                minlength="6"
                :disabled="isSubmitting"
                class="w-full bg-white border border-amber-200/90 rounded-xl pl-10 pr-12 py-2.5 min-h-[44px] text-base sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-xs" 
              />
              <button 
                type="button" 
                @click="isNewPasswordVisible = !isNewPasswordVisible" 
                :aria-label="isNewPasswordVisible ? 'ซ่อนรหัสผ่านใหม่' : 'แสดงรหัสผ่านใหม่'"
                :aria-pressed="isNewPasswordVisible"
                class="absolute right-0 top-0 bottom-0 w-11 min-h-[44px] flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors focus:outline-none focus:text-amber-700 cursor-pointer"
                title="แสดง/ซ่อนรหัสผ่าน"
              >
                <svg v-if="isNewPasswordVisible" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              </button>
            </div>
          </div>

          <div>
            <label for="reset-confirm-password" class="block text-xs sm:text-sm font-bold text-stone-700 mb-1.5">
              ยืนยันรหัสผ่านใหม่อีกครั้ง
            </label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input 
                id="reset-confirm-password"
                v-model="confirmPassword" 
                :type="isConfirmPasswordVisible ? 'text' : 'password'" 
                autocomplete="new-password"
                placeholder="••••••••" 
                required 
                minlength="6"
                :disabled="isSubmitting"
                class="w-full bg-white border border-amber-200/90 rounded-xl pl-10 pr-12 py-2.5 min-h-[44px] text-base sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-xs" 
              />
              <button 
                type="button" 
                @click="isConfirmPasswordVisible = !isConfirmPasswordVisible" 
                :aria-label="isConfirmPasswordVisible ? 'ซ่อนยืนยันรหัสผ่าน' : 'แสดงยืนยันรหัสผ่าน'"
                :aria-pressed="isConfirmPasswordVisible"
                class="absolute right-0 top-0 bottom-0 w-11 min-h-[44px] flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors focus:outline-none focus:text-amber-700 cursor-pointer"
                title="แสดง/ซ่อนรหัสผ่าน"
              >
                <svg v-if="isConfirmPasswordVisible" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              </button>
            </div>
            
            <p v-if="confirmPassword && newPassword !== confirmPassword" role="alert" class="text-xs text-rose-600 font-bold mt-1.5 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5 shrink-0" aria-hidden="true">
                <circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
              <span>รหัสผ่านทั้งสองช่องไม่ตรงกัน</span>
            </p>
            <p v-else-if="confirmPassword && isFormValid" class="text-xs text-emerald-700 font-bold mt-1.5 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5 shrink-0" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>รหัสผ่านตรงกันและพร้อมบันทึก</span>
            </p>
          </div>

          <button 
            type="submit" 
            :disabled="isSubmitting || !isFormValid" 
            class="w-full min-h-[44px] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-stone-300 disabled:to-stone-400 disabled:cursor-not-allowed text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-amber-600/20 active:scale-[0.99] flex items-center justify-center gap-2 text-sm sm:text-base mt-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            <span v-if="isSubmitting" class="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" aria-hidden="true"></span>
            <span>{{ isSubmitting ? 'กำลังบันทึกรหัสผ่านใหม่...' : 'บันทึกรหัสผ่านใหม่' }}</span>
          </button>
        </form>

        <div class="mt-6 pt-5 border-t border-amber-200/60 text-center">
          <NuxtLink 
            to="/login" 
            class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-stone-600 hover:text-amber-800 transition-colors py-1 px-2 rounded focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          >
            <span aria-hidden="true">←</span>
            <span>ยกเลิกและกลับไปหน้าเข้าสู่ระบบ</span>
          </NuxtLink>
        </div>
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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()

const token = ref('')
const targetEmail = ref('')
const pageState = ref('verifying') // 'verifying' | 'ready' | 'invalid' | 'success'
const errorMessage = ref('')

const newPassword = ref('')
const confirmPassword = ref('')
const isNewPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)
const isSubmitting = ref(false)
const submitError = ref('')

const isFormValid = computed(() => {
  return (
    newPassword.value.length >= 6 &&
    confirmPassword.value.length >= 6 &&
    newPassword.value === confirmPassword.value
  )
})

onMounted(async () => {
  token.value = route.query.token ? String(route.query.token) : ''

  if (!token.value) {
    pageState.value = 'invalid'
    errorMessage.value = 'ไม่พบโทเค็นสำหรับรีเซ็ตรหัสผ่าน กรุณาขอลิงก์ใหม่จากหน้าลืมรหัสผ่าน'
    return
  }

  try {
    const res = await $fetch(`/api/auth/verify-reset-token?token=${encodeURIComponent(token.value)}`)
    if (res.valid) {
      targetEmail.value = res.email
      pageState.value = 'ready'
    } else {
      pageState.value = 'invalid'
      errorMessage.value = res.message || 'ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้อง'
    }
  } catch (err) {
    pageState.value = 'invalid'
    errorMessage.value = err.data?.message || 'ลิงก์รีเซ็ตรหัสผ่านนี้หมดอายุการใช้งานแล้ว กรุณาขอลิงก์ใหม่'
  }
})

const handleResetPassword = async () => {
  if (!isFormValid.value) return
  isSubmitting.value = true
  submitError.value = ''

  try {
    await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: {
        token: token.value,
        newPassword: newPassword.value
      }
    })

    pageState.value = 'success'
    setTimeout(() => {
      router.push('/login')
    }, 2500)
  } catch (err) {
    submitError.value = err.data?.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน กรุณาลองใหม่อีกครั้ง'
  } finally {
    isSubmitting.value = false
  }
}
</script>
