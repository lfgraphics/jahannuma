/**
 * Global Error Handler
 * 
 * Provides centralized error handling for the entire application,
 * including unhandled promise rejections, window errors, and
 * Next.js specific error scenarios.
 */

"use client";

import {
  ErrorContext,
  ErrorHandler,
  ErrorSeverity,
  createClientError,
  type EnhancedError
} from "./error-handling";
import { logger } from "./logging";

// Global error handler configuration
export interface GlobalErrorHandlerConfig {
  enableWindowErrorHandler: boolean;
  enableUnhandledRejectionHandler: boolean;
  enableConsoleErrorCapture: boolean;
  reportToRemote: boolean;
  remoteEndpoint?: string;
  maxErrorsPerSession: number;
  enableUserNotification: boolean;
  enableErrorRecovery: boolean;
}

const defaultConfig: GlobalErrorHandlerConfig = {
  enableWindowErrorHandler: true,
  enableUnhandledRejectionHandler: true,
  enableConsoleErrorCapture: process.env.NODE_ENV === 'development',
  reportToRemote: process.env.NODE_ENV === 'production',
  remoteEndpoint: process.env.NEXT_PUBLIC_ERROR_REPORTING_ENDPOINT,
  maxErrorsPerSession: 50,
  enableUserNotification: true,
  enableErrorRecovery: true
};

// Global error statistics
interface ErrorStats {
  totalErrors: number;
  errorsByContext: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  lastErrorTime: number;
  sessionStartTime: number;
}

export class GlobalErrorHandler {
  private static instance: GlobalErrorHandler;
  private config: GlobalErrorHandlerConfig;
  private errorHandler: ErrorHandler;
  private stats: ErrorStats;
  private isInitialized = false;

  constructor(config: Partial<GlobalErrorHandlerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.errorHandler = ErrorHandler.getInstance();
    this.stats = {
      totalErrors: 0,
      errorsByContext: {},
      errorsBySeverity: {},
      lastErrorTime: 0,
      sessionStartTime: Date.now()
    };
  }

