<template>
  <!-- Reusable Toast Notification -->
  <div v-if="toast.show" class="fixed top-4 right-4 z-50 transform transition-all duration-300 translate-y-0 opacity-100 flex items-center gap-3 bg-[#fdfaf5] border rounded-xl p-4 shadow-xl max-w-sm" :class="toast.type === 'success' ? 'border-emerald-200' : toast.type === 'error' ? 'border-rose-200' : 'border-amber-200'">
    <div :class="toast.type === 'success' ? 'bg-emerald-100 text-emerald-600' : toast.type === 'error' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'" class="p-2 rounded-full shrink-0">
      <!-- Success SVG -->
      <svg v-if="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
      <!-- Error SVG -->
      <svg v-else-if="toast.type === 'error'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
      <!-- Warning SVG -->
      <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008z" />
      </svg>
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-stone-800 text-sm font-bold leading-snug">{{ toast.message }}</p>
    </div>
    <button @click="toast.show = false" class="shrink-0 text-stone-400 hover:text-stone-600 focus:outline-none">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>

<script setup>
const { toast } = useToast()
</script>
