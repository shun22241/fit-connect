'use client'

import { ratelimit } from '@/lib/ratelimit'

// CSP (Content Security Policy) 設定
export const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https:;
  font-src 'self' https://fonts.gstatic.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, ' ')
  .trim()

// 入力検証とサニタイゼーション
export class InputValidator {
  // HTMLタグを除去
  static sanitizeHTML(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim()
  }

  // SQLインジェクション対策
  static sanitizeSQL(input: string): string {
    return input
      .replace(/['"\\;]/g, '')
      .replace(
        /(\bOR\b|\bAND\b|\bUNION\b|\bSELECT\b|\bINSERT\b|\bDELETE\b|\bUPDATE\b|\bDROP\b)/gi,
        '',
      )
      .trim()
  }

  // XSS対策
  static escapeXSS(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }

  // メールアドレス検証
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) && email.length <= 254
  }

  // パスワード強度チェック
  static validatePassword(password: string): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push('パスワードは8文字以上である必要があります')
    }

    if (password.length > 128) {
      errors.push('パスワードは128文字以下である必要があります')
    }

    if (!/[a-z]/.test(password)) {
      errors.push('小文字を含む必要があります')
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('大文字を含む必要があります')
    }

    if (!/\d/.test(password)) {
      errors.push('数字を含む必要があります')
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('特殊文字を含む必要があります')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  // ファイル名検証
  static validateFileName(fileName: string): boolean {
    const forbiddenChars = /[<>:"/\\|?*\x00-\x1f]/
    const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i

    return (
      !forbiddenChars.test(fileName) &&
      !reservedNames.test(fileName) &&
      fileName.length > 0 &&
      fileName.length <= 255
    )
  }

  // URL検証
  static validateURL(url: string): boolean {
    try {
      const urlObj = new URL(url)
      return ['http:', 'https:'].includes(urlObj.protocol)
    } catch {
      return false
    }
  }

  // ユーザー名検証
  static validateUsername(username: string): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    if (username.length < 3) {
      errors.push('ユーザー名は3文字以上である必要があります')
    }

    if (username.length > 30) {
      errors.push('ユーザー名は30文字以下である必要があります')
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      errors.push(
        'ユーザー名は英数字、アンダースコア、ハイフンのみ使用できます',
      )
    }

    if (/^[0-9]/.test(username)) {
      errors.push('ユーザー名は数字で始めることはできません')
    }

    const reservedNames = [
      'admin',
      'root',
      'user',
      'test',
      'api',
      'www',
      'mail',
      'ftp',
      'localhost',
      'fitconnect',
      'support',
      'help',
      'about',
      'contact',
    ]

    if (reservedNames.includes(username.toLowerCase())) {
      errors.push('このユーザー名は使用できません')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}

// セキュリティヘッダー設定
export const securityHeaders = {
  'Content-Security-Policy': cspHeader,
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
}

// レート制限チェック
export async function checkRateLimit(
  identifier: string,
  type: 'api' | 'auth' | 'upload' = 'api',
): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: Date
}> {
  try {
    // レート制限の設定
    const limits = {
      api: { requests: 100, window: '1h' },
      auth: { requests: 5, window: '15m' },
      upload: { requests: 10, window: '1h' },
    }

    const result = await ratelimit.limit(identifier, limits[type])

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: new Date(result.reset),
    }
  } catch (error) {
    console.error('Rate limit check failed:', error)
    // エラー時は制限を通す
    return {
      success: true,
      limit: 100,
      remaining: 99,
      reset: new Date(Date.now() + 3600000),
    }
  }
}

// IPアドレス取得
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')

  if (cfConnectingIP) return cfConnectingIP
  if (realIP) return realIP
  if (forwarded) return forwarded.split(',')[0].trim()

  return 'unknown'
}

// セキュアなファイルアップロード検証
export function validateFileUpload(file: File): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

  if (file.size > maxSize) {
    errors.push('ファイルサイズは10MB以下である必要があります')
  }

  if (!allowedTypes.includes(file.type)) {
    errors.push('許可されていないファイル形式です')
  }

  if (!InputValidator.validateFileName(file.name)) {
    errors.push('無効なファイル名です')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// セキュアなCookie設定
export const secureCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 60 * 60 * 24 * 7, // 7日
  path: '/',
}

// CSRF トークン生成
export function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  )
}

// セキュリティ監査ログ
export function logSecurityEvent(event: {
  type: 'auth' | 'rate_limit' | 'validation_error' | 'suspicious_activity'
  userId?: string
  ip: string
  userAgent?: string
  details: Record<string, any>
}) {
  const logData = {
    timestamp: new Date().toISOString(),
    level: 'security',
    ...event,
  }

  // 本番環境では専用のセキュリティログシステムに送信
  if (process.env.NODE_ENV === 'production') {
    // セキュリティログサービスに送信
    console.warn('SECURITY EVENT:', JSON.stringify(logData))
  } else {
    console.log('Security Event:', logData)
  }
}

// 暗号化ユーティリティ
export class Encryption {
  private static readonly algorithm = 'AES-GCM'
  private static readonly keyLength = 256

  static async generateKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: this.algorithm,
        length: this.keyLength,
      },
      true,
      ['encrypt', 'decrypt'],
    )
  }

  static async encrypt(data: string, key: CryptoKey): Promise<string> {
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encodedData = new TextEncoder().encode(data)

    const encrypted = await crypto.subtle.encrypt(
      {
        name: this.algorithm,
        iv,
      },
      key,
      encodedData,
    )

    const combined = new Uint8Array(iv.length + encrypted.byteLength)
    combined.set(iv)
    combined.set(new Uint8Array(encrypted), iv.length)

    return btoa(String.fromCharCode(...combined))
  }

  static async decrypt(encryptedData: string, key: CryptoKey): Promise<string> {
    const combined = new Uint8Array(
      atob(encryptedData)
        .split('')
        .map((char) => char.charCodeAt(0)),
    )

    const iv = combined.slice(0, 12)
    const encrypted = combined.slice(12)

    const decrypted = await crypto.subtle.decrypt(
      {
        name: this.algorithm,
        iv,
      },
      key,
      encrypted,
    )

    return new TextDecoder().decode(decrypted)
  }
}
