"use client";

import { Button } from '@/components/ui/button';
import {
  MultilingualErrorHandler,
  createContentLocalizationError
} from '@/lib/multilingual-error-handler';
import { Language, getMessageText } from '@/lib/multilingual-texts';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  language: Language;
  contentType?: string;
  fallbackComponent?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

export class MultilingualErrorBoundary extends Component<Props, State> {
  private multilingualErrorHandler: MultilingualErrorHandler;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0
    };
    this.multilingualErrorHandler = MultilingualErrorHandler.getInstance();
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Create multilingual-specific error
    const multilingualError = createContentLocalizationError(
      this.props.language,
      this.props.contentType || 'unknown',
      undefined,
      error.message
    );

    // Handle the error through multilingual error handler
    this.multilingualErrorHandler.handleMultilingualError(multilingualError, false);

    // Store error info in state
    this.setState({
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: this.state.retryCount + 1
      });
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: 0
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback component if provided
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="text-center max-w-md mx-auto">
            <div className="mb-6">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {getMessageText('error', this.props.language)}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {this.props.language === 'EN' && "Something went wrong while loading this content."}
                {this.props.language === 'UR' && "اس مواد کو لوڈ کرتے وقت کچھ غلط ہوا۔"}
                {this.props.language === 'HI' && "इस सामग्री को लोड करते समय कुछ गलत हुआ।"}
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4">
                  <summary className="cursor-pointer font-medium mb-2">
                    Error Details (Development)
                  </summary>
                  <pre className="text-sm text-red-600 dark:text-red-400 whitespace-pre-wrap">
                    {this.state.error.message}
                    {this.state.error.stack && `\n\n${this.state.error.stack}`}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {this.state.retryCount < this.maxRetries && (
                <Button
                  onClick={this.handleRetry}
                  variant="default"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  {this.props.language === 'EN' && "Try Again"}
                  {this.props.language === 'UR' && "دوبارہ کوشش کریں"}
                  {this.props.language === 'HI' && "फिर से कोशिश करें"}
                </Button>
              )}

              <Button
                onClick={this.handleReset}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                {this.props.language === 'EN' && "Reset"}
                {this.props.language === 'UR' && "ری سیٹ"}
                {this.props.language === 'HI' && "रीसेट"}
              </Button>

              <Button
                onClick={this.handleGoHome}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                {this.props.language === 'EN' && "Go Home"}
                {this.props.language === 'UR' && "ہوم جائیں"}
                {this.props.language === 'HI' && "होम जाएं"}
              </Button>
            </div>

            {this.state.retryCount >= this.maxRetries && (
              <p className="text-sm text-gray-500 mt-4">
                {this.props.language === 'EN' && "Maximum retry attempts reached. Please refresh the page or contact support."}
                {this.props.language === 'UR' && "زیادہ سے زیادہ کوشش کی حد ختم ہو گئی۔ براہ کرم صفحہ ریفریش کریں یا سپورٹ سے رابطہ کریں۔"}
                {this.props.language === 'HI' && "अधिकतम पुनः प्रयास सीमा पहुंच गई। कृपया पृष्ठ को रीफ्रेश करें या सहायता से संपर्क करें।"}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export function useMultilingualErrorBoundary(language: Language, contentType?: string) {
  const [error, setError] = React.useState<Error | null>(null);
  const multilingualErrorHandler = React.useMemo(
    () => MultilingualErrorHandler.getInstance(),
    []
  );

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    const multilingualError = createContentLocalizationError(
      language,
      contentType || 'unknown',
      undefined,
      error.message
    );

    multilingualErrorHandler.handleMultilingualError(multilingualError);
    setError(error);
  }, [language, contentType, multilingualErrorHandler]);

  return {
    error,
    resetError,
    handleError
  };
}