<!-- app/pages/login.vue -->
<template>
  <!-- พื้นหลังคุมโทนสีครีมไข่เหลืองนวล อุ่นสบายตา และใส่ตาราง Grid ไม่สว่างจ้า -->
  <div class="min-h-screen bg-gradient-to-br from-[#fcf8f2] via-[#f7f0e4] to-[#f3e9d7] flex items-center justify-center p-4 relative overflow-hidden bg-grid">
    
    <!-- ลูกเล่นวงกลมแสงนวลๆ ด้านหลัง -->
    <div class="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-amber-200/40 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-orange-200/30 rounded-full blur-3xl pointer-events-none"></div>

    <div class="bg-[#fdfaf5] border border-amber-200/80 p-8 rounded-2xl w-full max-w-md shadow-xl shadow-amber-900/5 relative z-10">
      <h2 class="text-3xl font-extrabold text-center text-stone-800 mb-2 flex items-center justify-center gap-2">
        <span>🔑</span> เข้าสู่ระบบ
      </h2>
      <p class="text-center text-stone-500 text-sm mb-6 font-medium">ยินดีต้อนรับกลับมา! กรุณาเข้าสู่ระบบเพื่อทำงานต่อ</p>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-stone-600 mb-1">อีเมล (Email)</label>
          <input 
            v-model="email" 
            type="email" 
            placeholder="name@example.com" 
            required 
            class="w-full bg-white border border-amber-200 rounded-lg px-3 py-2.5 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200/60 transition-all shadow-sm" 
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
              class="w-full bg-white border border-amber-200 rounded-lg pl-3 pr-10 py-2.5 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200/60 transition-all shadow-sm" 
            />
            <button 
              type="button" 
              @click="isPasswordVisible = !isPasswordVisible" 
              class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors focus:outline-none"
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
          class="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-stone-400 disabled:to-stone-400 text-white font-bold py-2.5 rounded-lg transition-all shadow-md shadow-amber-600/20 mt-2 transform hover:-translate-y-0.5 active:translate-y-0"
        >
          {{ isLoading ? 'กำลังตรวจสอบสิทธิ์...' : 'เข้าสู่ระบบ ⚡' }}
        </button>
      </form>

      <p class="text-center text-sm text-stone-500 mt-6 font-medium">
        ยังไม่มีบัญชีสมาชิก? 
        <NuxtLink to="/register" class="text-amber-700 hover:text-amber-600 font-bold hover:underline transition-colors ml-1">สมัครสมาชิกที่นี่</NuxtLink>
      </p>
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

const email = ref('')
const password = ref('')
const isPasswordVisible = ref(false)
const message = ref('')
const isSuccess = ref(false)
const isLoading = ref(false)

const handleLogin = async () => {
  isLoading.value = true
  message.value = ''
  try {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value }
    })
    isSuccess.value = true
    message.value = response.message
    localStorage.setItem('user', JSON.stringify(response.user))
    setTimeout(() => { navigateTo('/') }, 1000)
  } catch (error) {
    isSuccess.value = false
    message.value = error.data?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
  } finally {
    isLoading.value = false
  }
}
</script>