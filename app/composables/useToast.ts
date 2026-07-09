import { ref } from 'vue'

interface ToastState {
  show: boolean
  message: string
  type: 'success' | 'error' | 'warning'
}

const toastState = ref<ToastState>({
  show: false,
  message: '',
  type: 'success'
})

let toastTimeout: any = null

export function useToast() {
  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    if (toastTimeout) clearTimeout(toastTimeout)
    
    toastState.value.message = message
    toastState.value.type = type
    toastState.value.show = true

    toastTimeout = setTimeout(() => {
      toastState.value.show = false
    }, 3500)
  }

  return {
    toast: toastState,
    showToast
  }
}
