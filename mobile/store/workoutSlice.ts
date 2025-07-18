import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Exercise {
  id: string
  name: string
  sets: number
  reps: number
  weight: number
  restTime?: number
  notes?: string
}

interface Workout {
  id: string
  title: string
  exercises: Exercise[]
  duration: number
  totalVolume: number
  isPublic: boolean
  createdAt: string
  userId: string
}

interface WorkoutState {
  workouts: Workout[]
  currentWorkout: Workout | null
  loading: boolean
  error: string | null
  isRecording: boolean
  startTime: number | null
}

const initialState: WorkoutState = {
  workouts: [],
  currentWorkout: null,
  loading: false,
  error: null,
  isRecording: false,
  startTime: null,
}

const workoutSlice = createSlice({
  name: 'workout',
  initialState,
  reducers: {
    setWorkouts: (state, action: PayloadAction<Workout[]>) => {
      state.workouts = action.payload
      state.loading = false
    },
    addWorkout: (state, action: PayloadAction<Workout>) => {
      state.workouts.unshift(action.payload)
    },
    updateWorkout: (state, action: PayloadAction<Workout>) => {
      const index = state.workouts.findIndex((w) => w.id === action.payload.id)
      if (index !== -1) {
        state.workouts[index] = action.payload
      }
    },
    deleteWorkout: (state, action: PayloadAction<string>) => {
      state.workouts = state.workouts.filter((w) => w.id !== action.payload)
    },
    setCurrentWorkout: (state, action: PayloadAction<Workout | null>) => {
      state.currentWorkout = action.payload
    },
    startRecording: (state) => {
      state.isRecording = true
      state.startTime = Date.now()
      state.currentWorkout = {
        id: '',
        title: '',
        exercises: [],
        duration: 0,
        totalVolume: 0,
        isPublic: false,
        createdAt: new Date().toISOString(),
        userId: '',
      }
    },
    stopRecording: (state) => {
      state.isRecording = false
      state.startTime = null
      if (state.currentWorkout && state.startTime) {
        state.currentWorkout.duration = Math.floor(
          (Date.now() - state.startTime) / 1000 / 60,
        )
      }
    },
    addExerciseToCurrentWorkout: (state, action: PayloadAction<Exercise>) => {
      if (state.currentWorkout) {
        state.currentWorkout.exercises.push(action.payload)
        // 総重量を再計算
        state.currentWorkout.totalVolume =
          state.currentWorkout.exercises.reduce(
            (total, exercise) =>
              total + exercise.sets * exercise.reps * exercise.weight,
            0,
          )
      }
    },
    updateExerciseInCurrentWorkout: (
      state,
      action: PayloadAction<{ index: number; exercise: Exercise }>,
    ) => {
      if (state.currentWorkout) {
        state.currentWorkout.exercises[action.payload.index] =
          action.payload.exercise
        // 総重量を再計算
        state.currentWorkout.totalVolume =
          state.currentWorkout.exercises.reduce(
            (total, exercise) =>
              total + exercise.sets * exercise.reps * exercise.weight,
            0,
          )
      }
    },
    removeExerciseFromCurrentWorkout: (
      state,
      action: PayloadAction<number>,
    ) => {
      if (state.currentWorkout) {
        state.currentWorkout.exercises.splice(action.payload, 1)
        // 総重量を再計算
        state.currentWorkout.totalVolume =
          state.currentWorkout.exercises.reduce(
            (total, exercise) =>
              total + exercise.sets * exercise.reps * exercise.weight,
            0,
          )
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.loading = false
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  setWorkouts,
  addWorkout,
  updateWorkout,
  deleteWorkout,
  setCurrentWorkout,
  startRecording,
  stopRecording,
  addExerciseToCurrentWorkout,
  updateExerciseInCurrentWorkout,
  removeExerciseFromCurrentWorkout,
  setLoading,
  setError,
  clearError,
} = workoutSlice.actions

export default workoutSlice.reducer
