import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

interface Modal {
  id: string
  type: string
  data?: any
}

interface UIState {
  toasts: Toast[]
  modals: Modal[]
  isLoading: boolean
  theme: 'light' | 'dark' | 'system'
  networkStatus: 'online' | 'offline'
}

const initialState: UIState = {
  toasts: [],
  modals: [],
  isLoading: false,
  theme: 'system',
  networkStatus: 'online',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showToast: (state, action: PayloadAction<Omit<Toast, 'id'>>) => {
      const toast: Toast = {
        id: Date.now().toString(),
        duration: 3000,
        ...action.payload,
      }
      state.toasts.push(toast)
    },
    hideToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload)
    },
    clearToasts: (state) => {
      state.toasts = []
    },
    showModal: (state, action: PayloadAction<Omit<Modal, 'id'>>) => {
      const modal: Modal = {
        id: Date.now().toString(),
        ...action.payload,
      }
      state.modals.push(modal)
    },
    hideModal: (state, action: PayloadAction<string>) => {
      state.modals = state.modals.filter((modal) => modal.id !== action.payload)
    },
    hideModalByType: (state, action: PayloadAction<string>) => {
      state.modals = state.modals.filter(
        (modal) => modal.type !== action.payload,
      )
    },
    clearModals: (state) => {
      state.modals = []
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload
    },
    setNetworkStatus: (state, action: PayloadAction<'online' | 'offline'>) => {
      state.networkStatus = action.payload
    },
  },
})

export const {
  showToast,
  hideToast,
  clearToasts,
  showModal,
  hideModal,
  hideModalByType,
  clearModals,
  setLoading,
  setTheme,
  setNetworkStatus,
} = uiSlice.actions

export default uiSlice.reducer
