/**
 * Debugging Utilities for Data Fetching
 * 
 * Provides comprehensive debugging tools for diagnosing data fetching
 * issues, URL construction problems, and API communication failures.
 */

import { logger } from "./logging";
import {
  getUniversalFetcher,
  type DataFetcherOptions
} from "./universal-data-fetcher";
import { getURLBuilder } from "./url-builder";

// Debug information interfaces
export interface URLDebugInfo {
  originalConfig: any;
  constructedURL: string;
  isValid: boolean;
  environment: 'server' | 'client';
  baseURL: string;
  errors: string[];
  warnings: string[];
}

export interface DataFetchDebugInfo {
  operation: string;
  params: any;
  url: string;
  environment: 'server' | 'client';
  startTime: number;
  endTime?: number;
  duration?: number;
  success: boolean;
  result?: any;
  error?: any;
  cacheHit?: boolean;
  retryAttempts?: number;
}

export interface SystemHealthInfo {
  environment: 'server' | 'client' | 'build';
  timestamp: string;
  urlBuilder: {
    available: boolean;
    baseURL: string;
    context: any;
  };
  universalFetcher: {
    available: boolean;
    canTestConnection: boolean;
    connectionTest?: boolean;
  };
  airtableAPI: {
    configured: boolean;
    baseId?: string;
    hasApiKey: boolean;
  };
  errors: string[];
  warnings: string[];
}

// Debug utility class
export class DataFetchingDebugger {
  private static instance: DataFetchingDebugger;
  private debugHistory: DataFetchDebugInfo[] = [];
  private maxHistorySize = 100;

  static getInstance(): DataFetchingDebugger {
    if (!DataFetchingDebugger.instance) {
      DataFetchingDebugger.instance = new DataFetchingDebugger();
    }
    return DataFetchingDebugger.instance;
  }

  // URL debugging
  debugURL(config: any): URLDebugInfo {
    const urlBuilder = getURLBuilder();
    const errors: string[] = [];
    const warnings: string[] = [];

    let constructedURL = '';
    let isValid = false;

    try {
      // Test URL construction
      if (urlBuilder.isServer()) {
        constructedURL = urlBuilder.buildServerURL(config);
      } else {
        constructedURL = urlBuilder.buildClientURL(config);
      }

      // Validate the constructed URL
      new URL(constructedURL, urlBuilder.getBaseURL());
      isValid = true;
    } catch (error) {
      errors.push(`URL construction failed: ${(error as Error).message}`);
    }

    // Check for common issues
    if (!config.apiPath) {
      errors.push('Missing apiPath in configuration');
    }

    if (config.apiPath && !config.apiPath.startsWith('/')) {
      warnings.push('apiPath should start with "/"');
    }

    if (urlBuilder.isServer() && !urlBuilder.getBaseURL()) {
      errors.push('Base URL not configured for server environment');
    }

    const debugInfo: URLDebugInfo = {
      originalConfig: config,
      constructedURL,
      isValid,
      environment: urlBuilder.isServer() ? 'server' : 'client',
      baseURL: urlBuilder.getBaseURL(),
      errors,
      warnings
    };

    logger.debug('URL_DEBUG', 'URL debug analysis completed', debugInfo);
    return debugInfo;
  }

  // Data fetching debugging
  async debugDataFetch(
    operation: string,
    params: any,
    options?: DataFetcherOptions
  ): Promise<DataFetchDebugInfo> {
    const startTime = performance.now();
    const universalFetcher = getUniversalFetcher();

    const debugInfo: DataFetchDebugInfo = {
      operation,
      params,
      url: 'unknown',
      environment: universalFetcher.isServer() ? 'server' : 'client',
      startTime,
      success: false,
      retryAttempts: 0
    };

    try {
      // Construct URL for debugging
      if (params.kind === 'list') {
        const urlBuilder = getURLBuilder();
        const urlConfig = {
          apiPath: `/api/airtable/${params.table}`,
          params: params.params
        };
        debugInfo.url = urlBuilder.isServer()
          ? urlBuilder.buildServerURL(urlConfig)
          : urlBuilder.buildClientURL(urlConfig);
      }

      // Perform the actual fetch
      let result;
      if (params.kind === 'list') {
        result = await universalFetcher.fetchList(params, options);
      } else {
        result = await universalFetcher.fetchRecord(params, options);
      }

      debugInfo.endTime = performance.now();
      debugInfo.duration = debugInfo.endTime - debugInfo.startTime;
      debugInfo.success = true;
      debugInfo.result = {
        recordCount: Array.isArray((result as any)?.records) ? (result as any).records.length : 'unknown',
        hasOffset: !!((result as any)?.offset),
        cacheSource: (result as any)?.source || 'unknown'
      };

    } catch (error) {
      debugInfo.endTime = performance.now();
      debugInfo.duration = debugInfo.endTime - debugInfo.startTime;
      debugInfo.success = false;
      debugInfo.error = {
        message: (error as Error).message,
        code: (error as any).code,
        statusCode: (error as any).statusCode,
        context: (error as any).context
      };
    }

    // Add to history
    this.debugHistory.unshift(debugInfo);
    if (this.debugHistory.length > this.maxHistorySize) {
      this.debugHistory.pop();
    }

    logger.debug('DATA_FETCH_DEBUG', 'Data fetch debug completed', debugInfo);
    return debugInfo;
  }

