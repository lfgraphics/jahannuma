/**
 * Enhanced Logging and Debugging Utilities
 * 
 * Provides comprehensive logging for both server and client environments
 * with support for different log levels, contexts, and debugging features.
 */

import {
  type EnhancedError
} from "./error-handling";

// Log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

// Log entry interface
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  data?: any;
  error?: EnhancedError;
  requestId?: string;
  userId?: string;
  sessionId?: string;
  environment: 'server' | 'client' | 'build';
  url?: string;
  userAgent?: string;
}

// Logger configuration
export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableStorage: boolean;
  enableRemote: boolean;
  maxStorageEntries: number;
  remoteEndpoint?: string;
  contexts: string[];
  sensitiveFields: string[];
}

// Default configuration
const defaultConfig: LoggerConfig = {
  level: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
  enableConsole: true,
  enableStorage: typeof window !== 'undefined',
  enableRemote: process.env.NODE_ENV === 'production',
  maxStorageEntries: 1000,
  remoteEndpoint: process.env.NEXT_PUBLIC_LOGGING_ENDPOINT,
  contexts: ['*'], // Log all contexts by default
  sensitiveFields: ['password', 'token', 'apiKey', 'secret', 'authorization']
};

// Enhanced Logger class
export class Logger {
  private static instance: Logger;
  private config: LoggerConfig;
  private logBuffer: LogEntry[] = [];
  private isServer: boolean;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.isServer = typeof window === 'undefined';
  }

  static getInstance(config?: Partial<LoggerConfig>): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config);
    }
    return Logger.instance;
  }

  // Core logging method
  private log(
    level: LogLevel,
    context: string,
    message: string,
    data?: any,
    error?: EnhancedError
  ): void {
    // Check if logging is enabled for this level
    if (level < this.config.level) {
      return;
    }

    // Check if logging is enabled for this context
    if (!this.shouldLogContext(context)) {
      return;
    }

    // Create log entry
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      context,
      message,
      data: this.sanitizeData(data),
      error,
      environment: this.isServer ? 'server' : 'client',
      requestId: this.getRequestId(),
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      url: this.getCurrentUrl(),
      userAgent: this.getUserAgent()
    };

    // Add to buffer
    this.logBuffer.push(entry);
    this.trimBuffer();

    // Output to console
    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    // Store locally
    if (this.config.enableStorage && !this.isServer) {
      this.logToStorage(entry);
    }

    // Send to remote endpoint
    if (this.config.enableRemote && level >= LogLevel.WARN) {
      this.logToRemote(entry);
    }
  }

  // Public logging methods
  debug(context: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, context, message, data);
  }

  info(context: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, context, message, data);
  }

  warn(context: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, context, message, data);
  }

  error(context: string, message: string, error?: EnhancedError, data?: any): void {
    this.log(LogLevel.ERROR, context, message, data, error);
  }

  critical(context: string, message: string, error?: EnhancedError, data?: any): void {
    this.log(LogLevel.CRITICAL, context, message, data, error);
  }

  // Specialized logging methods
  logDataFetching(
    operation: string,
    params: any,
    result?: any,
    error?: EnhancedError
  ): void {
    const context = 'DATA_FETCHING';
    const message = `${operation} ${error ? 'failed' : 'completed'}`;

    if (error) {
      this.error(context, message, error, { operation, params });
    } else {
      this.debug(context, message, {
        operation,
        params,
        resultSize: Array.isArray(result?.records) ? result.records.length : 'unknown'
      });
    }
  }

  logAPIRequest(
    method: string,
    url: string,
    params?: any,
    response?: any,
    error?: EnhancedError
  ): void {
    const context = 'API_REQUEST';
    const message = `${method} ${url} ${error ? 'failed' : 'completed'}`;

    if (error) {
      this.error(context, message, error, { method, url, params });
    } else {
      this.info(context, message, {
        method,
        url,
        params,
        status: response?.status || 'unknown'
      });
    }
  }

  logBuildProcess(
    step: string,
    details?: any,
    error?: EnhancedError
  ): void {
    const context = 'BUILD_PROCESS';
    const message = `Build step: ${step} ${error ? 'failed' : 'completed'}`;

    if (error) {
      this.error(context, message, error, details);
    } else {
      this.info(context, message, details);
    }
  }

  logPerformance(
    operation: string,
    duration: number,
    details?: any
  ): void {
    const context = 'PERFORMANCE';
    const level = duration > 5000 ? LogLevel.WARN : LogLevel.DEBUG;
    const message = `${operation} took ${duration}ms`;

    this.log(level, context, message, { ...details, duration });
  }

  // Utility methods
  private shouldLogContext(context: string): boolean {
    if (this.config.contexts.includes('*')) {
      return true;
    }
    return this.config.contexts.includes(context);
  }

  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized = { ...data };

    for (const field of this.config.sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  private trimBuffer(): void {
    if (this.logBuffer.length > this.config.maxStorageEntries) {
      this.logBuffer = this.logBuffer.slice(-this.config.maxStorageEntries);
    }
  }

  private logToConsole(entry: LogEntry): void {
    const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'];
    const levelColors = [
      '\x1b[36m', // cyan
      '\x1b[32m', // green
      '\x1b[33m', // yellow
      '\x1b[31m', // red
      '\x1b[35m'  // magenta
    ];

    const reset = '\x1b[0m';
    const color = levelColors[entry.level] || '';
    const levelName = levelNames[entry.level] || 'UNKNOWN';

    const prefix = `${color}[${levelName}]${reset} ${entry.timestamp} [${entry.context}]`;
    const message = `${prefix} ${entry.message}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message, entry.data);
        break;
      case LogLevel.INFO:
        console.info(message, entry.data);
        break;
      case LogLevel.WARN:
        console.warn(message, entry.data);
        break;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(message, entry.error || entry.data);
        break;
    }
  }

  private logToStorage(entry: LogEntry): void {
    try {
      const stored = localStorage.getItem('app_logs');
      const logs = stored ? JSON.parse(stored) : [];

      logs.push(entry);

      // Keep only recent entries
      if (logs.length > this.config.maxStorageEntries) {
        logs.splice(0, logs.length - this.config.maxStorageEntries);
      }

      localStorage.setItem('app_logs', JSON.stringify(logs));
    } catch (error) {
      console.warn('Failed to store log entry:', error);
    }
  }

  private async logToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.remoteEndpoint) {
      return;
    }

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry)
      });
    } catch (error) {
      console.warn('Failed to send log to remote endpoint:', error);
    }
  }

  // Context getters
  private getRequestId(): string | undefined {
    if (this.isServer) {
      // In server context, this would be set by middleware
      return process.env.REQUEST_ID;
    } else {
      // In client context, generate or retrieve from session
      let requestId = sessionStorage.getItem('requestId');
      if (!requestId) {
        requestId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('requestId', requestId);
      }
      return requestId;
    }
  }

  private getUserId(): string | undefined {
    if (this.isServer) {
      return process.env.USER_ID;
    } else {
      // This would integrate with your auth system
      return localStorage.getItem('userId') || undefined;
    }
  }

  private getSessionId(): string | undefined {
    if (this.isServer) {
      return process.env.SESSION_ID;
    } else {
      let sessionId = sessionStorage.getItem('sessionId');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('sessionId', sessionId);
      }
      return sessionId;
    }
  }

  private getCurrentUrl(): string | undefined {
    if (this.isServer) {
      return process.env.REQUEST_URL;
    } else {
      return window.location.href;
    }
  }

  private getUserAgent(): string | undefined {
    if (this.isServer) {
      return process.env.USER_AGENT;
    } else {
      return navigator.userAgent;
    }
  }

  // Public utility methods
  getRecentLogs(count = 50): LogEntry[] {
    return this.logBuffer.slice(-count);
  }

  getLogsByContext(context: string, count = 50): LogEntry[] {
    return this.logBuffer
      .filter(entry => entry.context === context)
      .slice(-count);
  }

  getLogsByLevel(level: LogLevel, count = 50): LogEntry[] {
    return this.logBuffer
      .filter(entry => entry.level >= level)
      .slice(-count);
  }

  exportLogs(): string {
    return JSON.stringify(this.logBuffer, null, 2);
  }

  clearLogs(): void {
    this.logBuffer = [];
    if (!this.isServer) {
      localStorage.removeItem('app_logs');
    }
  }

  // Performance measurement utilities
  startTimer(operation: string): () => void {
    const startTime = performance.now();

    return (details?: any) => {
      const duration = performance.now() - startTime;
      this.logPerformance(operation, duration, details);
    };
  }

  async measureAsync<T>(
    operation: string,
    fn: () => Promise<T>,
    context = 'PERFORMANCE'
  ): Promise<T> {
    const startTime = performance.now();

    try {
      const result = await fn();
      const duration = performance.now() - startTime;
      this.logPerformance(operation, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.error(context, `${operation} failed after ${duration}ms`, error as EnhancedError);
      throw error;
    }
  }
}

// Global logger instance
export const logger = Logger.getInstance();

// Convenience functions
export const logDebug = (context: string, message: string, data?: any) =>
  logger.debug(context, message, data);

export const logInfo = (context: string, message: string, data?: any) =>
  logger.info(context, message, data);

export const logWarn = (context: string, message: string, data?: any) =>
  logger.warn(context, message, data);

export const logError = (context: string, message: string, error?: EnhancedError, data?: any) =>
  logger.error(context, message, error, data);

export const logCritical = (context: string, message: string, error?: EnhancedError, data?: any) =>
  logger.critical(context, message, error, data);

// Specialized logging functions
export const logDataFetching = logger.logDataFetching.bind(logger);
export const logAPIRequest = logger.logAPIRequest.bind(logger);
export const logBuildProcess = logger.logBuildProcess.bind(logger);
export const logPerformance = logger.logPerformance.bind(logger);

// Performance measurement
export const startTimer = logger.startTimer.bind(logger);
export const measureAsync = logger.measureAsync.bind(logger);