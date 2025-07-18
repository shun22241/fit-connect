'use client'

import { useMemo, useCallback, useRef, useEffect, useState } from 'react'

// 重い計算のメモ化フック
export function useExpensiveCalculation<T>(
  calculation: () => T,
  dependencies: React.DependencyList,
): T {
  return useMemo(calculation, dependencies)
}

// デバウンス付きコールバック
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
): T {
  const callbackRef = useRef(callback)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  return useCallback(
    (...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    },
    [delay],
  ) as T
}

// スロットル付きコールバック
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
): T {
  const lastRun = useRef(Date.now())
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  return useCallback(
    (...args: any[]) => {
      if (Date.now() - lastRun.current >= delay) {
        callbackRef.current(...args)
        lastRun.current = Date.now()
      }
    },
    [delay],
  ) as T
}

// Intersection Observer フック（無限スクロール用）
export function useIntersectionObserver(
  targetRef: React.RefObject<Element>,
  options?: IntersectionObserverInit,
) {
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const element = targetRef.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, options)

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [targetRef, options])

  return isIntersecting
}

// ローカルストレージの永続化フック
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T) => {
      try {
        setStoredValue(value)
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(value))
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key],
  )

  return [storedValue, setValue]
}

// 非同期操作のキャンセル可能フック
export function useCancellablePromise() {
  const pendingPromises = useRef<Set<Promise<any>>>(new Set())

  const cancellablePromise = useCallback(
    <T>(promise: Promise<T>): Promise<T> => {
      const wrappedPromise = new Promise<T>((resolve, reject) => {
        promise
          .then(resolve)
          .catch(reject)
          .finally(() => {
            pendingPromises.current.delete(wrappedPromise)
          })
      })

      pendingPromises.current.add(wrappedPromise)
      return wrappedPromise
    },
    [],
  )

  useEffect(() => {
    return () => {
      // コンポーネントアンマウント時に進行中のPromiseをクリア
      pendingPromises.current.clear()
    }
  }, [])

  return cancellablePromise
}

// メディアクエリフック
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const media = window.matchMedia(query)
    setMatches(media.matches)

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}

// パフォーマンス計測フック
export function usePerformanceMonitor(name: string) {
  const startTime = useRef<number | undefined>(undefined)

  const start = useCallback(() => {
    startTime.current = performance.now()
  }, [])

  const end = useCallback(() => {
    if (startTime.current) {
      const duration = performance.now() - startTime.current
      console.log(`${name}: ${duration.toFixed(2)}ms`)

      // Performance API に記録
      if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
        performance.mark(`${name}-end`)
        performance.measure(name, `${name}-start`, `${name}-end`)
      }
    }
  }, [name])

  useEffect(() => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      performance.mark(`${name}-start`)
    }
  }, [name])

  return { start, end }
}

// フォーカス管理フック
export function useFocusWithin(): [
  React.RefObject<HTMLElement | null>,
  boolean,
] {
  const ref = useRef<HTMLElement | null>(null)
  const [isFocusWithin, setIsFocusWithin] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handleFocusIn = () => setIsFocusWithin(true)
    const handleFocusOut = (event: FocusEvent) => {
      if (!element.contains(event.relatedTarget as Node)) {
        setIsFocusWithin(false)
      }
    }

    element.addEventListener('focusin', handleFocusIn)
    element.addEventListener('focusout', handleFocusOut)

    return () => {
      element.removeEventListener('focusin', handleFocusIn)
      element.removeEventListener('focusout', handleFocusOut)
    }
  }, [])

  return [ref, isFocusWithin]
}

// オフライン状態検知フック
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    if (typeof navigator === 'undefined') return

    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}
