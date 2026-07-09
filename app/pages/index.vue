<!-- app/pages/index.vue -->
<template>
  <div class="min-h-screen bg-[#fcf8f2] flex items-center justify-center">
    <div class="text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent mx-auto mb-2"></div>
      <p class="text-stone-500 font-bold text-sm">กำลังนำคุณเข้าสู่หน้าแดชบอร์ดหลัก...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

definePageMeta({
  middleware: 'auth'
})

onMounted(() => {
  // เมื่อโหลดหน้านี้เสร็จ ส่งผู้ใช้ไปหน้าแดชบอร์ดรวมทันที
  navigateTo('/dashboard')
})
</script>