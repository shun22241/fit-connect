// Edge Runtime compatible logger
// Note: File system operations are not available in Edge Runtime

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

class EdgeLogger {
  private logLevel: LogLevel
  private logToConsole: boolean

  constructor() {
    this.logLevel = this.parseLogLevel(process.env.LOG_LEVEL || 'info')
    this.logToConsole = process.env.LOG_TO_CONSOLE !== 'false'
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

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel
  }

  private formatLogEntry(entry: LogEntry): string {
    const context = entry.context ? ` ${JSON.stringify(entry.context)}` : ''
    const error = entry.error ? ` ${entry.error.stack}` : ''
    const userId = entry.userId ? ` [User: ${entry.userId}]` : ''
    const requestId = entry.requestId ? ` [Request: ${entry.requestId}]` : ''

    return `[${entry.timestamp}] ${entry.level.toUpperCase()}${userId}${requestId}: ${entry.message}${context}${error}`
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error, userId?: string, requestId?: string) {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel[level].toLowerCase(),
      message,
      context,
      error,
      userId,
      requestId,
    }

    const formattedLog = this.formatLogEntry(entry)

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

    // In Edge Runtime, we can only log to console or send to external services
    // File logging is not available
  }

  error(message: string, error?: Error, context?: Record<string, any>, userId?: string, requestId?: string) {
    this.log(LogLevel.ERROR, message, context, error, userId, requestId)
  }

  warn(message: string, context?: Record<string, any>, userId?: string, requestId?: string) {
    this.log(LogLevel.WARN, message, context, undefined, userId, requestId)
  }

  info(message: string, context?: Record<string, any>, userId?: string, requestId?: string) {
    this.log(LogLevel.INFO, message, context, undefined, userId, requestId)
  }

  debug(message: string, context?: Record<string, any>, userId?: string, requestId?: string) {
    this.log(LogLevel.DEBUG, message, context, undefined, userId, requestId)
  }
}

export const logger = new EdgeLogger()