/**
 * Universal Data Fetcher Interface
 * 
 * This module provides a unified interface for data fetching that works
 * seamlessly in both server-side rendering (SSR) and client-side contexts.
 * It automatically routes calls to the appropriate fetcher based on environment
 * and implements caching strategies for different environments.
 */

import type { AirtableListKey, AirtableRecordKey, AirtableSWRKey } from './airtable-fetcher';
import { airtableFetchJson } from './airtable-fetcher';
import { AirtableServerError, fetchServerData, getServerClient } from './airtable-server';
import { recordAPIFailure, startTimer } from './performance-monitoring';
import { buildAirtableAPIURL, getURLBuilder } from './url-builder';

// Data fetching options
export interface DataFetcherOptions {
  /** Enable/disable caching */
  cache?: boolean;
  /** Cache revalidation time in milliseconds */
  revalidate?: number;
  /** Fallback data to use when fetch fails */
  fallback?: any;
  /** Whether to throw errors or return fallback */
  throwOnError?: boolean;
  /** Enable debug logging */
  debug?: boolean;
}

// Data fetching result
export interface DataFetchingResult<T> {
  /** The fetched data */
  data: T;
  /** Any error that occurred */
  error?: Error;
  /** Whether data is currently being loaded */
  isLoading: boolean;
  /** Source of the data (server, client, cache) */
  source: 'server' | 'client' | 'cache' | 'fallback';
  /** Function to manually revalidate data */
  revalidate: () => Promise<void>;
}

// Environment context for data fetching
export interface DataFetcherContext {
  /** Whether running on server */
  isServer: boolean;
  /** Whether running on client */
  isClient: boolean;
  /** Whether running during build */
  isBuild: boolean;
  /** Base URL for API calls */
  baseUrl: string;
}

// Universal data fetcher interface
export interface UniversalDataFetcher {
  /** Fetch a list of records */
  fetchList<T>(params: AirtableListKey, options?: DataFetcherOptions): Promise<T>;
  /** Fetch a single record */
  fetchRecord<T>(params: AirtableRecordKey, options?: DataFetcherOptions): Promise<T>;
  /** Get current environment context */
  getContext(): DataFetcherContext;
  /** Check if running on server */
  isServer(): boolean;
  /** Check if running on client */
  isClient(): boolean;
  /** Test connection to data source */
  testConnection(): Promise<boolean>;
}

// Cache management for different environments
class DataCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 300000): void { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): any | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  clear(): void {
    this.cache.clear();
  }

  generateKey(params: AirtableSWRKey): string {
    const { baseId, table, kind } = params;

    if (kind === 'record') {
      const recordParams = params as AirtableRecordKey;
      return `${baseId}:${table}:record:${recordParams.recordId}`;
    } else {
      const listParams = params as AirtableListKey;
      const paramsStr = listParams.params ? JSON.stringify(listParams.params) : '';
      const offsetStr = listParams.offset || '';
      return `${baseId}:${table}:list:${paramsStr}:${offsetStr}`;
    }
  }
}

// Main universal data fetcher implementation
class UniversalDataFetcherImpl implements UniversalDataFetcher {
  private cache: DataCache;
  private context: DataFetcherContext;

  constructor() {
    this.cache = new DataCache();
    this.context = this.detectContext();
  }

  private detectContext(): DataFetcherContext {
    const urlBuilder = getURLBuilder();
    const envContext = urlBuilder.getEnvironmentContext();

    return {
      isServer: envContext.isServer,
      isClient: envContext.isClient,
      isBuild: envContext.isBuild,
      baseUrl: envContext.baseUrl,
    };
  }

  getContext(): DataFetcherContext {
    return { ...this.context };
  }

  isServer(): boolean {
    return this.context.isServer;
  }

  isClient(): boolean {
    return this.context.isClient;
  }

