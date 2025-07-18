'use client'

import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface SwipeableCardProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  leftAction?: {
    icon: React.ReactNode
    color: string
    label: string
  }
  rightAction?: {
    icon: React.ReactNode
    color: string
    label: string
  }
  className?: string
  disabled?: boolean
  threshold?: number
}

export default function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  leftAction,
  rightAction,
  className,
  disabled = false,
  threshold = 100,
}: SwipeableCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  // タッチ開始
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return

    const touch = e.touches[0]
    setStartPos({ x: touch.clientX, y: touch.clientY })
    setIsDragging(true)
  }

  // タッチ移動
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || disabled) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - startPos.x
    const deltaY = touch.clientY - startPos.y

    // 垂直スワイプが優先される場合は水平移動を制限
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      setDragOffset({ x: 0, y: deltaY })
    } else {
      setDragOffset({ x: deltaX, y: 0 })
    }
  }

  // タッチ終了
  const handleTouchEnd = () => {
    if (!isDragging || disabled) return

    const { x, y } = dragOffset

    // スワイプ判定
    if (Math.abs(x) > threshold) {
      if (x > 0 && onSwipeRight) {
        onSwipeRight()
      } else if (x < 0 && onSwipeLeft) {
        onSwipeLeft()
      }
    } else if (Math.abs(y) > threshold) {
      if (y > 0 && onSwipeDown) {
        onSwipeDown()
      } else if (y < 0 && onSwipeUp) {
        onSwipeUp()
      }
    }

    // リセット
    setIsDragging(false)
    setDragOffset({ x: 0, y: 0 })
  }

  // マウスイベント（デスクトップ対応）
  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return

    setStartPos({ x: e.clientX, y: e.clientY })
    setIsDragging(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || disabled) return

    const deltaX = e.clientX - startPos.x
    const deltaY = e.clientY - startPos.y

    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      setDragOffset({ x: 0, y: deltaY })
    } else {
      setDragOffset({ x: deltaX, y: 0 })
    }
  }

  const handleMouseUp = () => {
    if (!isDragging || disabled) return

    const { x, y } = dragOffset

    if (Math.abs(x) > threshold) {
      if (x > 0 && onSwipeRight) {
        onSwipeRight()
      } else if (x < 0 && onSwipeLeft) {
        onSwipeLeft()
      }
    } else if (Math.abs(y) > threshold) {
      if (y > 0 && onSwipeDown) {
        onSwipeDown()
      } else if (y < 0 && onSwipeUp) {
        onSwipeUp()
      }
    }

    setIsDragging(false)
    setDragOffset({ x: 0, y: 0 })
  }

  // グローバルマウスイベント
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (!isDragging || disabled) return

        const deltaX = e.clientX - startPos.x
        const deltaY = e.clientY - startPos.y

        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          setDragOffset({ x: 0, y: deltaY })
        } else {
          setDragOffset({ x: deltaX, y: 0 })
        }
      }

      const handleGlobalMouseUp = () => {
        handleMouseUp()
      }

      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove)
        document.removeEventListener('mouseup', handleGlobalMouseUp)
      }
    }
  }, [isDragging, startPos, disabled, handleMouseUp])

  const opacity = Math.max(0.5, 1 - Math.abs(dragOffset.x) / (threshold * 2))
  const rotation = dragOffset.x * 0.1

  return (
    <div className="relative overflow-visible">
      {/* 背景アクション表示 */}
      {isDragging && dragOffset.x !== 0 && (
        <>
          {/* 右スワイプアクション */}
          {dragOffset.x > 0 && rightAction && (
            <div className="absolute inset-0 flex items-center justify-start pl-6 bg-gradient-to-r from-transparent to-green-100 rounded-lg">
              <div className="flex items-center space-x-2 text-green-600">
                {rightAction.icon}
                <span className="font-medium">{rightAction.label}</span>
              </div>
            </div>
          )}

          {/* 左スワイプアクション */}
          {dragOffset.x < 0 && leftAction && (
            <div className="absolute inset-0 flex items-center justify-end pr-6 bg-gradient-to-l from-transparent to-red-100 rounded-lg">
              <div className="flex items-center space-x-2 text-red-600">
                <span className="font-medium">{leftAction.label}</span>
                {leftAction.icon}
              </div>
            </div>
          )}
        </>
      )}

      {/* メインカード */}
      <Card
        ref={cardRef}
        className={cn(
          'transition-all duration-200 select-none cursor-grab active:cursor-grabbing',
          isDragging && 'z-10',
          className,
        )}
        style={{
          transform: `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${rotation}deg)`,
          opacity,
          transition: isDragging
            ? 'none'
            : 'transform 0.3s ease-out, opacity 0.3s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {children}
      </Card>

      {/* スワイプインジケーター */}
      {(leftAction || rightAction) && !disabled && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 text-xs text-gray-400">
          {leftAction && (
            <div className="flex items-center space-x-1">
              <div className="w-6 h-1 bg-red-200 rounded"></div>
              <span>左スワイプ: {leftAction.label}</span>
            </div>
          )}
          {rightAction && (
            <div className="flex items-center space-x-1">
              <span>右スワイプ: {rightAction.label}</span>
              <div className="w-6 h-1 bg-green-200 rounded"></div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
