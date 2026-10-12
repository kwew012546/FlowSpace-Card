<!-- app/pages/index.vue -->
<template>
  <div class="min-h-screen min-h-[100dvh] bg-[#fcf8f2]" />
</template>

<script setup>
definePageMeta({
  middleware: [
    (to, from) => {
      if (import.meta.server) {
        const token = useCookie('auth_token')
        return navigateTo(token.value ? '/dashboard' : '/login', { replace: true })
      }
      if (import.meta.client) {
        const user = localStorage.getItem('user')
        return navigateTo(user ? '/dashboard' : '/login', { replace: true })
      }
    }
  ]
})
</script>