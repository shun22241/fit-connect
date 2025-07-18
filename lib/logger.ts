import { createWriteStream, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

// ログレベルの定義
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

interface LogEntry {
  timestamp: string
  level: string
  message: string
  context?: Record<string, any>
  error?: Error
  userId?: string
  requestId?: string
}

class Logger {
  private logLevel: LogLevel
  private logToConsole: boolean
  private logToFile: boolean
  private logDirectory: string
  private logFileStream?: NodeJS.WritableStream

  constructor() {
    this.logLevel = this.parseLogLevel(process.env.LOG_LEVEL || 'info')
    this.logToConsole = process.env.LOG_TO_CONSOLE !== 'false'
    this.logToFile = process.env.LOG_TO_FILE === 'true'
    this.logDirectory = process.env.LOG_DIRECTORY || './logs'

    if (this.logToFile) {
      this.initializeFileLogging()
    }
  }

  private parseLogLevel(level: string): LogLevel {
    switch (level.toLowerCase()) {
      case 'error':
        return LogLevel.ERROR
      case 'warn':
        return LogLevel.WARN
      case 'info':
        return LogLevel.INFO
      case 'debug':
        return LogLevel.DEBUG
      default:
        return LogLevel.INFO
    }
  }

  private initializeFileLogging() {
    try {
      if (!existsSync(this.logDirectory)) {
        mkdirSync(this.logDirectory, { recursive: true })
      }

      const logFileName = `app-${new Date().toISOString().split('T')[0]}.log`
      const logFilePath = join(this.logDirectory, logFileName)

      this.logFileStream = createWriteStream(logFilePath, { flags: 'a' })
    } catch (error) {
      console.error('Failed to initialize file logging:', error)
      this.logToFile = false
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel
  }

  private formatLogEntry(entry: LogEntry): string {
    const context = entry.context ? ` ${JSON.stringify(entry.context)}` : ''
    const error = entry.error ? ` ${entry.error.stack}` : ''
    const userId = entry.userId ? ` [User: ${entry.userId}]` : ''
    const requestId = entry.requestId ? ` [Request: ${entry.requestId}]` : ''

    return `${entry.timestamp} [${entry.level}]${userId}${requestId} ${entry.message}${context}${error}`
  }

  private log(
    level: LogLevel,
    levelName: string,
    message: string,
    context?: Record<string, any>,
    error?: Error,
  ) {
    if (!this.shouldLog(level)) {
      return
    }

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: levelName,
      message,
      context,
      error,
    }

    const formattedLog = this.formatLogEntry(logEntry)

    // コンソール出力
    if (this.logToConsole) {
      switch (level) {
        case LogLevel.ERROR:
          console.error(formattedLog)
          break
        case LogLevel.WARN:
          console.warn(formattedLog)
          break
        case LogLevel.INFO:
          console.info(formattedLog)
          break
        case LogLevel.DEBUG:
          console.debug(formattedLog)
          break
      }
    }

    // ファイル出力
    if (this.logToFile && this.logFileStream) {
      this.logFileStream.write(formattedLog + '\n')
    }
  }

  // パブリックメソッド
  error(message: string, context?: Record<string, any>, error?: Error) {
    this.log(LogLevel.ERROR, 'ERROR', message, context, error)
  }

  warn(message: string, context?: Record<string, any>) {
    this.log(LogLevel.WARN, 'WARN', message, context)
  }

  info(message: string, context?: Record<string, any>) {
    this.log(LogLevel.INFO, 'INFO', message, context)
  }

  debug(message: string, context?: Record<string, any>) {
    this.log(LogLevel.DEBUG, 'DEBUG', message, context)
  }

  // リクエスト固有のロガーを作成
  child(options: { userId?: string; requestId?: string }): ChildLogger {
    return new ChildLogger(this, options)
  }

  // ファイルストリームのクローズ
  close() {
    if (this.logFileStream) {
      this.logFileStream.end()
    }
  }
}

class ChildLogger {
  constructor(
    private parent: Logger,
    private options: { userId?: string; requestId?: string },
  ) {}

  error(message: string, context?: Record<string, any>, error?: Error) {
    this.parent.error(
      this.formatMessage(message),
      { ...context, ...this.options },
      error,
    )
  }

  warn(message: string, context?: Record<string, any>) {
    this.parent.warn(this.formatMessage(message), {
      ...context,
      ...this.options,
    })
  }

  info(message: string, context?: Record<string, any>) {
    this.parent.info(this.formatMessage(message), {
      ...context,
      ...this.options,
    })
  }

  debug(message: string, context?: Record<string, any>) {
    this.parent.debug(this.formatMessage(message), {
      ...context,
      ...this.options,
    })
  }

  private formatMessage(message: string): string {
    const prefix: string[] = []
    if (this.options.userId) prefix.push(`User:${this.options.userId}`)
    if (this.options.requestId) prefix.push(`Request:${this.options.requestId}`)
    return prefix.length > 0 ? `[${prefix.join(', ')}] ${message}` : message
  }
}

// シングルトンインスタンス
export const logger = new Logger()

// Express ミドルウェア用のリクエストロガー
export function createRequestLogger(req: any, res: any, next: any) {
  const requestId = Math.random().toString(36).substr(2, 9)
  const userId = req.user?.id || 'anonymous'

  const requestLogger = logger.child({ userId, requestId })

  requestLogger.info('Request started', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  })

  const startTime = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - startTime
    const statusCode = res.statusCode

    const logMethod =
      statusCode >= 400 ? 'error' : statusCode >= 300 ? 'warn' : 'info'

    requestLogger[logMethod]('Request completed', {
      statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length'),
    })
  })

  // リクエストオブジェクトにロガーを追加
  req.logger = requestLogger
  next()
}

// パフォーマンス測定用のデコレーター
export function logPerformance(
  target: any,
  propertyName: string,
  descriptor: PropertyDescriptor,
) {
  const method = descriptor.value

  descriptor.value = async function (...args: any[]) {
    const start = Date.now()
    const result = await method.apply(this, args)
    const duration = Date.now() - start

    logger.debug(`Method ${propertyName} executed`, {
      duration: `${duration}ms`,
      className: target.constructor.name,
    })

    return result
  }

  return descriptor
}

// エラー処理用のヘルパー
export function logError(error: Error, context?: Record<string, any>) {
  logger.error(error.message, context, error)
}

// データベースクエリログ用
export function logDatabaseQuery(
  query: string,
  duration: number,
  params?: any[],
) {
  logger.debug('Database query executed', {
    query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
    duration: `${duration}ms`,
    paramCount: params?.length || 0,
  })
}

// API 呼び出しログ用
export function logApiCall(
  url: string,
  method: string,
  duration: number,
  statusCode: number,
) {
  const logMethod = statusCode >= 400 ? 'error' : 'info'

  logger[logMethod]('External API call', {
    url,
    method,
    duration: `${duration}ms`,
    statusCode,
  })
}

// ユーザーアクション追跡用
export function logUserAction(
  userId: string,
  action: string,
  details?: Record<string, any>,
) {
  logger.info('User action', {
    userId,
    action,
    ...details,
  })
}

// セキュリティイベントログ用
export function logSecurityEvent(event: string, details: Record<string, any>) {
  logger.warn('Security event', {
    event,
    ...details,
    timestamp: new Date().toISOString(),
  })
}

export default logger
