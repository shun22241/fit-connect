import { configureStore } from '@reduxjs/toolkit'
import authSlice from './authSlice'
import workoutSlice from './workoutSlice'
import postSlice from './postSlice'
import uiSlice from './uiSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    workout: workoutSlice,
    post: postSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
