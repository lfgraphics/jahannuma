/**
 * Performance monitoring utilities for lazy loading
 * Tracks loading times, bundle sizes, and optimization metrics
 */

import type { Language } from '@/lib/multilingual-texts';

/**
 * Performance metrics for lazy loading
 */
export interface LazyLoadingMetrics {
  /** Component name */
  componentName: string;
  /** Language */
  language: Language;
  /** Load start time */
  loadStartTime: number;
  /** Load end time */
  loadEndTime?: number;
  /** Total load duration in milliseconds */
  loadDuration?: number;
  /** Bundle size in bytes */
  bundleSize?: number;
  /** Whether component was preloaded */
  wasPreloaded: boolean;
  /** Error during loading */
  error?: string;
  /** Cache hit/miss */
  cacheHit: boolean;
}

/**
 * Performance monitoring class for lazy loading
 */
export class LazyLoadingPerformanceMonitor {
  private static metrics: LazyLoadingMetrics[] = [];
  private static loadingComponents = new Map<string, LazyLoadingMetrics>();
  private static preloadedComponents = new Set<string>();

  /**
   * Start tracking component loading
   */
  static startLoading(componentName: string, language: Language): void {
    const key = `${language}-${componentName}`;
    const wasPreloaded = this.preloadedComponents.has(key);

    const metric: LazyLoadingMetrics = {
      componentName,
      language,
      loadStartTime: performance.now(),
      wasPreloaded,
      cacheHit: false,
    };

    this.loadingComponents.set(key, metric);
  }

  /**
   * End tracking component loading
   */
  static endLoading(
    componentName: string,
    language: Language,
    success: boolean = true,
    error?: string
  ): void {
    const key = `${language}-${componentName}`;
    const metric = this.loadingComponents.get(key);

    if (metric) {
      metric.loadEndTime = performance.now();
      metric.loadDuration = metric.loadEndTime - metric.loadStartTime;

      if (!success && error) {
        metric.error = error;
      }

      this.metrics.push(metric);
      this.loadingComponents.delete(key);

      // Log performance data
      this.logPerformanceData(metric);
    }
  }

  /**
   * Mark component as preloaded
   */
  static markAsPreloaded(componentName: string, language: Language): void {
    const key = `${language}-${componentName}`;
    this.preloadedComponents.add(key);
  }

  /**
   * Get performance metrics
   */
  static getMetrics(): LazyLoadingMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get metrics for a specific language
   */
  static getLanguageMetrics(language: Language): LazyLoadingMetrics[] {
    return this.metrics.filter(metric => metric.language === language);
  }

  /**
   * Get average loading time for a component
   */
  static getAverageLoadTime(componentName: string, language?: Language): number {
    const relevantMetrics = this.metrics.filter(metric => {
      const matchesComponent = metric.componentName === componentName;
      const matchesLanguage = !language || metric.language === language;
      return matchesComponent && matchesLanguage && metric.loadDuration;
    });

    if (relevantMetrics.length === 0) return 0;

    const totalTime = relevantMetrics.reduce(
      (sum, metric) => sum + (metric.loadDuration || 0),
      0
    );

    return totalTime / relevantMetrics.length;
  }

  /**
   * Get performance summary
   */
  static getPerformanceSummary(): {
    totalComponents: number;
    averageLoadTime: number;
    preloadedComponents: number;
    failedLoads: number;
    languageBreakdown: Record<Language, number>;
  } {
    const totalComponents = this.metrics.length;
    const preloadedComponents = this.metrics.filter(m => m.wasPreloaded).length;
    const failedLoads = this.metrics.filter(m => m.error).length;

    const totalLoadTime = this.metrics.reduce(
      (sum, metric) => sum + (metric.loadDuration || 0),
      0
    );
    const averageLoadTime = totalComponents > 0 ? totalLoadTime / totalComponents : 0;

    const languageBreakdown: Partial<Record<Language, number>> = {};
    this.metrics.forEach(metric => {
      languageBreakdown[metric.language] = (languageBreakdown[metric.language] || 0) + 1;
    });

    return {
      totalComponents,
      averageLoadTime,
      preloadedComponents,
      failedLoads,
      languageBreakdown: languageBreakdown as Record<Language, number>,
    };
  }

  /**
   * Log performance data to console (development only)
   */
  private static logPerformanceData(metric: LazyLoadingMetrics): void {
    if (process.env.NODE_ENV === 'development') {
      const { componentName, language, loadDuration, wasPreloaded, error } = metric;

      if (error) {
        console.warn(`❌ Failed to load ${componentName} (${language}):`, error);
      } else {
        const preloadStatus = wasPreloaded ? '⚡ (preloaded)' : '🔄';
        console.log(
          `✅ Loaded ${componentName} (${language}) in ${loadDuration?.toFixed(2)}ms ${preloadStatus}`
        );
      }
    }
  }