  static getInstance(config?: Partial<GlobalErrorHandlerConfig>): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler(config);
    }
    return GlobalErrorHandler.instance;
  }

  // Initialize global error handlers
  initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }

    logger.info('GLOBAL_ERROR_HANDLER', 'Initializing global error handlers');

    // Window error handler
    if (this.config.enableWindowErrorHandler) {
      window.addEventListener('error', this.handleWindowError.bind(this));
      logger.debug('GLOBAL_ERROR_HANDLER', 'Window error handler registered');
    }

    // Unhandled promise rejection handler
    if (this.config.enableUnhandledRejectionHandler) {
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
      logger.debug('GLOBAL_ERROR_HANDLER', 'Unhandled rejection handler registered');
    }

    // Console error capture (for development)
    if (this.config.enableConsoleErrorCapture) {
      this.setupConsoleErrorCapture();
      logger.debug('GLOBAL_ERROR_HANDLER', 'Console error capture enabled');
    }

    // Resource loading error handler
    window.addEventListener('error', this.handleResourceError.bind(this), true);

    this.isInitialized = true;
    logger.info('GLOBAL_ERROR_HANDLER', 'Global error handlers initialized successfully');
  }

  // Handle window errors
  private handleWindowError(event: ErrorEvent): void {
    const enhancedError = createClientError(
      event.message || 'Unknown window error',
      {
        code: 'WINDOW_ERROR',
        severity: ErrorSeverity.HIGH,
        debugInfo: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack,
          userAgent: navigator.userAgent,
          url: window.location.href
        }
      }
    );

    this.processError(enhancedError);
  }

  // Handle unhandled promise rejections
  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    const reason = event.reason;
    let message = 'Unhandled promise rejection';
    let debugInfo: any = { reason };

    if (reason instanceof Error) {
      message = `Unhandled promise rejection: ${reason.message}`;
      debugInfo = {
        message: reason.message,
        stack: reason.stack,
        name: reason.name
      };
    } else if (typeof reason === 'string') {
      message = `Unhandled promise rejection: ${reason}`;
    }

    const enhancedError = createClientError(message, {
      code: 'UNHANDLED_REJECTION',
      severity: ErrorSeverity.HIGH,
      debugInfo
    });

    this.processError(enhancedError);

    // Prevent the default browser behavior
    event.preventDefault();
  }

  // Handle resource loading errors
  private handleResourceError(event: Event): void {
    const target = event.target as HTMLElement;

    if (target && (target.tagName === 'IMG' || target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
      const enhancedError = createClientError(
        `Failed to load resource: ${target.tagName}`,
        {
          code: 'RESOURCE_LOAD_ERROR',
          severity: ErrorSeverity.MEDIUM,
          debugInfo: {
            tagName: target.tagName,
            src: (target as any).src || (target as any).href,
            url: window.location.href
          }
        }
      );

      this.processError(enhancedError);
    }
  }

  // Setup console error capture
  private setupConsoleErrorCapture(): void {
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args: any[]) => {
      originalError.apply(console, args);

      const message = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');

      const enhancedError = createClientError(
        `Console error: ${message}`,
        {
          code: 'CONSOLE_ERROR',
          severity: ErrorSeverity.MEDIUM,
          debugInfo: { args }
        }
      );

      this.processError(enhancedError);
    };

    console.warn = (...args: any[]) => {
      originalWarn.apply(console, args);

      const message = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');

      const enhancedError = createClientError(
        `Console warning: ${message}`,
        {
          code: 'CONSOLE_WARNING',
          severity: ErrorSeverity.LOW,
          debugInfo: { args }
        }
      );

      this.processError(enhancedError);
    };
  }

  // Process and handle errors
  private processError(error: EnhancedError): void {
    // Update statistics
    this.updateStats(error);

    // Check if we've exceeded the maximum errors per session
    if (this.stats.totalErrors > this.config.maxErrorsPerSession) {
      logger.warn('GLOBAL_ERROR_HANDLER', 'Maximum errors per session exceeded, throttling');
      return;
    }

    // Log the error
    logger.error('GLOBAL_ERROR_HANDLER', 'Processing global error', error);

    // Handle the error through the error handler
    this.errorHandler.handleError(error, this.config.enableUserNotification);

    // Report to remote endpoint if configured
    if (this.config.reportToRemote && error.severity >= ErrorSeverity.HIGH) {
      this.reportToRemote(error);
    }

    // Attempt error recovery if enabled
    if (this.config.enableErrorRecovery) {
      this.attemptErrorRecovery(error);
    }
  }

  // Update error statistics
  private updateStats(error: EnhancedError): void {
    this.stats.totalErrors++;
    this.stats.lastErrorTime = Date.now();

    const context = error.context || 'unknown';
    this.stats.errorsByContext[context] = (this.stats.errorsByContext[context] || 0) + 1;

    const severity = error.severity || 'unknown';
    this.stats.errorsBySeverity[severity] = (this.stats.errorsBySeverity[severity] || 0) + 1;
  }

  // Report error to remote endpoint
  private async reportToRemote(error: EnhancedError): Promise<void> {
    if (!this.config.remoteEndpoint) {
      return;
    }

    try {
      const payload = {
        error: {
          message: error.message,
          code: error.code,
          context: error.context,
          severity: error.severity,
          timestamp: error.timestamp,
          debugInfo: error.debugInfo
        },
        session: {
          sessionId: sessionStorage.getItem('sessionId'),
          userId: localStorage.getItem('userId'),
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString()
        },
        stats: this.stats
      };

      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      logger.debug('GLOBAL_ERROR_HANDLER', 'Error reported to remote endpoint');
    } catch (reportingError) {
      logger.warn('GLOBAL_ERROR_HANDLER', 'Failed to report error to remote endpoint', reportingError);
    }
  }

  // Attempt error recovery
  private attemptErrorRecovery(error: EnhancedError): void {
    switch (error.code) {
      case 'RESOURCE_LOAD_ERROR':
        this.recoverFromResourceError(error);
        break;
      case 'NETWORK_ERROR':
        this.recoverFromNetworkError(error);
        break;
      case 'HYDRATION_MISMATCH':
        this.recoverFromHydrationError(error);
        break;
      default:
        logger.debug('GLOBAL_ERROR_HANDLER', 'No recovery strategy for error code', error.code);
    }
  }

  // Recovery strategies
  private recoverFromResourceError(error: EnhancedError): void {
    logger.info('GLOBAL_ERROR_HANDLER', 'Attempting recovery from resource error');

    // Could implement retry logic for failed resources
    // For now, just log the attempt
  }

  private recoverFromNetworkError(error: EnhancedError): void {
    logger.info('GLOBAL_ERROR_HANDLER', 'Attempting recovery from network error');

    // Could implement offline mode or retry logic
    // For now, just log the attempt
  }

  private recoverFromHydrationError(error: EnhancedError): void {
    logger.info('GLOBAL_ERROR_HANDLER', 'Attempting recovery from hydration error');

    // Could implement page refresh or component remount
    if (error.severity >= ErrorSeverity.HIGH) {
      logger.warn('GLOBAL_ERROR_HANDLER', 'Severe hydration error, considering page refresh');
    }
  }

  // Public methods
  getErrorStats(): ErrorStats {
    return { ...this.stats };
  }

  clearStats(): void {
    this.stats = {
      totalErrors: 0,
      errorsByContext: {},
      errorsBySeverity: {},
      lastErrorTime: 0,
      sessionStartTime: Date.now()
    };
  }

  // Manual error reporting
  reportError(error: Error | EnhancedError, context?: ErrorContext): void {
    let enhancedError: EnhancedError;

    if ('context' in error) {
      enhancedError = error as EnhancedError;
    } else {
      enhancedError = createClientError(error.message, {
        code: 'MANUAL_REPORT',
        debugInfo: {
          stack: error.stack,
          name: error.name
        }
      });
    }

    if (context) {
      enhancedError.context = context;
    }

    this.processError(enhancedError);
  }

  // Cleanup
  destroy(): void {
    if (typeof window === 'undefined' || !this.isInitialized) {
      return;
    }

    window.removeEventListener('error', this.handleWindowError.bind(this));
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
    window.removeEventListener('error', this.handleResourceError.bind(this), true);

    this.isInitialized = false;
    logger.info('GLOBAL_ERROR_HANDLER', 'Global error handlers destroyed');
  }
}

// Initialize global error handler
export function initializeGlobalErrorHandler(config?: Partial<GlobalErrorHandlerConfig>): GlobalErrorHandler {
  const handler = GlobalErrorHandler.getInstance(config);
  handler.initialize();
  return handler;
}

// Export singleton instance
export const globalErrorHandler = GlobalErrorHandler.getInstance();