  // System health check
  async checkSystemHealth(): Promise<SystemHealthInfo> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check URL builder
    let urlBuilderInfo;
    try {
      const urlBuilder = getURLBuilder();
      urlBuilderInfo = {
        available: true,
        baseURL: urlBuilder.getBaseURL(),
        context: urlBuilder.getEnvironmentContext()
      };

      if (!urlBuilderInfo.baseURL) {
        errors.push('Base URL not configured');
      }
    } catch (error) {
      errors.push(`URL builder error: ${(error as Error).message}`);
      urlBuilderInfo = {
        available: false,
        baseURL: '',
        context: null
      };
    }

    // Check universal fetcher
    let universalFetcherInfo;
    try {
      const universalFetcher = getUniversalFetcher();
      universalFetcherInfo = {
        available: true,
        canTestConnection: true,
        connectionTest: await universalFetcher.testConnection()
      };

      if (!universalFetcherInfo.connectionTest) {
        warnings.push('Universal fetcher connection test failed');
      }
    } catch (error) {
      errors.push(`Universal fetcher error: ${(error as Error).message}`);
      universalFetcherInfo = {
        available: false,
        canTestConnection: false
      };
    }

    // Check Airtable configuration
    const airtableInfo = {
      configured: !!(process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID),
      baseId: process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID,
      hasApiKey: !!(process.env.NEXT_PUBLIC_Api_Token || process.env.AIRTABLE_API_KEY)
    };

    if (!airtableInfo.configured) {
      errors.push('Airtable base ID not configured');
    }

    if (!airtableInfo.hasApiKey) {
      errors.push('Airtable API key not configured');
    }

    const healthInfo: SystemHealthInfo = {
      environment: typeof window === 'undefined' ? 'server' : 'client',
      timestamp: new Date().toISOString(),
      urlBuilder: urlBuilderInfo,
      universalFetcher: universalFetcherInfo,
      airtableAPI: airtableInfo,
      errors,
      warnings
    };

    logger.info('SYSTEM_HEALTH', 'System health check completed', healthInfo);
    return healthInfo;
  }

  // Test specific endpoints
  async testEndpoint(
    baseId: string,
    table: string,
    params?: any
  ): Promise<DataFetchDebugInfo> {
    const testParams = {
      kind: 'list' as const,
      baseId,
      table,
      params: { pageSize: 1, ...params }
    };

    return this.debugDataFetch(`Test ${table} endpoint`, testParams, {
      cache: false,
      throwOnError: false,
      debug: true
    });
  }

  // Get debug history
  getDebugHistory(count = 20): DataFetchDebugInfo[] {
    return this.debugHistory.slice(0, count);
  }

  // Clear debug history
  clearDebugHistory(): void {
    this.debugHistory = [];
    logger.info('DATA_FETCH_DEBUG', 'Debug history cleared');
  }

  // Generate debug report
  generateDebugReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      environment: typeof window === 'undefined' ? 'server' : 'client',
      recentHistory: this.getDebugHistory(10),
      systemHealth: null as any // Will be filled async
    };

    // Note: This is synchronous, so we can't include async system health
    // In a real implementation, you might want to make this async

    return JSON.stringify(report, null, 2);
  }

  // Performance analysis
  analyzePerformance(): {
    averageDuration: number;
    slowestOperations: DataFetchDebugInfo[];
    failureRate: number;
    commonErrors: Record<string, number>;
  } {
    const history = this.debugHistory;

    if (history.length === 0) {
      return {
        averageDuration: 0,
        slowestOperations: [],
        failureRate: 0,
        commonErrors: {}
      };
    }

    const durations = history
      .filter(h => h.duration !== undefined)
      .map(h => h.duration!);

    const averageDuration = durations.length > 0
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length
      : 0;

    const slowestOperations = history
      .filter(h => h.duration !== undefined)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, 5);

    const failures = history.filter(h => !h.success);
    const failureRate = failures.length / history.length;

    const commonErrors: Record<string, number> = {};
    failures.forEach(f => {
      const errorCode = f.error?.code || 'UNKNOWN';
      commonErrors[errorCode] = (commonErrors[errorCode] || 0) + 1;
    });

    return {
      averageDuration,
      slowestOperations,
      failureRate,
      commonErrors
    };
  }
}

// Convenience functions
export const debugInstance = DataFetchingDebugger.getInstance();

export const debugURL = (config: any) => debugInstance.debugURL(config);
export const debugDataFetch = (operation: string, params: any, options?: DataFetcherOptions) =>
  debugInstance.debugDataFetch(operation, params, options);
export const checkSystemHealth = () => debugInstance.checkSystemHealth();
export const testEndpoint = (baseId: string, table: string, params?: any) =>
  debugInstance.testEndpoint(baseId, table, params);

// Development-only debugging helpers
export function enableDebugMode(): void {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('Debug mode should only be enabled in development');
    return;
  }

  // Add global debugging functions to window
  if (typeof window !== 'undefined') {
    (window as any).debugDataFetching = {
      debugURL,
      debugDataFetch,
      checkSystemHealth,
      testEndpoint,
      getHistory: () => debugInstance.getDebugHistory(),
      clearHistory: () => debugInstance.clearDebugHistory(),
      generateReport: () => debugInstance.generateDebugReport(),
      analyzePerformance: () => debugInstance.analyzePerformance()
    };

    logger.info('DEBUG_MODE', 'Debug mode enabled. Use window.debugDataFetching for debugging tools');
  }
}

// Auto-enable debug mode in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  enableDebugMode();
}