/**
 * Tree Shaking Optimizer
 * Utilities to ensure optimal tree shaking and code splitting
 */

import React from 'react';

// Optimized date utilities
export { format, isValid, parseISO } from 'date-fns';

// Native utility implementations to avoid dependencies
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Optimized utility functions that are tree-shakeable
export const createOptimizedFetcher = () => {
  // Lazy load heavy dependencies only when needed
  return {
    async fetchWithRetry(url: string, options: RequestInit = {}, retries = 3) {
      const { withRetry } = await import('@/lib/error-handling');
      return withRetry(() => fetch(url, options), retries);
    },

    async fetchWithCache(url: string, options: RequestInit = {}) {
      const { cache } = await import('@/lib/cache-strategies');

      const cacheKey = `fetch:${url}:${JSON.stringify(options)}`;
      const cached = cache.get('static', cacheKey);

      if (cached) {
        return cached;
      }

      const response = await fetch(url, options);
      const data = await response.json();

      cache.set('static', cacheKey, data);
      return data;
    }
  };
};

// Optimized component lazy loading
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) => {
  const LazyComponent = React.lazy(importFn);

  return (props: React.ComponentProps<T>) =>
    React.createElement(
      React.Suspense,
      { fallback: fallback ? React.createElement(fallback) : null },
      React.createElement(LazyComponent, props)
    );
};

// Bundle size monitoring utilities
export const bundleMonitor = {
  // Track component render performance
  trackComponentRender: (componentName: string) => {
    if (process.env.NODE_ENV === 'development') {
      const start = performance.now();

      return () => {
        const end = performance.now();
        const duration = end - start;

        if (duration > 16) { // Slower than 60fps
          console.warn(`Component ${componentName} render took ${duration.toFixed(2)}ms`);
        }
      };
    }

    return () => { }; // No-op in production
  },

  // Track bundle chunk loading
  trackChunkLoad: (chunkName: string) => {
    if (process.env.NODE_ENV === 'development') {
      const start = performance.now();

      return () => {
        const end = performance.now();
        const duration = end - start;

        console.log(`Chunk ${chunkName} loaded in ${duration.toFixed(2)}ms`);
      };
    }

    return () => { }; // No-op in production
  }
};

// Optimized imports for common libraries
export const optimizedImports = {
  // Date utilities (tree-shakeable)
  async loadDateUtils() {
    const [
      { format },
      { parseISO },
      { isValid },
      { differenceInDays }
    ] = await Promise.all([
      import('date-fns/format'),
      import('date-fns/parseISO'),
      import('date-fns/isValid'),
      import('date-fns/differenceInDays')
    ]);

    return { format, parseISO, isValid, differenceInDays };
  }
};

// Code splitting utilities
export const codeSplitting = {
  // Split routes by feature
  createFeatureRoute: (featureName: string) => {
    return () => import(`@/app/${featureName}/page`);
  },

  // Split components by usage frequency
  createLowPriorityComponent: <T extends React.ComponentType<any>>(
    importFn: () => Promise<{ default: T }>
  ) => {
    return React.lazy(() =>
      // Add artificial delay for low priority components
      new Promise<{ default: T }>(resolve =>
        setTimeout(() => importFn().then(resolve), 100)
      )
    );
  },

  // Preload critical components
  preloadCriticalComponents: () => {
    if (typeof window !== 'undefined') {
      // Preload components that are likely to be needed soon
      const criticalImports = [
        () => import('@/app/Components/Navbar'),
        () => import('@/app/Components/Footer'),
        () => import('@/app/Components/LoadingStates')
      ];

      // Use requestIdleCallback to preload during idle time
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          criticalImports.forEach(importFn => importFn());
        });
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => {
          criticalImports.forEach(importFn => importFn());
        }, 1000);
      }
    }
  }
};

// Performance optimization hooks
export const useOptimizedPerformance = () => {
  React.useEffect(() => {
    // Preload critical components on mount
    codeSplitting.preloadCriticalComponents();
  }, []);

  const trackRender = React.useCallback((componentName: string) => {
    return bundleMonitor.trackComponentRender(componentName);
  }, []);

  return { trackRender };
};

// Export optimization utilities
export default {
  createOptimizedFetcher,
  createLazyComponent,
  bundleMonitor,
  optimizedImports,
  codeSplitting,
  useOptimizedPerformance
};