  /**
   * Export metrics for analysis
   */
  static exportMetrics(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      summary: this.getPerformanceSummary(),
    }, null, 2);
  }

  /**
   * Clear all metrics (useful for testing)
   */
  static clearMetrics(): void {
    this.metrics = [];
    this.loadingComponents.clear();
    this.preloadedComponents.clear();
  }
}

/**
 * Higher-order function to wrap component loading with performance tracking
 */
export function withPerformanceTracking<T>(
  componentName: string,
  language: Language,
  loader: () => Promise<T>
): () => Promise<T> {
  return async () => {
    LazyLoadingPerformanceMonitor.startLoading(componentName, language);

    try {
      const result = await loader();
      LazyLoadingPerformanceMonitor.endLoading(componentName, language, true);
      return result;
    } catch (error) {
      LazyLoadingPerformanceMonitor.endLoading(
        componentName,
        language,
        false,
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  };
}

/**
 * Bundle size estimation utilities
 */
export class BundleSizeEstimator {
  private static componentSizes = new Map<string, number>();

  /**
   * Estimate bundle size for a component
   */
  static estimateSize(componentName: string, language: Language): number {
    const key = `${language}-${componentName}`;
    return this.componentSizes.get(key) || 0;
  }

  /**
   * Record actual bundle size
   */
  static recordSize(componentName: string, language: Language, size: number): void {
    const key = `${language}-${componentName}`;
    this.componentSizes.set(key, size);
  }

  /**
   * Get total estimated bundle size for a language
   */
  static getTotalLanguageSize(language: Language): number {
    let total = 0;
    this.componentSizes.forEach((size, key) => {
      if (key.startsWith(`${language}-`)) {
        total += size;
      }
    });
    return total;
  }

  /**
   * Get size breakdown by component
   */
  static getSizeBreakdown(): Record<string, number> {
    const breakdown: Record<string, number> = {};
    this.componentSizes.forEach((size, key) => {
      breakdown[key] = size;
    });
    return breakdown;
  }
}

/**
 * Performance optimization recommendations
 */
export class PerformanceOptimizer {
  /**
   * Analyze performance and provide recommendations
   */
  static analyzePerformance(): {
    recommendations: string[];
    criticalIssues: string[];
    optimizationOpportunities: string[];
  } {
    const summary = LazyLoadingPerformanceMonitor.getPerformanceSummary();
    const recommendations: string[] = [];
    const criticalIssues: string[] = [];
    const optimizationOpportunities: string[] = [];

    // Check average load time
    if (summary.averageLoadTime > 1000) {
      criticalIssues.push('Average component load time exceeds 1 second');
      recommendations.push('Consider preloading critical components');
    } else if (summary.averageLoadTime > 500) {
      optimizationOpportunities.push('Component load times could be improved');
    }

    // Check failed loads
    if (summary.failedLoads > 0) {
      criticalIssues.push(`${summary.failedLoads} components failed to load`);
      recommendations.push('Implement better error handling and fallbacks');
    }

    // Check preloading effectiveness
    const preloadRatio = summary.preloadedComponents / summary.totalComponents;
    if (preloadRatio < 0.3) {
      optimizationOpportunities.push('Consider preloading more critical components');
    }

    // Language-specific recommendations
    Object.entries(summary.languageBreakdown).forEach(([language, count]) => {
      if (count > 10) {
        optimizationOpportunities.push(
          `Consider further code splitting for ${language} language (${count} components)`
        );
      }
    });

    return {
      recommendations,
      criticalIssues,
      optimizationOpportunities,
    };
  }

  /**
   * Get performance score (0-100)
   */
  static getPerformanceScore(): number {
    const summary = LazyLoadingPerformanceMonitor.getPerformanceSummary();
    let score = 100;

    // Deduct points for slow loading
    if (summary.averageLoadTime > 1000) {
      score -= 30;
    } else if (summary.averageLoadTime > 500) {
      score -= 15;
    }

    // Deduct points for failed loads
    if (summary.failedLoads > 0) {
      score -= Math.min(40, summary.failedLoads * 10);
    }

    // Add points for preloading
    const preloadRatio = summary.preloadedComponents / summary.totalComponents;
    score += Math.floor(preloadRatio * 20);

    return Math.max(0, Math.min(100, score));
  }
}