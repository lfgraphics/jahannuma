/**
 * Performance Monitoring System
 * Implements logging for data fetching performance, build time monitoring, and API failure alerts
 */

import { logger } from "@/lib/logging";


// Performance metrics types
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percentage';
  timestamp: number;
  tags?: Record<string, string>;
}

export interface DataFetchingMetrics {
  operation: string;
  duration: number;
  success: boolean;
  cacheHit: boolean;
  dataSize?: number;
  endpoint: string;
  timestamp: number;
}

export interface BuildTimeMetrics {
  phase: string;
  duration: number;
  success: boolean;
  errors?: string[];
  timestamp: number;
}

export interface APIFailureMetrics {
  endpoint: string;
  method: string;
  statusCode: number;
  errorMessage: string;
  duration: number;
  timestamp: number;
  retryCount?: number;
}

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  dataFetching: {
    slow: 2000, // 2 seconds
    critical: 5000 // 5 seconds
  },
  buildTime: {
    slow: 30000, // 30 seconds
    critical: 120000 // 2 minutes
  },
  apiFailureRate: {
    warning: 0.05, // 5%
    critical: 0.15 // 15%
  }
} as const;

/**
 * Performance Monitor class for tracking various metrics
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private dataFetchingMetrics: DataFetchingMetrics[] = [];
  private buildTimeMetrics: BuildTimeMetrics[] = [];
  private apiFailureMetrics: APIFailureMetrics[] = [];
  private maxMetricsHistory = 1000;

  private constructor() { }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  /**
    * Record a general performance metric
    */
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    this.trimHistory(this.metrics, this.maxMetricsHistory);

    logger.debug('PERFORMANCE_METRIC', `${metric.name}: ${metric.value}${metric.unit}`, {
      metric,
      tags: metric.tags
    });
  }

  /**
   * Record data fetching performance
   */
  recordDataFetching(metrics: DataFetchingMetrics): void {
    this.dataFetchingMetrics.push(metrics);
    this.trimHistory(this.dataFetchingMetrics, this.maxMetricsHistory);

    const level = this.getPerformanceLevel(metrics.duration, PERFORMANCE_THRESHOLDS.dataFetching);
    const logLevel = level === 'critical' ? 'error' : level === 'slow' ? 'warn' : 'info';

    console[logLevel](`[DATA_FETCHING_PERFORMANCE] ${metrics.operation} took ${metrics.duration}ms`, {
      ...metrics,
      performanceLevel: level,
      cacheStatus: metrics.cacheHit ? 'HIT' : 'MISS'
    });

    // Alert on critical performance
    if (level === 'critical') {
      this.triggerAlert('DATA_FETCHING_SLOW', {
        operation: metrics.operation,
        duration: metrics.duration,
        threshold: PERFORMANCE_THRESHOLDS.dataFetching.critical
      });
    }
  }

  /**
   * Record build time performance
   */
  recordBuildTime(metrics: BuildTimeMetrics): void {
    this.buildTimeMetrics.push(metrics);
    this.trimHistory(this.buildTimeMetrics, this.maxMetricsHistory);

    const level = this.getPerformanceLevel(metrics.duration, PERFORMANCE_THRESHOLDS.buildTime);
    const logLevel = level === 'critical' ? 'error' : level === 'slow' ? 'warn' : 'info';

    console[logLevel](`[BUILD_TIME_PERFORMANCE] Build phase '${metrics.phase}' took ${metrics.duration}ms`, {
      ...metrics,
      performanceLevel: level
    });

    if (level === 'critical') {
      this.triggerAlert('BUILD_TIME_SLOW', {
        phase: metrics.phase,
        duration: metrics.duration,
        threshold: PERFORMANCE_THRESHOLDS.buildTime.critical
      });
    }
  }

  /**
   * Record API failure
   */
  recordAPIFailure(metrics: APIFailureMetrics): void {
    this.apiFailureMetrics.push(metrics);
    this.trimHistory(this.apiFailureMetrics, this.maxMetricsHistory);

    console.error(`[API_FAILURE] API call failed: ${metrics.method} ${metrics.endpoint}`, metrics);

    // Check failure rate and trigger alerts if needed
    this.checkAPIFailureRate(metrics.endpoint);
  }

  /**
   * Get performance statistics
   */
  getStats(): {
    dataFetching: any;
    buildTime: any;
    apiFailures: any;
  } {
    return {
      dataFetching: this.analyzeDataFetchingMetrics(),
      buildTime: this.analyzeBuildTimeMetrics(),
      apiFailures: this.analyzeAPIFailureMetrics()
    };
  }

  private getPerformanceLevel(duration: number, thresholds: { slow: number; critical: number }): 'good' | 'slow' | 'critical' {
    if (duration >= thresholds.critical) return 'critical';
    if (duration >= thresholds.slow) return 'slow';
    return 'good';
  }

  private trimHistory<T>(array: T[], maxSize: number): void {
    if (array.length > maxSize) {
      array.splice(0, array.length - maxSize);
    }
  }

  private triggerAlert(type: string, data: any): void {
    console.error(`[PERFORMANCE_ALERT] Performance alert: ${type}`, {
      alertType: type,
      alertData: data,
      timestamp: Date.now()
    });

    // In a real application, you might send this to an external monitoring service
    // like DataDog, New Relic, or a custom alerting system
  }

  private checkAPIFailureRate(endpoint: string): void {
    const recentFailures = this.apiFailureMetrics.filter(
      m => m.endpoint === endpoint && Date.now() - m.timestamp < 300000 // Last 5 minutes
    );

    if (recentFailures.length >= 5) { // At least 5 failures to calculate rate
      const failureRate = recentFailures.length / 10; // Assuming 10 total requests (simplified)

      if (failureRate >= PERFORMANCE_THRESHOLDS.apiFailureRate.critical) {
        this.triggerAlert('API_FAILURE_RATE_CRITICAL', {
          endpoint,
          failureRate,
          threshold: PERFORMANCE_THRESHOLDS.apiFailureRate.critical,
          recentFailures: recentFailures.length
        });
      } else if (failureRate >= PERFORMANCE_THRESHOLDS.apiFailureRate.warning) {
        this.triggerAlert('API_FAILURE_RATE_WARNING', {
          endpoint,
          failureRate,
          threshold: PERFORMANCE_THRESHOLDS.apiFailureRate.warning,
          recentFailures: recentFailures.length
        });
      }
    }
  }

  private analyzeDataFetchingMetrics() {
    if (this.dataFetchingMetrics.length === 0) return null;

    const durations = this.dataFetchingMetrics.map(m => m.duration);
    const cacheHitRate = this.dataFetchingMetrics.filter(m => m.cacheHit).length / this.dataFetchingMetrics.length;
    const successRate = this.dataFetchingMetrics.filter(m => m.success).length / this.dataFetchingMetrics.length;

    return {
      totalRequests: this.dataFetchingMetrics.length,
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      medianDuration: this.calculateMedian(durations),
      p95Duration: this.calculatePercentile(durations, 95),
      cacheHitRate,
      successRate,
      slowRequests: durations.filter(d => d >= PERFORMANCE_THRESHOLDS.dataFetching.slow).length,
      criticalRequests: durations.filter(d => d >= PERFORMANCE_THRESHOLDS.dataFetching.critical).length
    };
  }

  private analyzeBuildTimeMetrics() {
    if (this.buildTimeMetrics.length === 0) return null;

    const durations = this.buildTimeMetrics.map(m => m.duration);
    const successRate = this.buildTimeMetrics.filter(m => m.success).length / this.buildTimeMetrics.length;

    return {
      totalBuilds: this.buildTimeMetrics.length,
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      medianDuration: this.calculateMedian(durations),
      successRate,
      slowBuilds: durations.filter(d => d >= PERFORMANCE_THRESHOLDS.buildTime.slow).length,
      criticalBuilds: durations.filter(d => d >= PERFORMANCE_THRESHOLDS.buildTime.critical).length
    };
  }

  private analyzeAPIFailureMetrics() {
    if (this.apiFailureMetrics.length === 0) return null;

    const endpointFailures = this.apiFailureMetrics.reduce((acc, m) => {
      acc[m.endpoint] = (acc[m.endpoint] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusCodes = this.apiFailureMetrics.reduce((acc, m) => {
      acc[m.statusCode] = (acc[m.statusCode] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return {
      totalFailures: this.apiFailureMetrics.length,
      endpointFailures,
      statusCodes,
      mostFailedEndpoint: Object.entries(endpointFailures).sort(([, a], [, b]) => b - a)[0]
    };
  }

  private calculateMedian(numbers: number[]): number {
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }

  private calculatePercentile(numbers: number[], percentile: number): number {
    const sorted = [...numbers].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }
}

/**
 * Performance timing utilities
 */
export class PerformanceTimer {
  private startTime: number;
  private name: string;
  private tags: Record<string, string>;

  constructor(name: string, tags: Record<string, string> = {}) {
    this.name = name;
    this.tags = tags;
    this.startTime = performance.now();
  }

  /**
   * End timing and record the metric
   */
  end(): number {
    const duration = performance.now() - this.startTime;

    PerformanceMonitor.getInstance().recordMetric({
      name: this.name,
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      tags: this.tags
    });

    return duration;
  }

  /**
   * End timing and record as data fetching metric
   */
  endDataFetching(options: {
    operation: string;
    success: boolean;
    cacheHit: boolean;
    dataSize?: number;
    endpoint: string;
  }): number {
    const duration = performance.now() - this.startTime;

    PerformanceMonitor.getInstance().recordDataFetching({
      ...options,
      duration,
      timestamp: Date.now()
    });

    return duration;
  }

  /**
   * End timing and record as build time metric
   */
  endBuildTime(options: {
    phase: string;
    success: boolean;
    errors?: string[];
  }): number {
    const duration = performance.now() - this.startTime;

    PerformanceMonitor.getInstance().recordBuildTime({
      ...options,
      duration,
      timestamp: Date.now()
    });

    return duration;
  }
}

// Global performance monitor instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Convenience functions
export const startTimer = (name: string, tags?: Record<string, string>) =>
  new PerformanceTimer(name, tags);

export const recordDataFetching = (metrics: DataFetchingMetrics) =>
  performanceMonitor.recordDataFetching(metrics);

export const recordBuildTime = (metrics: BuildTimeMetrics) =>
  performanceMonitor.recordBuildTime(metrics);

export const recordAPIFailure = (metrics: APIFailureMetrics) =>
  performanceMonitor.recordAPIFailure(metrics);

export const getPerformanceStats = () =>
  performanceMonitor.getStats();