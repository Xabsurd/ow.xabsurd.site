type ToastType = 'success' | 'error' | 'info'

export type ToastMessage = {
  id: number
  type: ToastType
  title: string
}

function fetchMessage(error: unknown) {
  const fetchError = error as {
    data?: { data?: { message?: string }; message?: string; statusMessage?: string }
    message?: string
    statusMessage?: string
  }

  return (
    fetchError.data?.data?.message ||
    fetchError.data?.message ||
    fetchError.data?.statusMessage ||
    fetchError.statusMessage ||
    fetchError.message ||
    'Error'
  )
}

export function useToast() {
  const messages = useState<ToastMessage[]>('toast-messages', () => [])

  function push(type: ToastType, title: string) {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    messages.value = [...messages.value, { id, type, title }]
    if (import.meta.client) {
      window.setTimeout(() => dismiss(id), 3600)
    }
  }

  function dismiss(id: number) {
    messages.value = messages.value.filter((message) => message.id !== id)
  }

  return {
    messages,
    dismiss,
    error: (message: string) => push('error', message),
    info: (message: string) => push('info', message),
    success: (message: string) => push('success', message),
    fromError: (error: unknown) => push('error', fetchMessage(error))
  }
}
