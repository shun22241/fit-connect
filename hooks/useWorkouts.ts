'use client'

import { useState, useEffect } from 'react'
import {
  WorkoutWithExercises,
  CreateWorkoutData,
  ApiResponse,
} from '@/types/database'

export function useWorkouts(userId?: string) {
  const [workouts, setWorkouts] = useState<WorkoutWithExercises[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWorkouts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (userId) params.append('userId', userId)

      const response = await fetch(`/api/workouts?${params}`)
      const result: ApiResponse<WorkoutWithExercises[]> = await response.json()

      if (result.success && result.data) {
        setWorkouts(result.data)
      } else {
        setError(result.error || 'Failed to fetch workouts')
      }
    } catch (error) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const createWorkout = async (data: CreateWorkoutData) => {
    try {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result: ApiResponse<WorkoutWithExercises> = await response.json()

      if (result.success && result.data) {
        setWorkouts((prev) => [result.data!, ...prev])
        return result.data
      } else {
        throw new Error(result.error || 'Failed to create workout')
      }
    } catch (error) {
      console.error('Error creating workout:', error)
      throw error
    }
  }

  const updateWorkout = async (
    id: string,
    data: Partial<CreateWorkoutData>,
  ) => {
    try {
      const response = await fetch(`/api/workouts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result: ApiResponse<WorkoutWithExercises> = await response.json()

      if (result.success && result.data) {
        setWorkouts((prev) =>
          prev.map((workout) => (workout.id === id ? result.data! : workout)),
        )
        return result.data
      } else {
        throw new Error(result.error || 'Failed to update workout')
      }
    } catch (error) {
      console.error('Error updating workout:', error)
      throw error
    }
  }

  const deleteWorkout = async (id: string) => {
    try {
      const response = await fetch(`/api/workouts/${id}`, {
        method: 'DELETE',
      })

      const result: ApiResponse<void> = await response.json()

      if (result.success) {
        setWorkouts((prev) => prev.filter((workout) => workout.id !== id))
      } else {
        throw new Error(result.error || 'Failed to delete workout')
      }
    } catch (error) {
      console.error('Error deleting workout:', error)
      throw error
    }
  }

  useEffect(() => {
    fetchWorkouts()
  }, [userId])

  return {
    workouts,
    loading,
    error,
    refetch: fetchWorkouts,
    createWorkout,
    updateWorkout,
    deleteWorkout,
  }
}

export function useWorkout(id: string) {
  const [workout, setWorkout] = useState<WorkoutWithExercises | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/workouts/${id}`)
        const result: ApiResponse<WorkoutWithExercises> = await response.json()

        if (result.success && result.data) {
          setWorkout(result.data)
        } else {
          setError(result.error || 'Failed to fetch workout')
        }
      } catch (error) {
        setError('Network error')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchWorkout()
    }
  }, [id])

  return { workout, loading, error }
}
