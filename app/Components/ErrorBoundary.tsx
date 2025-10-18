/**
 * Enhanced Error Boundary Components
 * 
 * Provides comprehensive error boundaries that work with the new
 * error handling infrastructure and support different error contexts.
 */

"use client";

import {
    ErrorContext,
    ErrorHandler,
    ErrorSeverity,
    createClientError,
    createHydrationError,
    type EnhancedError
} from "@/lib/error-handling";
import { cn } from "@/lib/utils";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import React, { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: EnhancedError | null;
  errorId: string | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: EnhancedError, errorInfo: ErrorInfo) => void;
  context?: ErrorContext;
  showErrorDetails?: boolean;
  allowRetry?: boolean;
  className?: string;
}

// Main Error Boundary Component
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private errorHandler: ErrorHandler;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null
    };
    this.errorHandler = ErrorHandler.getInstance();
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      hasError: true,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const context = this.props.context || ErrorContext.CLIENT_SIDE;
    
    // Detect if this might be a hydration error
    const isHydrationError = 
      error.message.includes('hydration') ||
      error.message.includes('server') ||
      errorInfo.componentStack?.includes('hydration');

    const enhancedError = isHydrationError
      ? createHydrationError(error.message, {
          code: 'HYDRATION_MISMATCH',
          debugInfo: {
            componentStack: errorInfo.componentStack,
            errorBoundary: this.constructor.name
          }
        })
      : createClientError(error.message, {
          code: 'COMPONENT_ERROR',
          severity: ErrorSeverity.HIGH,
          debugInfo: {
            componentStack: errorInfo.componentStack,
            errorBoundary: this.constructor.name,
            stack: error.stack
          }
        });

    this.setState({ error: enhancedError });
    this.errorHandler.handleError(enhancedError, false); // Don't show toast, we'll show UI

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(enhancedError, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: null
    });
  };

  handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <ErrorFallback
          error={this.state.error}
          errorId={this.state.errorId}
          onRetry={this.props.allowRetry ? this.handleRetry : undefined}
          onGoHome={this.handleGoHome}
          showErrorDetails={this.props.showErrorDetails}
          className={this.props.className}
        />
      );
    }

    return this.props.children;
  }
}

// Error Fallback UI Component
interface ErrorFallbackProps {
  error: EnhancedError | null;
  errorId: string | null;
  onRetry?: () => void;
  onGoHome?: () => void;
  showErrorDetails?: boolean;
  className?: string;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorId,
  onRetry,
  onGoHome,
  showErrorDetails = false,
  className
}) => {
  const getErrorMessage = () => {
    if (error?.userMessage) {
      return error.userMessage;
    }
    
    switch (error?.context) {
      case ErrorContext.HYDRATION:
        return "صفحہ لوڈ کرنے میں خرابی، براہ کرم صفحہ ریفریش کریں۔";
      case ErrorContext.SERVER_SIDE:
        return "سرور کی خرابی، براہ کرم دوبارہ کوشش کریں۔";
      case ErrorContext.CLIENT_SIDE:
        return "کچھ غلط ہوا ہے، براہ کرم دوبارہ کوشش کریں۔";
      default:
        return "ایک خرابی ہوئی ہے۔";
    }
  };

  const getSeverityColor = () => {
    switch (error?.severity) {
      case ErrorSeverity.CRITICAL:
        return "text-red-600 dark:text-red-400";
      case ErrorSeverity.HIGH:
        return "text-orange-600 dark:text-orange-400";
      case ErrorSeverity.MEDIUM:
        return "text-yellow-600 dark:text-yellow-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 text-center",
      "min-h-[300px] bg-gray-50 dark:bg-gray-900 rounded-lg border",
      className
    )}>
      <AlertTriangle className={cn("w-16 h-16 mb-4", getSeverityColor())} />
      
      <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
        خرابی ہوئی ہے
      </h2>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        {getErrorMessage()}
      </p>

      {showErrorDetails && error && (
        <details className="mb-6 text-left">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
            تکنیکی تفصیلات
          </summary>
          <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">
            <p><strong>Context:</strong> {error.context}</p>
            <p><strong>Code:</strong> {error.code || 'N/A'}</p>
            <p><strong>Error ID:</strong> {errorId}</p>
            {error.debugInfo && (
              <pre className="mt-2 whitespace-pre-wrap">
                {JSON.stringify(error.debugInfo, null, 2)}
              </pre>
            )}
          </div>
        </details>
      )}

      <div className="flex gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            دوبارہ کوشش کریں
          </button>
        )}
        
        {onGoHome && (
          <button
            onClick={onGoHome}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            ہوم پیج
          </button>
        )}
      </div>
    </div>
  );
};

// Specialized Error Boundaries for different contexts

// Data Fetching Error Boundary
export const DataFetchingErrorBoundary: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback }) => (
  <ErrorBoundary
    context={ErrorContext.CLIENT_SIDE}
    allowRetry={true}
    showErrorDetails={process.env.NODE_ENV === 'development'}
    fallback={fallback}
  >
    {children}
  </ErrorBoundary>
);

// Page-level Error Boundary
export const PageErrorBoundary: React.FC<{
  children: ReactNode;
}> = ({ children }) => (
  <ErrorBoundary
    context={ErrorContext.CLIENT_SIDE}
    allowRetry={true}
    showErrorDetails={process.env.NODE_ENV === 'development'}
    className="min-h-screen"
  >
    {children}
  </ErrorBoundary>
);

// Component-level Error Boundary
export const ComponentErrorBoundary: React.FC<{
  children: ReactNode;
  componentName?: string;
  fallback?: ReactNode;
}> = ({ children, componentName, fallback }) => (
  <ErrorBoundary
    context={ErrorContext.CLIENT_SIDE}
    allowRetry={false}
    onError={(error) => {
      if (componentName) {
        error.debugInfo = { 
          ...error.debugInfo, 
          componentName 
        };
      }
    }}
    fallback={fallback || (
      <div className="p-4 text-center text-gray-500">
        کمپوننٹ لوڈ نہیں ہو سکا
      </div>
    )}
  >
    {children}
  </ErrorBoundary>
);

// HOC for wrapping components with error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryProps>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}