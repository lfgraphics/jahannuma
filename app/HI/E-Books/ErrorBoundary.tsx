"use client";

import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
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
    console.error("E-Books Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              कुछ गलत हुआ
            </h2>
            <p className="text-gray-600 mb-6">
              ई-बुक्स पेज लोड करते समय एक त्रुटि हुई।
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="bg-[#984A02] text-white px-6 py-2 rounded-md hover:bg-[#7a3502] transition-colors"
            >
              फिर से कोशिश करें
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default EBooksErrorBoundary;