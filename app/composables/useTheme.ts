// app/composables/useTheme.ts
import { onMounted } from 'vue'

export const useTheme = () => {
  const theme = useState<'light' | 'dark'>('flowspace-theme', () => 'light')

  const applyThemeToDom = (mode: 'light' | 'dark') => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    if (mode === 'dark') {
      root.classList.add('dark')
      root.style.colorScheme = 'dark'
    } else {
      root.classList.remove('dark')
      root.style.colorScheme = 'light'
    }
  }

  const setTheme = (mode: 'light' | 'dark') => {
    theme.value = mode
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('flowspace_theme', mode)
      } catch (e) {}
    }
    applyThemeToDom(mode)
  }

  const toggleTheme = () => {
    const next = theme.value === 'dark' ? 'light' : 'dark'
    setTheme(next)
  }

  const initTheme = () => {
    if (typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem('flowspace_theme') as 'light' | 'dark' | null
      if (saved === 'dark' || saved === 'light') {
        theme.value = saved
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        theme.value = 'dark'
      } else {
        theme.value = 'light'
      }
    } catch (e) {
      theme.value = 'light'
    }
    applyThemeToDom(theme.value)
  }

  onMounted(() => {
    initTheme()
  })

  return {
    theme,
    isDark: computed(() => theme.value === 'dark'),
    setTheme,
    toggleTheme,
    initTheme
  }
}
