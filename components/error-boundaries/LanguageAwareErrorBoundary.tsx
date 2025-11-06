"use client";

import { useLanguage } from '@/contexts/LanguageContext';
import type { Language } from '@/lib/multilingual-texts';
import React, { ErrorInfo, ReactNode } from 'react';
import { MultilingualErrorBoundary } from './MultilingualErrorBoundary';

interface Props {
  children: ReactNode;
  /** Override language detection */
  language?: Language;
  /** Content type for error context */
  contentType?: string;
  /** Custom fallback component */
  fallbackComponent?: ReactNode;
  /** Custom error handler */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Whether to show detailed error info in development */
  showErrorDetails?: boolean;
  /** Custom recovery actions */
  recoveryActions?: {
    label: string;
    action: () => void;
  }[];
}

/**
 * Enhanced error boundary that automatically detects language context
 * and provides language-aware error handling for multilingual pages.
 */
export function LanguageAwareErrorBoundary({
  children,
  language: propLanguage,
  contentType,
  fallbackComponent,
  onError,
  showErrorDetails = process.env.NODE_ENV === 'development',
  recoveryActions = [],
}: Props) {
  // Use language from context if not provided as prop
  const { language: contextLanguage } = useLanguage();
  const effectiveLanguage = propLanguage || contextLanguage;

  return (
    <MultilingualErrorBoundary
      language={effectiveLanguage}
      contentType={contentType}
      fallbackComponent={fallbackComponent}
      onError={onError}
    >
      {children}
    </MultilingualErrorBoundary>
  );
}

/**
 * Higher-order component that wraps components with language-aware error boundary
 */
export function withLanguageAwareErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: {
    contentType?: string;
    fallbackComponent?: ReactNode;
    showErrorDetails?: boolean;
  }
) {
  const ErrorBoundaryWrapper = (props: P) => {
    return (
      <LanguageAwareErrorBoundary
        contentType={options?.contentType}
        fallbackComponent={options?.fallbackComponent}
        showErrorDetails={options?.showErrorDetails}
      >
        <WrappedComponent {...props} />
      </LanguageAwareErrorBoundary>
    );
  };

  ErrorBoundaryWrapper.displayName = `withLanguageAwareErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name
    })`;

  return ErrorBoundaryWrapper;
}

/**
 * Specialized error boundary for route-level errors in multilingual pages
 */
export function RouteErrorBoundary({
  children,
  routePath,
  language,
}: {
  children: ReactNode;
  routePath?: string;
  language?: Language;
}) {
  const handleRouteError = (error: Error, errorInfo: ErrorInfo) => {
    console.error('Route error in multilingual page:', {
      error: error.message,
      routePath,
      language,
      componentStack: errorInfo.componentStack,
    });
  };

  return (
    <LanguageAwareErrorBoundary
      language={language}
      contentType="route"
      onError={handleRouteError}
    >
      {children}
    </LanguageAwareErrorBoundary>
  );
}

/**
 * Specialized error boundary for content loading errors
 */
export function ContentErrorBoundary({
  children,
  contentId,
  contentType,
  language,
}: {
  children: ReactNode;
  contentId?: string;
  contentType: string;
  language?: Language;
}) {
  const handleContentError = (error: Error, errorInfo: ErrorInfo) => {
    console.error('Content loading error:', {
      error: error.message,
      contentId,
      contentType,
      language,
      componentStack: errorInfo.componentStack,
    });
  };

  return (
    <LanguageAwareErrorBoundary
      language={language}
      contentType={contentType}
      onError={handleContentError}
    >
      {children}
    </LanguageAwareErrorBoundary>
  );
}

/**
 * Hook for handling errors in functional components with language context
 */
export function useLanguageAwareErrorHandler(
  language?: Language,
  contentType?: string
) {
  const { language: contextLanguage } = useLanguage();
  const effectiveLanguage = language || contextLanguage;

  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    console.error('Language-aware error:', {
      error: error.message,
      language: effectiveLanguage,
      contentType,
      stack: error.stack,
    });
    setError(error);
  }, [effectiveLanguage, contentType]);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  const retryWithErrorHandling = React.useCallback(
    async (operation: () => Promise<any>): Promise<any | null> => {
      try {
        clearError();
        return await operation();
      } catch (err) {
        handleError(err as Error);
        return null;
      }
    },
    [handleError, clearError]
  );

  return {
    error,
    handleError,
    clearError,
    retryWithErrorHandling,
    hasError: error !== null,
  };
}