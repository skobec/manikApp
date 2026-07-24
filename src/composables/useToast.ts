import { ref } from 'vue'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

const toasts = ref<Toast[]>([])

let counter = 0

export function useToast() {
  function show(message: string, type: Toast['type'] = 'info') {
    const id = `toast_${++counter}`
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id)
    }, 4000)
  }

  function remove(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return { toasts, show, remove }
}
