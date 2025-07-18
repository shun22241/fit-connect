'use client'

import { useState, useCallback } from 'react'

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
  duration?: number
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((props: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: Toast = {
      id,
      duration: 5000,
      ...props,
    }

    setToasts((current) => [...current, newToast])

    // Auto remove after duration
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id))
    }, newToast.duration)

    return id
  }, [])

  const dismiss = useCallback((toastId: string) => {
    setToasts((current) => current.filter((t) => t.id !== toastId))
  }, [])

  return {
    toast,
    toasts,
    dismiss,
  }
}
