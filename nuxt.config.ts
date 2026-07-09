// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  
  // 1. เพิ่มโมดูล Tailwind เข้าไปตรงนี้
  modules: [
    '@nuxtjs/tailwindcss'
  ],

  future: {
    compatibilityVersion: 4,
  }
})