/**
 * Performance monitoring and optimization utilities.
 */

/**
 * Debounce function to limit rapid function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle function to limit function calls to once per interval
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Measure function execution time
 */
export function measurePerformance<T>(name: string, fn: () => T): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();

  console.log(`${name} took ${(end - start).toFixed(2)} milliseconds`);
  return result;
}

/**
 * Lazy loading helper for components
 */
export function lazy<T extends React.ComponentType<any>>(
  importFunction: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(importFunction);
}

/**
 * Preload image
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Intersection Observer helper for lazy loading
 */
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
): IntersectionObserver {
  return new IntersectionObserver(callback, {
    rootMargin: "10px",
    threshold: 0.1,
    ...options,
  });
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Get device info for performance optimization
 */
export function getDeviceInfo() {
  if (typeof navigator === "undefined") {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      connection: null,
    };
  }

  const userAgent = navigator.userAgent;
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent
    );
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);

  return {
    isMobile: isMobile && !isTablet,
    isTablet,
    isDesktop: !isMobile,
    connection: (navigator as any).connection || null,
  };
}

// React import at the top for the lazy function
import * as React from "react";
