"use client";

import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
}

class EBooksErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("EBooks Error Boundary caught an error:", error, errorInfo);
    
    // Log error for monitoring (you can integrate with your error reporting service)
    if (typeof window !== "undefined") {
      // Client-side error logging
      console.error("EBooks client error:", {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      });
    }
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} retry={this.retry} />;
    }

    return this.props.children;
  }
}

// Default error fallback component
const DefaultErrorFallback: React.FC<{ error?: Error; retry: () => void }> = ({ 
  error, 
  retry 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          کتابوں کو لوڈ کرنے میں خرابی
        </h2>
        <p className="text-gray-600 mb-6">
          معذرت، کتابوں کی فہرست لوڈ کرنے میں مسئلہ ہے۔ براہ کرم دوبارہ کوشش کریں۔
        </p>
        
        {error && process.env.NODE_ENV === "development" && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 mb-2">
              Technical Details (Development)
            </summary>
            <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
        
        <div className="space-y-3">
          <button
            onClick={retry}
            className="w-full bg-[#984A02] text-white px-6 py-3 rounded-md hover:bg-[#7a3a02] transition-colors"
          >
            دوبارہ کوشش کریں
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-500 text-white px-6 py-3 rounded-md hover:bg-gray-600 transition-colors"
          >
            صفحہ ریلوڈ کریں
          </button>
          
          <a
            href="/"
            className="block w-full bg-transparent border border-[#984A02] text-[#984A02] px-6 py-3 rounded-md hover:bg-[#984A02] hover:text-white transition-colors"
          >
            ہوم پیج پر واپس جائیں
          </a>
        </div>
      </div>
    </div>
  );
};

export default EBooksErrorBoundary;