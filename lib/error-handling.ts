/**
 * Enhanced Error Handling for SEO-Ready Data Fetching
 * 
 * This module provides comprehensive error handling utilities that work
 * with the new universal data fetching infrastructure, supporting both
 * server-side and client-side error scenarios.
 */

import { toast } from "sonner";

// Error types for different contexts
export enum ErrorContext {
  SERVER_SIDE = 'server',
  CLIENT_SIDE = 'client',
  BUILD_TIME = 'build',
  HYDRATION = 'hydration',
  API_ROUTE = 'api'
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Enhanced error interface
export interface EnhancedError extends Error {
  context: ErrorContext;
  severity: ErrorSeverity;
  code?: string;
  statusCode?: number;
  retryable?: boolean;
  fallbackData?: any;
  timestamp: number;
  userMessage?: string;
  debugInfo?: Record<string, any>;
}

// Error factory functions
export function createDataFetchingError(
  message: string,
  context: ErrorContext,
  options: Partial<EnhancedError> = {}
): EnhancedError {
  const error = new Error(message) as EnhancedError;

  error.context = context;
  error.severity = options.severity || ErrorSeverity.MEDIUM;
  error.code = options.code;
  error.statusCode = options.statusCode;
  error.retryable = options.retryable ?? true;
  error.fallbackData = options.fallbackData;
  error.timestamp = Date.now();
  error.userMessage = options.userMessage;
  error.debugInfo = options.debugInfo;

  return error;
}

export function createServerError(
  message: string,
  options: Partial<EnhancedError> = {}
): EnhancedError {
  return createDataFetchingError(message, ErrorContext.SERVER_SIDE, {
    severity: ErrorSeverity.HIGH,
    userMessage: "سرور کی خرابی، براہ کرم دوبارہ کوشش کریں۔",
    ...options
  });
}

export function createClientError(
  message: string,
  options: Partial<EnhancedError> = {}
): EnhancedError {
  return createDataFetchingError(message, ErrorContext.CLIENT_SIDE, {
    severity: ErrorSeverity.MEDIUM,
    userMessage: "ڈیٹا لوڈ کرنے میں خرابی، براہ کرم دوبارہ کوشش کریں۔",
    ...options
  });
}

export function createBuildTimeError(
  message: string,
  options: Partial<EnhancedError> = {}
): EnhancedError {
  return createDataFetchingError(message, ErrorContext.BUILD_TIME, {
    severity: ErrorSeverity.CRITICAL,
    retryable: false,
    userMessage: "Build time error occurred",
    ...options
  });
}

export function createHydrationError(
  message: string,
  options: Partial<EnhancedError> = {}
): EnhancedError {
  return createDataFetchingError(message, ErrorContext.HYDRATION, {
    severity: ErrorSeverity.HIGH,
    userMessage: "صفحہ لوڈ کرنے میں خرابی، براہ کرم صفحہ ریفریش کریں۔",
    ...options
  });
}

// Error handling utilities
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: EnhancedError[] = [];
  private maxLogSize = 100;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  logError(error: EnhancedError): void {
    // Add to internal log
    this.errorLog.unshift(error);
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.pop();
    }

    // Log to console with context
    const logLevel = this.getLogLevel(error.severity);
    const logMessage = `[${error.context.toUpperCase()}] ${error.message}`;

    console[logLevel](logMessage, {
      code: error.code,
      statusCode: error.statusCode,
      retryable: error.retryable,
      debugInfo: error.debugInfo,
      timestamp: new Date(error.timestamp).toISOString()
    });

    // Send to external logging service in production
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      this.sendToExternalLogger(error);
    }
  }

  handleError(error: EnhancedError, showToast = true): void {
    this.logError(error);

    // Show user-friendly toast message on client-side
    if (typeof window !== 'undefined' && showToast && error.userMessage) {
      const toastType = this.getToastType(error.severity);
      toast[toastType](error.userMessage);
    }
  }

  getRecentErrors(count = 10): EnhancedError[] {
    return this.errorLog.slice(0, count);
  }

  getErrorsByContext(context: ErrorContext): EnhancedError[] {
    return this.errorLog.filter(error => error.context === context);
  }

  clearErrorLog(): void {
    this.errorLog = [];
  }

  private getLogLevel(severity: ErrorSeverity): 'error' | 'warn' | 'info' {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return 'error';
      case ErrorSeverity.MEDIUM:
        return 'warn';
      case ErrorSeverity.LOW:
        return 'info';
      default:
        return 'error';
    }
  }

  private getToastType(severity: ErrorSeverity): 'error' | 'warning' | 'info' {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return 'error';
      case ErrorSeverity.MEDIUM:
        return 'warning';
      case ErrorSeverity.LOW:
        return 'info';
      default:
        return 'error';
    }
  }

  private async sendToExternalLogger(error: EnhancedError): Promise<void> {
    try {
      // This would integrate with services like Sentry, LogRocket, etc.
      // For now, we'll just log to console in production
      if (error.severity === ErrorSeverity.CRITICAL || error.severity === ErrorSeverity.HIGH) {
        console.error('Critical error logged:', {
          message: error.message,
          context: error.context,
          code: error.code,
          statusCode: error.statusCode,
          timestamp: error.timestamp,
          debugInfo: error.debugInfo
        });
      }
    } catch (loggingError) {
      console.error('Failed to send error to external logger:', loggingError);
    }
  }
}

// Convenience functions
export function logError(error: EnhancedError): void {
  ErrorHandler.getInstance().logError(error);
}

export function handleError(error: EnhancedError, showToast = true): void {
  ErrorHandler.getInstance().handleError(error, showToast);
}

// Error boundary helpers for React components
export function createErrorBoundaryHandler(componentName: string) {
  return (error: Error, errorInfo: any) => {
    const enhancedError = createClientError(
      `Error in ${componentName}: ${error.message}`,
      {
        code: 'COMPONENT_ERROR',
        debugInfo: {
          componentName,
          errorInfo,
          stack: error.stack
        }
      }
    );

    handleError(enhancedError);
  };
}

// Retry utilities
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000,
  context: ErrorContext = ErrorContext.CLIENT_SIDE
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        const enhancedError = createDataFetchingError(
          `Operation failed after ${maxRetries + 1} attempts: ${lastError.message}`,
          context,
          {
            code: 'MAX_RETRIES_EXCEEDED',
            debugInfo: {
              attempts: attempt + 1,
              maxRetries,
              originalError: lastError.message
            }
          }
        );

        throw enhancedError;
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// Network error detection
export function isNetworkError(error: Error): boolean {
  return (
    error.message.includes('fetch') ||
    error.message.includes('network') ||
    error.message.includes('timeout') ||
    error.message.includes('connection') ||
    (error as any).code === 'NETWORK_ERROR'
  );
}

// API error detection
export function isAPIError(error: Error): boolean {
  return (
    error.message.includes('API') ||
    error.message.includes('Airtable') ||
    (error as any).statusCode >= 400
  );
}

// Build-time error detection
export function isBuildTimeError(error: Error): boolean {
  return (
    error.message.includes('build') ||
    error.message.includes('Failed to parse URL') ||
    typeof window === 'undefined' && process.env.NODE_ENV === 'production'
  );
}