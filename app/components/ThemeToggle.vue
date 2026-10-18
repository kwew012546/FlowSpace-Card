<!-- app/components/ThemeToggle.vue -->
<template>
  <button
    type="button"
    @click="toggleTheme"
    :title="isDark ? 'สลับเป็นโหมดสว่าง (Light Mode)' : 'สลับเป็นโหมดมืด (Dark Mode)'"
    :aria-label="isDark ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด'"
    :aria-pressed="isDark"
    class="theme-toggle-btn min-h-[42px] min-w-[42px] px-2.5 py-2 rounded-xl border transition-all duration-200 inline-flex items-center justify-center gap-1.5 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-amber-500/40 shadow-2xs active:scale-95"
    :class="isDark
      ? 'bg-slate-800/90 hover:bg-slate-700/90 text-amber-400 border-slate-700 hover:border-amber-500/50 shadow-amber-500/5'
      : 'bg-white/90 hover:bg-amber-50/80 text-stone-700 hover:text-amber-700 border-stone-200/90 hover:border-amber-300'"
  >
    <!-- Sun Icon (Shown in Dark Mode to switch to Light) -->
    <svg
      v-if="isDark"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45 shrink-0"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>

    <!-- Moon Icon (Shown in Light Mode to switch to Dark) -->
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="w-4 h-4 text-indigo-600 transition-transform duration-300 hover:-rotate-12 shrink-0"
      aria-hidden="true"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      <path d="M19 3v4" />
      <path d="M21 5h-4" />
    </svg>

    <span v-if="showLabel" class="text-xs font-bold hidden sm:inline">
      {{ isDark ? 'โหมดสว่าง' : 'โหมดมืด' }}
    </span>
  </button>
</template>

<script setup lang="ts">
defineProps({
  showLabel: {
    type: Boolean,
    default: false
  }
})

const { isDark, toggleTheme } = useTheme()
</script>
