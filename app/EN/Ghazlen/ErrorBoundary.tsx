"use client";
import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry?: () => void }>;
}

class GhazlenErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("EN Ghazlen Error Boundary caught an error:", error, errorInfo);
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

// Default error fallback component for English
const DefaultErrorFallback: React.FC<{ error?: Error; retry?: () => void }> = ({ 
  error, 
  retry 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Something went wrong
        </h2>
        <p className="text-gray-600 mb-6">
          There was a problem loading the ghazals. Please try again.
        </p>
        {error && process.env.NODE_ENV === 'development' && (
          <details className="mb-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500">
              Technical Details (Development)
            </summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
        <div className="flex gap-4 justify-center">
          {retry && (
            <button
              onClick={retry}
              className="px-4 py-2 bg-[#984A02] text-white rounded hover:bg-[#7a3a02] transition-colors"
            >
              Try Again
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 border border-[#984A02] text-[#984A02] rounded hover:bg-[#984A02] hover:text-white transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default GhazlenErrorBoundary;