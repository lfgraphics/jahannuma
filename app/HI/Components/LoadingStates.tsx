/**
 * Enhanced Loading State Components
 * 
 * Provides consistent loading states across the application that work
 * with the new universal data fetching infrastructure.
 */

import { cn } from "@/lib/utils";
import React from "react";

// Loading state types
export type LoadingVariant = 
  | "skeleton" 
  | "spinner" 
  | "pulse" 
  | "shimmer" 
  | "minimal";

export type LoadingSize = "sm" | "md" | "lg" | "xl";

export interface LoadingStateProps {
  variant?: LoadingVariant;
  size?: LoadingSize;
  className?: string;
  message?: string;
  showMessage?: boolean;
}

// Base skeleton component
export const SkeletonLine: React.FC<{
  width?: string;
  height?: string;
  className?: string;
}> = ({ width = "100%", height = "1rem", className }) => (
  <div
    className={cn(
      "animate-pulse bg-gray-200 dark:bg-gray-700 rounded",
      className
    )}
    style={{ width, height }}
  />
);

// Card skeleton for data cards
export const DataCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("p-4 border rounded-lg space-y-3", className)}>
    <SkeletonLine height="1.5rem" width="80%" />
    <SkeletonLine height="1rem" width="60%" />
    <SkeletonLine height="1rem" width="90%" />
    <div className="flex justify-between items-center pt-2">
      <SkeletonLine height="0.875rem" width="40%" />
      <SkeletonLine height="2rem" width="5rem" />
    </div>
  </div>
);

// List skeleton for multiple items
export const ListSkeleton: React.FC<{
  count?: number;
  variant?: "card" | "line";
  className?: string;
}> = ({ count = 6, variant = "card", className }) => (
  <div className={cn("space-y-4", className)}>
    {Array.from({ length: count }).map((_, index) => (
      <div key={index}>
        {variant === "card" ? (
          <DataCardSkeleton />
        ) : (
          <div className="space-y-2">
            <SkeletonLine height="1.25rem" width="70%" />
            <SkeletonLine height="1rem" width="50%" />
          </div>
        )}
      </div>
    ))}
  </div>
);

// Grid skeleton for grid layouts
export const GridSkeleton: React.FC<{
  count?: number;
  columns?: number;
  className?: string;
}> = ({ count = 8, columns = 4, className }) => (
  <div 
    className={cn(
      "grid gap-4",
      {
        "grid-cols-1 md:grid-cols-2 lg:grid-cols-4": columns === 4,
        "grid-cols-1 md:grid-cols-2 lg:grid-cols-3": columns === 3,
        "grid-cols-1 md:grid-cols-2": columns === 2,
        "grid-cols-1": columns === 1,
      },
      className
    )}
  >
    {Array.from({ length: count }).map((_, index) => (
      <DataCardSkeleton key={index} />
    ))}
  </div>
);

// Spinner component
export const Spinner: React.FC<{
  size?: LoadingSize;
  className?: string;
}> = ({ size = "md", className }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
        sizeClasses[size],
        className
      )}
    />
  );
};

// Logo pulse loader (existing pattern)
export const LogoPulseLoader: React.FC<{
  size?: LoadingSize;
  className?: string;
}> = ({ size = "lg", className }) => {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-20 h-20", 
    lg: "w-24 h-24",
    xl: "w-32 h-32"
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <img
        src="/logo.png"
        alt="Loading..."
        className={cn("animate-pulse", sizeClasses[size])}
      />
    </div>
  );
};

// Main loading state component
export const LoadingState: React.FC<LoadingStateProps> = ({
  variant = "skeleton",
  size = "md",
  className,
  message,
  showMessage = false
}) => {
  const renderLoadingContent = () => {
    switch (variant) {
      case "spinner":
        return <Spinner size={size} />;
      case "pulse":
        return <LogoPulseLoader size={size} />;
      case "shimmer":
        return <ListSkeleton count={3} variant="line" />;
      case "minimal":
        return <SkeletonLine height="2rem" width="50%" />;
      case "skeleton":
      default:
        return <GridSkeleton count={6} />;
    }
  };

  return (
    <div className={cn("flex flex-col items-center justify-center p-4", className)}>
      {renderLoadingContent()}
      {showMessage && message && (
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
          {message}
        </p>
      )}
    </div>
  );
};

// Page-level loading component
export const PageLoader: React.FC<{
  message?: string;
  fullScreen?: boolean;
}> = ({ message = "لوڈ ہو رہا ہے...", fullScreen = false }) => (
  <div 
    className={cn(
      "flex flex-col items-center justify-center",
      fullScreen ? "min-h-screen" : "min-h-[50vh]"
    )}
  >
    <LogoPulseLoader size="xl" />
    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
      {message}
    </p>
  </div>
);

// Component-level loading wrapper
export const ComponentLoader: React.FC<{
  isLoading: boolean;
  error?: Error | null;
  fallback?: React.ReactNode;
  children: React.ReactNode;
  loadingVariant?: LoadingVariant;
  errorMessage?: string;
}> = ({ 
  isLoading, 
  error, 
  fallback, 
  children, 
  loadingVariant = "skeleton",
  errorMessage = "کوئی مواد نہیں ملا"
}) => {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-red-600 dark:text-red-400 mb-2">
          خرابی ہوئی ہے
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {error.message || errorMessage}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <LoadingState variant={loadingVariant} />
    );
  }

  return <>{children}</>;
};

// Inline loading button
export const LoadingButton: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}> = ({ 
  isLoading, 
  children, 
  loadingText = "لوڈ ہو رہا ہے...",
  className,
  disabled,
  onClick
}) => (
  <button
    className={cn(
      "flex items-center justify-center gap-2 px-4 py-2 rounded",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      className
    )}
    disabled={disabled || isLoading}
    onClick={onClick}
  >
    {isLoading && <Spinner size="sm" />}
    {isLoading ? loadingText : children}
  </button>
);

// Export legacy components for backward compatibility
export { default as Loader } from "./Loader";
export { default as UnwanPageLoader } from "./UnwanPageLoader";
export { default as ComponentsLoader } from "./shaer/ComponentsLoader";
