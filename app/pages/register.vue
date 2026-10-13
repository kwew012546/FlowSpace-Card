<!-- app/pages/register.vue -->
<template>
  <!-- เปลี่ยนพื้นหลังเป็นสีครีมทึบแน่นๆ ไล่เฉดสีนุ่มนวล ไม่โปร่งแสงเขาสว่าง -->
  <div class="min-h-screen min-h-[100dvh] bg-gradient-to-br from-[#fcf8f2] via-[#f7f0e4] to-[#f3e9d7] flex items-center justify-center p-4 relative overflow-x-hidden bg-grid">
    
    <!-- แสงออร่าสีนวลละมุนปรับให้เข้มขึ้นเล็กน้อย -->
    <div class="absolute top-[-10%] left-[-10%] w-[320px] sm:w-[400px] h-[320px] sm:h-[400px] bg-amber-200/40 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[320px] sm:w-[400px] h-[320px] sm:h-[400px] bg-orange-200/30 rounded-full blur-3xl pointer-events-none"></div>

    <!-- ตัวการ์ดปรับเป็นสีครีมงาช้างทึบ ตัดขอบด้วยสีชานมจางๆ -->
    <div class="bg-[#fdfaf5] border border-amber-200/80 p-6 sm:p-8 rounded-2xl w-full max-w-md shadow-xl shadow-amber-900/5 relative z-10">
      <h2 class="text-2xl sm:text-3xl font-extrabold text-center text-stone-800 mb-2 flex items-center justify-center gap-2">
        <span>📝</span> สมัครสมาชิก
      </h2>
      <p class="text-center text-stone-500 text-xs sm:text-sm mb-6 font-medium">สร้างบัญชีเพื่อเริ่มต้นจัดการโปรเจกต์ของคุณ</p>

      <!-- แสดงหน้าจอส่งอีเมลสำเร็จเมื่อส่งเมลจริง -->
      <div v-if="isSuccess && !verifyLink" class="text-center py-2 space-y-4">
        <div class="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner relative">
          <span v-if="isVerifiedComplete">🎉</span>
          <span v-else>✉️</span>
          <span v-if="!isVerifiedComplete" class="absolute -top-1 -right-1 flex h-4 w-4">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
          </span>
        </div>

        <div v-if="isVerifiedComplete" class="space-y-3 py-2">
          <div class="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold shadow-sm">
            <span>✅</span> ยืนยันอีเมลสำเร็จเรียบร้อยแล้ว!
          </div>
          <h3 class="text-xl font-black text-stone-800">กำลังนำคุณเข้าสู่แดชบอร์ด...</h3>
          <div class="animate-spin rounded-full h-6 w-6 border-2 border-amber-600 border-t-transparent mx-auto mt-3"></div>
        </div>

        <div v-else class="space-y-3">
          <h3 class="text-xl font-black text-stone-800">ส่งอีเมลยืนยันตัวตนแล้ว!</h3>
          <p class="text-xs sm:text-sm text-stone-600 font-medium leading-relaxed">
            ระบบได้ส่งลิงก์เปิดใช้งานบัญชีไปยัง <span class="font-bold text-amber-900">{{ email }}</span> เรียบร้อยแล้ว (ลิงก์มีอายุ 15 นาที)
          </p>

          <!-- ตัวบอกสถานะว่ากำลังรอการยืนยันแบบ Real-time -->
          <div class="p-3 bg-amber-50/90 border border-amber-200/90 rounded-xl text-xs text-amber-900 font-medium flex items-center justify-center gap-2">
            <div class="w-2 h-2 rounded-full bg-amber-500 animate-ping"></div>
            <span>ระบบกำลังรอให้คุณกดยืนยันในอีเมล (จะเชื่อมต่อไปยังแดชบอร์ดให้อัตโนมัติ 🚀)</span>
          </div>

          <div class="p-3.5 bg-stone-50 border border-stone-200/80 rounded-xl text-xs text-stone-600 font-medium text-left space-y-1">
            <p class="font-bold text-stone-700">💡 คำแนะนำ:</p>
            <p>• กรุณาเปิดกล่องจดหมายอีเมลของคุณและคลิกปุ่ม <b>"ยืนยันอีเมลของคุณ"</b></p>
            <p>• หากไม่พบในกล่องข้อความหลัก กรุณาลองตรวจสอบในโฟลเดอร์ <b>Junk</b> หรือ <b>Spam</b></p>
          </div>

          <NuxtLink to="/login" class="inline-block text-xs text-stone-400 hover:text-stone-600 font-medium pt-1">
            ต้องการเข้าสู่ระบบด้วยตนเอง? คลิกที่นี่ 🔑
          </NuxtLink>
        </div>
      </div>

      <form v-else @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-stone-600 mb-1">ชื่อผู้ใช้งาน (Username)</label>
          <input 
            v-model="username" 
            type="text" 
            placeholder="เช่น geaw_dev" 
            required 
            class="w-full bg-white border border-amber-200 rounded-xl px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200/60 transition-all shadow-sm" 
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-stone-600 mb-1">อีเมล (Email)</label>
          <input 
            v-model="email" 
            type="email" 
            placeholder="name@example.com" 
            required 
            class="w-full bg-white border border-amber-200 rounded-xl px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200/60 transition-all shadow-sm" 
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-stone-600 mb-1">รหัสผ่าน (Password)</label>
          <div class="relative">
            <input 
              v-model="password" 
              :type="isPasswordVisible ? 'text' : 'password'" 
              placeholder="••••••••" 
              required 
              class="w-full bg-white border border-amber-200 rounded-xl pl-3.5 pr-12 py-2.5 min-h-[44px] text-base sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200/60 transition-all shadow-sm" 
            />
            <button 
              type="button" 
              @click="isPasswordVisible = !isPasswordVisible" 
              class="absolute right-0 top-0 bottom-0 w-11 flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors focus:outline-none"
              title="แสดง/ซ่อนรหัสผ่าน"
            >
              <!-- Eye open -->
              <svg v-if="isPasswordVisible" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              <!-- Eye closed -->
              <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            </button>
          </div>
        </div>

        <p v-if="message" :class="isSuccess ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-rose-700 bg-rose-50 border border-rose-200'" class="text-sm text-center font-medium py-2 rounded-lg transition-all">
          {{ message }}
        </p>

        <button 
          type="submit" 
          :disabled="isLoading" 
          class="w-full min-h-[44px] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-stone-400 disabled:to-stone-400 text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-amber-600/20 mt-2 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center text-sm sm:text-base"
        >
          {{ isLoading ? 'กำลังบันทึกข้อมูล...' : 'สมัครสมาชิก ✨' }}
        </button>
      </form>

      <!-- ปุ่มยืนยันด่วนเฉพาะกรณีที่ไม่ได้ตั้งค่า SMTP (โหมดพัฒนาเครื่อง Local แบบไม่มีเมล) -->
      <div v-if="verifyLink" class="mt-4 p-4 bg-amber-50/80 border border-amber-200 rounded-xl text-center text-xs font-bold text-stone-700">
        <p class="mb-2.5 flex items-center justify-center gap-1"><span>💻</span> (โหมดพัฒนาในเครื่อง) ยืนยันอีเมลได้ทันที:</p>
        <a :href="verifyLink" class="min-h-[44px] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black px-4 py-2.5 rounded-xl inline-flex items-center justify-center shadow-sm transition-all">คลิกเพื่อยืนยันอีเมล ✉️</a>
      </div>

      <p v-if="!isSuccess || verifyLink" class="text-center text-sm text-stone-500 mt-6 font-medium">
        มีบัญชีอยู่แล้วใช่ไหม? 
        <NuxtLink to="/login" class="text-amber-700 hover:text-amber-600 font-bold hover:underline transition-colors ml-1 inline-block py-1">เข้าสู่ระบบที่นี่</NuxtLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
/* สีกริตจุดปรับให้เข้มขึ้นเป็นสีเทาหม่นอมน้ำตาลจางๆ จะได้เห็นมิติกำลังดี */
.bg-grid {
  background-image: radial-gradient(#bcaaa4 1px, transparent 1px);
  background-size: 24px 24px;
}
</style>

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
let pollTimer = null

let pollCount = 0
const MAX_POLLS = 150 // 150 ครั้ง x 2 วินาที = 5 นาที (ป้องกันการยิง API ไม่รู้จบ)

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
        }, 1200)
      }
    } catch (e) {
      // หากโทเค็นหมดอายุหรือไม่ถูกต้อง ให้หยุดโพลล์ทันที
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

const handleRegister = async () => {
  isLoading.value = true
  message.value = ''
  verifyLink.value = ''
  try {
    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: { username: username.value, email: email.value, password: password.value }
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