  async testConnection(): Promise<boolean> {
    try {
      if (this.isServer()) {
        const serverClient = getServerClient();
        return await serverClient.testConnection();
      } else {
        // For client-side, test by making a simple API call
        const testUrl = buildAirtableAPIURL('test');
        const response = await fetch(testUrl, { method: 'HEAD' });
        return response.ok || response.status === 404; // 404 is ok, means API is reachable
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  private async fetchFromServer<T>(
    params: AirtableSWRKey,
    options: DataFetcherOptions = {}
  ): Promise<T> {
    const { fallback = null, throwOnError = false, debug = false } = options;

    try {
      if (debug) {
        console.log('Fetching from server:', params);
      }

      const data = await fetchServerData(params, {
        fallbackData: fallback,
        throwOnError,
        logErrors: debug,
      });

      return data;
    } catch (error) {
      if (debug) {
        console.error('Server fetch failed:', error);
      }

      if (throwOnError) {
        throw error;
      }

      return fallback;
    }
  }

  private async fetchFromClient<T>(
    params: AirtableSWRKey,
    options: DataFetcherOptions = {}
  ): Promise<T> {
    const { fallback = null, throwOnError = false, debug = false } = options;

    try {
      if (debug) {
        console.log('Fetching from client:', params);
      }

      const data = await airtableFetchJson(params);
      return data;
    } catch (error) {
      if (debug) {
        console.error('Client fetch failed:', error);
      }

      if (throwOnError) {
        throw error;
      }

      return fallback;
    }
  }

  async fetchList<T>(params: AirtableListKey, options: DataFetcherOptions = {}): Promise<T> {
    const { cache = true, revalidate = 300000, debug = false } = options;

    // Start performance timer
    const timer = startTimer('data_fetching', {
      operation: 'fetchList',
      table: params.table,
      baseId: params.baseId,
      environment: this.isServer() ? 'server' : 'client'
    });

    let cacheHit = false;
    let success = false;
    let data: T;

    try {
      // Check cache first if enabled
      if (cache) {
        const cacheKey = this.cache.generateKey(params);
        const cachedData = this.cache.get(cacheKey);

        if (cachedData !== undefined) {
          cacheHit = true;
          success = true;
          if (debug) {
            console.log('Returning cached data for:', cacheKey);
          }

          // Record performance metrics
          timer.endDataFetching({
            operation: 'fetchList',
            success: true,
            cacheHit: true,
            endpoint: `${params.baseId}/${params.table}`,
            dataSize: JSON.stringify(cachedData).length
          });

          return cachedData;
        }
      }

      // Route to appropriate fetcher based on environment
      if (this.isServer()) {
        data = await this.fetchFromServer<T>(params, options);
      } else {
        data = await this.fetchFromClient<T>(params, options);
      }

      success = true;

      // Cache the result if caching is enabled
      if (cache && data !== null && data !== undefined) {
        const cacheKey = this.cache.generateKey(params);
        this.cache.set(cacheKey, data, revalidate);

        if (debug) {
          console.log('Cached data for:', cacheKey);
        }
      }

      // Record performance metrics
      timer.endDataFetching({
        operation: 'fetchList',
        success: true,
        cacheHit: false,
        endpoint: `${params.baseId}/${params.table}`,
        dataSize: data ? JSON.stringify(data).length : 0
      });

    } catch (error) {
      success = false;

      // Record API failure
      recordAPIFailure({
        endpoint: `${params.baseId}/${params.table}`,
        method: 'GET',
        statusCode: (error as any).status || 500,
        errorMessage: (error as Error).message,
        duration: timer.end(),
        timestamp: Date.now()
      });

      throw error;
    }

    return data;
  }

  async fetchRecord<T>(params: AirtableRecordKey, options: DataFetcherOptions = {}): Promise<T> {
    const { cache = true, revalidate = 300000, debug = false } = options;

    // Check cache first if enabled
    if (cache) {
      const cacheKey = this.cache.generateKey(params);
      const cachedData = this.cache.get(cacheKey);

      if (cachedData !== undefined) {
        if (debug) {
          console.log('Returning cached data for:', cacheKey);
        }
        return cachedData;
      }
    }

    let data: T;

    // Route to appropriate fetcher based on environment
    if (this.isServer()) {
      data = await this.fetchFromServer<T>(params, options);
    } else {
      data = await this.fetchFromClient<T>(params, options);
    }

    // Cache the result if caching is enabled
    if (cache && data !== null && data !== undefined) {
      const cacheKey = this.cache.generateKey(params);
      this.cache.set(cacheKey, data, revalidate);

      if (debug) {
        console.log('Cached data for:', cacheKey);
      }
    }

    return data;
  }
}

// Singleton instance
let universalFetcherInstance: UniversalDataFetcher | null = null;

/**
 * Get the universal data fetcher instance
 */
export function getUniversalFetcher(): UniversalDataFetcher {
  if (!universalFetcherInstance) {
    universalFetcherInstance = new UniversalDataFetcherImpl();
  }
  return universalFetcherInstance;
}

/**
 * Convenience function to fetch list data
 */
export async function fetchList<T>(
  baseId: string,
  table: string,
  params?: Record<string, any>,
  options?: DataFetcherOptions
): Promise<T> {
  const fetcher = getUniversalFetcher();
  const listParams: AirtableListKey = {
    kind: 'list',
    baseId,
    table,
    params,
  };

  return fetcher.fetchList<T>(listParams, options);
}

/**
 * Convenience function to fetch record data
 */
export async function fetchRecord<T>(
  baseId: string,
  table: string,
  recordId: string,
  options?: DataFetcherOptions
): Promise<T> {
  const fetcher = getUniversalFetcher();
  const recordParams: AirtableRecordKey = {
    kind: 'record',
    baseId,
    table,
    recordId,
  };

  return fetcher.fetchRecord<T>(recordParams, options);
}

/**
 * Higher-order function to create environment-aware data fetching hooks
 */
export function createDataFetcher<T>(
  keyGenerator: (...args: any[]) => AirtableSWRKey,
  options?: DataFetcherOptions
) {
  return async (...args: any[]): Promise<T> => {
    const fetcher = getUniversalFetcher();
    const key = keyGenerator(...args);

    if (key.kind === 'list') {
      return fetcher.fetchList<T>(key as AirtableListKey, options);
    } else {
      return fetcher.fetchRecord<T>(key as AirtableRecordKey, options);
    }
  };
}

/**
 * Utility to create a data fetching result with loading state management
 */
export function createDataFetchingResult<T>(
  data: T,
  error?: Error,
  source: DataFetchingResult<T>['source'] = 'server'
): DataFetchingResult<T> {
  return {
    data,
    error,
    isLoading: false,
    source,
    revalidate: async () => {
      // Revalidation logic would be implemented here
      // This is a placeholder for now
    },
  };
}

// Export types and utilities
export { AirtableServerError };
export type { AirtableListKey, AirtableRecordKey, AirtableSWRKey };

