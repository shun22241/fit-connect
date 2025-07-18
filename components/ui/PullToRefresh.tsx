'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { RefreshCw, ChevronDown } from 'lucide-react'

interface PullToRefreshProps {
  children: React.ReactNode
  onRefresh: () => Promise<void>
  threshold?: number
  className?: string
  disabled?: boolean
}

export default function PullToRefresh({
  children,
  onRefresh,
  threshold = 80,
  className,
  disabled = false,
}: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [canRefresh, setCanRefresh] = useState(false)

  const startY = useRef(0)
  const currentY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // タッチ開始
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled || isRefreshing) return

      const container = containerRef.current
      if (!container || container.scrollTop > 0) return

      startY.current = e.touches[0].clientY
      setIsPulling(true)
    },
    [disabled, isRefreshing],
  )

  // タッチ移動
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isPulling || disabled || isRefreshing) return

      currentY.current = e.touches[0].clientY
      const distance = Math.max(0, currentY.current - startY.current)

      // 抵抗を加える（距離が長くなるほど動きにくくする）
      const resistance = Math.min(distance * 0.5, threshold * 1.5)
      setPullDistance(resistance)
      setCanRefresh(resistance >= threshold)

      // デフォルトのスクロール動作を防ぐ
      if (distance > 10) {
        e.preventDefault()
      }
    },
    [isPulling, disabled, isRefreshing, threshold],
  )

  // タッチ終了
  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || disabled) return

    setIsPulling(false)

    if (canRefresh && !isRefreshing) {
      setIsRefreshing(true)
      setPullDistance(threshold) // アニメーション用に固定

      try {
        await onRefresh()
      } catch (error) {
        console.error('Refresh failed:', error)
      } finally {
        setIsRefreshing(false)
        setCanRefresh(false)
        setPullDistance(0)
      }
    } else {
      // リフレッシュしない場合は元に戻す
      setPullDistance(0)
      setCanRefresh(false)
    }
  }, [isPulling, disabled, canRefresh, isRefreshing, onRefresh, threshold])

  // マウスイベント（デスクトップでのテスト用）
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled || isRefreshing) return

      const container = containerRef.current
      if (!container || container.scrollTop > 0) return

      startY.current = e.clientY
      setIsPulling(true)
    },
    [disabled, isRefreshing],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPulling || disabled || isRefreshing) return

      currentY.current = e.clientY
      const distance = Math.max(0, currentY.current - startY.current)
      const resistance = Math.min(distance * 0.3, threshold * 1.5)

      setPullDistance(resistance)
      setCanRefresh(resistance >= threshold)
    },
    [isPulling, disabled, isRefreshing, threshold],
  )

  const handleMouseUp = useCallback(async () => {
    if (!isPulling || disabled) return

    setIsPulling(false)

    if (canRefresh && !isRefreshing) {
      setIsRefreshing(true)
      setPullDistance(threshold)

      try {
        await onRefresh()
      } catch (error) {
        console.error('Refresh failed:', error)
      } finally {
        setIsRefreshing(false)
        setCanRefresh(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
      setCanRefresh(false)
    }
  }, [isPulling, disabled, canRefresh, isRefreshing, onRefresh, threshold])

  // グローバルマウスイベント
  useEffect(() => {
    if (isPulling) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (!isPulling || disabled || isRefreshing) return

        currentY.current = e.clientY
        const distance = Math.max(0, currentY.current - startY.current)
        const resistance = Math.min(distance * 0.3, threshold * 1.5)

        setPullDistance(resistance)
        setCanRefresh(resistance >= threshold)
      }

      const handleGlobalMouseUp = async () => {
        if (!isPulling || disabled) return

        setIsPulling(false)

        if (canRefresh && !isRefreshing) {
          setIsRefreshing(true)
          setPullDistance(threshold)

          try {
            await onRefresh()
          } catch (error) {
            console.error('Refresh failed:', error)
          } finally {
            setIsRefreshing(false)
            setCanRefresh(false)
            setPullDistance(0)
          }
        } else {
          setPullDistance(0)
          setCanRefresh(false)
        }
      }

      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove)
        document.removeEventListener('mouseup', handleGlobalMouseUp)
      }
    }
  }, [isPulling, disabled, isRefreshing, canRefresh, threshold, onRefresh])

  const progress = Math.min(pullDistance / threshold, 1)
  const rotation = progress * 180

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-auto', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        transform: `translateY(${Math.min(pullDistance, threshold)}px)`,
        transition: isPulling ? 'none' : 'transform 0.3s ease-out',
      }}
    >
      {/* プル状態のインジケーター */}
      {(isPulling || isRefreshing) && pullDistance > 10 && (
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-center py-4 bg-blue-50 border-b border-blue-100"
          style={{
            transform: `translateY(-${Math.min(pullDistance, threshold)}px)`,
            opacity: Math.min(pullDistance / 30, 1),
          }}
        >
          <div className="flex items-center space-x-2 text-blue-600">
            {isRefreshing ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span className="text-sm font-medium">更新中...</span>
              </>
            ) : canRefresh ? (
              <>
                <ChevronDown className="h-5 w-5" />
                <span className="text-sm font-medium">離して更新</span>
              </>
            ) : (
              <>
                <ChevronDown
                  className="h-5 w-5 transition-transform duration-200"
                  style={{ transform: `rotate(${rotation}deg)` }}
                />
                <span className="text-sm font-medium">引っ張って更新</span>
              </>
            )}
          </div>
        </div>
      )}

      {children}
    </div>
  )
}
