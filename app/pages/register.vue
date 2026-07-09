<!-- app/pages/register.vue -->
<template>
  <!-- เปลี่ยนพื้นหลังเป็นสีครีมทึบแน่นๆ ไล่เฉดสีนุ่มนวล ไม่โปร่งแสงเขาสว่าง -->
  <div class="min-h-screen bg-gradient-to-br from-[#fcf8f2] via-[#f7f0e4] to-[#f3e9d7] flex items-center justify-center p-4 relative overflow-hidden bg-grid">
    
    <!-- แสงออร่าสีนวลละมุนปรับให้เข้มขึ้นเล็กน้อย -->
    <div class="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-amber-200/40 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-orange-200/30 rounded-full blur-3xl pointer-events-none"></div>

    <!-- ตัวการ์ดปรับเป็นสีครีมงาช้างทึบ ตัดขอบด้วยสีชานมจางๆ -->
    <div class="bg-[#fdfaf5] border border-amber-200/80 p-8 rounded-2xl w-full max-w-md shadow-xl shadow-amber-900/5 relative z-10">
      <h2 class="text-3xl font-extrabold text-center text-stone-800 mb-2 flex items-center justify-center gap-2">
        <span>📝</span> สมัครสมาชิก
      </h2>
      <p class="text-center text-stone-500 text-sm mb-6 font-medium">สร้างบัญชีเพื่อเริ่มต้นจัดการโปรเจกต์ของคุณ</p>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-stone-600 mb-1">ชื่อผู้ใช้งาน (Username)</label>
          <input 
            v-model="username" 
            type="text" 
            placeholder="เช่น geaw_dev" 
            required 
            class="w-full bg-white border border-amber-200 rounded-lg px-3 py-2.5 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200/60 transition-all shadow-sm" 
          />
        </div>

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
          <input 
            v-model="password" 
            type="password" 
            placeholder="••••••••" 
            required 
            class="w-full bg-white border border-amber-200 rounded-lg px-3 py-2.5 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200/60 transition-all shadow-sm" 
          />
        </div>

        <p v-if="message" :class="isSuccess ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-rose-700 bg-rose-50 border border-rose-200'" class="text-sm text-center font-medium py-2 rounded-lg transition-all">
          {{ message }}
        </p>

        <button 
          type="submit" 
          :disabled="isLoading" 
          class="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-stone-400 disabled:to-stone-400 text-white font-bold py-2.5 rounded-lg transition-all shadow-md shadow-amber-600/20 mt-2 transform hover:-translate-y-0.5 active:translate-y-0"
        >
          {{ isLoading ? 'กำลังบันทึกข้อมูล...' : 'สมัครสมาชิก สำเร็จ ✨' }}
        </button>
      </form>

      <p class="text-center text-sm text-stone-500 mt-6 font-medium">
        มีบัญชีอยู่แล้วใช่ไหม? 
        <NuxtLink to="/login" class="text-amber-700 hover:text-amber-600 font-bold hover:underline transition-colors ml-1">เข้าสู่ระบบที่นี่</NuxtLink>
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
import { ref } from 'vue'

const username = ref('')
const email = ref('')
const password = ref('')
const message = ref('')
const isSuccess = ref(false)
const isLoading = ref(false)

const handleRegister = async () => {
  isLoading.value = true
  message.value = ''
  try {
    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: { username: username.value, email: email.value, password: password.value }
    })
    isSuccess.value = true
    message.value = response.message
    localStorage.setItem('user', JSON.stringify(response.user))
    setTimeout(() => { navigateTo('/') }, 1500)
  } catch (error) {
    isSuccess.value = false
    message.value = error.data?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก'
  } finally {
    isLoading.value = false
  }
}
</script>