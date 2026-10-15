<!-- app/pages/reset-password.vue -->
<template>
  <div class="min-h-screen min-h-[100dvh] bg-gradient-to-br from-[#fcf8f2] via-[#f7f0e4] to-[#f3e9d7] flex items-center justify-center p-4 relative overflow-x-hidden bg-grid">
    
    <!-- Background ambient lighting -->
    <div class="absolute top-[-10%] left-[-10%] w-[320px] sm:w-[400px] h-[320px] sm:h-[400px] bg-amber-200/40 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[320px] sm:w-[400px] h-[320px] sm:h-[400px] bg-orange-200/30 rounded-full blur-3xl pointer-events-none"></div>

    <div class="bg-[#fdfaf5] border border-amber-200/80 p-6 sm:p-8 rounded-2xl w-full max-w-md shadow-xl shadow-amber-900/5 relative z-10">
      
      <!-- สถานะ: กำลังตรวจสอบลิงก์ -->
      <div v-if="pageState === 'verifying'" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-10 w-10 border-4 border-amber-500 border-t-transparent mb-3"></div>
        <p class="text-stone-600 font-bold text-sm">กำลังตรวจสอบความถูกต้องของลิงก์...</p>
        <p class="text-stone-400 text-xs mt-1">กรุณารอสักครู่</p>
      </div>

      <!-- สถานะ: ลิงก์ไม่ถูกต้องหรือหมดอายุ (Rule 8: Humane Recovery) -->
      <div v-else-if="pageState === 'invalid'" class="text-center py-4">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 text-2xl mb-3 shadow-inner">
          ⏳
        </div>
        <h2 class="text-xl sm:text-2xl font-extrabold text-stone-800 mb-2">
          ลิงก์หมดอายุหรือไม่ถูกต้อง
        </h2>
        <p class="text-stone-500 text-xs sm:text-sm font-medium mb-6 max-w-xs mx-auto">
          {{ errorMessage || 'ลิงก์รีเซ็ตรหัสผ่านนี้หมดอายุการใช้งานแล้ว (อายุ 15 นาที) หรือถูกใช้งานไปก่อนหน้านี้แล้ว' }}
        </p>

        <div class="space-y-2.5">
          <NuxtLink 
            to="/forgot-password"
            class="w-full min-h-[44px] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-amber-600/20 flex items-center justify-center gap-1.5 text-sm sm:text-base"
          >
            ขอลิงก์รีเซ็ตรหัสผ่านใหม่ ✉️
          </NuxtLink>
          <NuxtLink 
            to="/login"
            class="w-full min-h-[44px] bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-2.5 rounded-xl transition-all border border-stone-250 flex items-center justify-center text-sm"
          >
            กลับไปหน้าเข้าสู่ระบบ
          </NuxtLink>
        </div>
      </div>

      <!-- สถานะ: เปลี่ยนรหัสผ่านสำเร็จเรียบร้อย (Rule 3: Closed-Loop UX) -->
      <div v-else-if="pageState === 'success'" class="text-center py-4">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 text-2xl mb-3 shadow-inner animate-bounce">
          🎉
        </div>
        <h2 class="text-xl sm:text-2xl font-extrabold text-stone-800 mb-2">
          เปลี่ยนรหัสผ่านสำเร็จ!
        </h2>
        <p class="text-stone-500 text-xs sm:text-sm font-medium mb-6 max-w-xs mx-auto">
          รหัสผ่านของคุณได้รับการอัปเดตเรียบร้อยแล้ว ระบบกำลังนำคุณไปที่หน้าเข้าสู่ระบบอัตโนมัติ...
        </p>

        <NuxtLink 
          to="/login"
          class="w-full min-h-[44px] bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-emerald-700/20 flex items-center justify-center gap-1.5 text-sm sm:text-base"
        >
          เข้าสู่ระบบทันที ⚡
        </NuxtLink>
      </div>

      <!-- สถานะ: พร้อมกรอกรหัสผ่านใหม่ (Ready Form) -->
      <div v-else>
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 text-2xl mb-3 shadow-inner">
            🛡️
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-stone-800">
            ตั้งรหัสผ่านใหม่
          </h2>
          <p class="text-stone-500 text-xs sm:text-sm mt-1 font-medium">
            สำหรับบัญชี: <span class="font-bold text-amber-900">{{ targetEmail }}</span>
          </p>
        </div>

        <form @submit.prevent="handleResetPassword" class="space-y-4">
          
          <!-- ข้อความ Error ถ้ามี -->
          <div v-if="submitError" class="bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm rounded-xl p-3 font-medium text-center">
            {{ submitError }}
          </div>

          <div>
            <label class="block text-sm font-semibold text-stone-600 mb-1">รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)</label>
            <div class="relative">
              <input 
                v-model="newPassword" 
                :type="isNewPasswordVisible ? 'text' : 'password'" 
                placeholder="••••••••" 
                required 
                minlength="6"
                :disabled="isSubmitting"
                class="w-full bg-white border border-amber-200 rounded-xl pl-3.5 pr-12 py-2.5 min-h-[44px] text-base sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200/60 transition-all shadow-sm" 
              />
              <button 
                type="button" 
                @click="isNewPasswordVisible = !isNewPasswordVisible" 
                class="absolute right-0 top-0 bottom-0 w-11 flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors focus:outline-none"
                title="แสดง/ซ่อนรหัสผ่าน"
              >
                <span class="text-sm">{{ isNewPasswordVisible ? '🙈' : '👁️' }}</span>
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-stone-600 mb-1">ยืนยันรหัสผ่านใหม่อีกครั้ง</label>
            <div class="relative">
              <input 
                v-model="confirmPassword" 
                :type="isConfirmPasswordVisible ? 'text' : 'password'" 
                placeholder="••••••••" 
                required 
                minlength="6"
                :disabled="isSubmitting"
                class="w-full bg-white border border-amber-200 rounded-xl pl-3.5 pr-12 py-2.5 min-h-[44px] text-base sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200/60 transition-all shadow-sm" 
              />
              <button 
                type="button" 
                @click="isConfirmPasswordVisible = !isConfirmPasswordVisible" 
                class="absolute right-0 top-0 bottom-0 w-11 flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors focus:outline-none"
                title="แสดง/ซ่อนรหัสผ่าน"
              >
                <span class="text-sm">{{ isConfirmPasswordVisible ? '🙈' : '👁️' }}</span>
              </button>
            </div>
            
            <p v-if="confirmPassword && newPassword !== confirmPassword" class="text-xs text-rose-600 font-bold mt-1.5">
              ⚠️ รหัสผ่านทั้งสองช่องไม่ตรงกัน
            </p>
          </div>

          <button 
            type="submit" 
            :disabled="isSubmitting || !isFormValid" 
            class="w-full min-h-[44px] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-stone-300 disabled:to-stone-400 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-amber-600/20 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 text-sm sm:text-base mt-2"
          >
            <span v-if="isSubmitting" class="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
            {{ isSubmitting ? 'กำลังบันทึกรหัสผ่านใหม่...' : 'บันทึกรหัสผ่านใหม่ 💾' }}
          </button>
        </form>

        <div class="mt-6 pt-5 border-t border-stone-200/60 text-center">
          <NuxtLink 
            to="/login" 
            class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-stone-600 hover:text-amber-800 transition-colors py-1"
          >
            <span>←</span> ยกเลิกและกลับไปหน้าเข้าสู่ระบบ
          </NuxtLink>
        </div>
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
    const res = await $fetch('/api/auth/reset-password', {
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
