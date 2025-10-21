/**
 * Optimized Multilingual Fetcher
 * 
 * Provides intelligent data fetching with language-aware caching,
 * field optimization, and performance monitoring for multilingual content.
 */

import { Language } from "@/lib/multilingual-texts";
import { createClientError } from "./error-handling";
import { logger } from "./logging";
import {
  MULTILINGUAL_CACHE_CONFIGS,
  multilingualCacheManager,
  type LanguageCacheKey,
  type LanguageCacheOptions
} from "./multilingual-cache-manager";
import {
  handleLanguageAPIFailure,
  validateContentAvailability
} from "./multilingual-error-handler";
import { buildAirtableAPIURL } from "./url-builder";

export interface OptimizedFetchOptions {
  language: Language;
  contentType: string;
  fields?: string[];
  cacheStrategy?: 'aggressive' | 'conservative' | 'balanced';
  fallbackLanguages?: Language[];
  prefetchLanguages?: Language[];
  maxRetries?: number;
  timeout?: number;
  validateContent?: boolean;
}

export interface FetchResult<T> {
  data: T;
  language: Language;
  fallbackUsed?: Language;
  fromCache: boolean;
  availableLanguages?: Language[];
  performance: {
    fetchTime: number;
    cacheHit: boolean;
    fieldsOptimized: boolean;
  };
}

export interface BatchFetchOptions extends OptimizedFetchOptions {
  batchSize?: number;
  concurrency?: number;
}

/**
 * Optimized Multilingual Fetcher class
 */
export class OptimizedMultilingualFetcher {
  private static instance: OptimizedMultilingualFetcher;
  private performanceMetrics = new Map<string, number[]>();
  private requestQueue = new Map<string, Promise<any>>();

  static getInstance(): OptimizedMultilingualFetcher {
    if (!OptimizedMultilingualFetcher.instance) {
      OptimizedMultilingualFetcher.instance = new OptimizedMultilingualFetcher();
    }
    return OptimizedMultilingualFetcher.instance;
  }

  /**
   * Fetch a single record with optimizations
   */
  async fetchRecord<T>(
    endpoint: string,
    recordId: string,
    options: OptimizedFetchOptions
  ): Promise<FetchResult<T>> {
    const startTime = Date.now();
    const cacheKey: LanguageCacheKey = {
      contentType: options.contentType,
      language: options.language,
      recordId,
      fields: options.fields
    };

    // Try cache first
    const cached = multilingualCacheManager.getWithFallback<T>(
      cacheKey,
      options.fallbackLanguages
    );

    if (cached.data) {
      const fetchTime = Date.now() - startTime;
      this.recordPerformance(endpoint, fetchTime);

      return {
        data: cached.data.data,
        language: cached.data.language,
        fallbackUsed: cached.fallbackUsed,
        fromCache: true,
        availableLanguages: cached.data.availableLanguages,
        performance: {
          fetchTime,
          cacheHit: true,
          fieldsOptimized: false
        }
      };
    }

    // Optimize field selection
    const optimizedFields = multilingualCacheManager.optimizeFieldSelection(
      options.contentType,
      options.language,
      options.fields
    );

    // Check for in-flight request
    const requestKey = `${endpoint}:${recordId}:${options.language}`;
    if (this.requestQueue.has(requestKey)) {
      logger.debug('OPTIMIZED_FETCHER', 'Reusing in-flight request', { endpoint, recordId, language: options.language });
      return await this.requestQueue.get(requestKey)!;
    }

    // Create and cache the request promise
    const requestPromise = this.performFetch<T>(
      endpoint,
      recordId,
      optimizedFields,
      options,
      startTime
    );

    this.requestQueue.set(requestKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Clean up the request queue
      this.requestQueue.delete(requestKey);
    }
  }

  /**
   * Fetch a list of records with optimizations
   */
  async fetchList<T>(
    endpoint: string,
    params: Record<string, any>,
    options: OptimizedFetchOptions
  ): Promise<FetchResult<T[]>> {
    const startTime = Date.now();
    const cacheKey: LanguageCacheKey = {
      contentType: options.contentType,
      language: options.language,
      params,
      fields: options.fields
    };

    // Try cache first
    const cached = multilingualCacheManager.getWithFallback<T[]>(
      cacheKey,
      options.fallbackLanguages
    );

    if (cached.data) {
      const fetchTime = Date.now() - startTime;
      this.recordPerformance(endpoint, fetchTime);

      return {
        data: cached.data.data,
        language: cached.data.language,
        fallbackUsed: cached.fallbackUsed,
        fromCache: true,
        availableLanguages: cached.data.availableLanguages,
        performance: {
          fetchTime,
          cacheHit: true,
          fieldsOptimized: false
        }
      };
    }

    // Optimize field selection
    const optimizedFields = multilingualCacheManager.optimizeFieldSelection(
      options.contentType,
      options.language,
      options.fields
    );

    // Check for in-flight request
    const requestKey = `${endpoint}:list:${JSON.stringify(params)}:${options.language}`;
    if (this.requestQueue.has(requestKey)) {
      logger.debug('OPTIMIZED_FETCHER', 'Reusing in-flight list request', { endpoint, language: options.language });
      return await this.requestQueue.get(requestKey)!;
    }

    // Create and cache the request promise
    const requestPromise = this.performListFetch<T>(
      endpoint,
      params,
      optimizedFields,
      options,
      startTime
    );

    this.requestQueue.set(requestKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Clean up the request queue
      this.requestQueue.delete(requestKey);
    }
  }

  /**
   * Batch fetch multiple records efficiently
   */
  async batchFetch<T>(
    endpoint: string,
    recordIds: string[],
    options: BatchFetchOptions
  ): Promise<FetchResult<T>[]> {
    const batchSize = options.batchSize || 10;
    const concurrency = options.concurrency || 3;
    const results: FetchResult<T>[] = [];

    // Process in batches with controlled concurrency
    for (let i = 0; i < recordIds.length; i += batchSize) {
      const batch = recordIds.slice(i, i + batchSize);
      const batchPromises = batch.map(recordId =>
        this.fetchRecord<T>(endpoint, recordId, options)
      );

      // Limit concurrency
      const batchResults = await this.limitConcurrency(batchPromises, concurrency);
      results.push(...batchResults);
    }

    logger.debug('OPTIMIZED_FETCHER', 'Batch fetch completed', {
      endpoint,
      totalRecords: recordIds.length,
      batchSize,
      concurrency
    });

    return results;
  }

  /**
   * Preload content for multiple languages
   */
  async preloadLanguages<T>(
    endpoint: string,
    recordId: string,
    languages: Language[],
    options: Omit<OptimizedFetchOptions, 'language'>
  ): Promise<void> {
    const preloadPromises = languages.map(async (language) => {
      try {
        await this.fetchRecord<T>(endpoint, recordId, {
          ...options,
          language,
          contentType: options.contentType
        });
      } catch (error) {
        logger.warn('OPTIMIZED_FETCHER', `Failed to preload ${recordId} for language ${language}`, error);
      }
    });

    await Promise.allSettled(preloadPromises);

    logger.debug('OPTIMIZED_FETCHER', 'Preload completed', {
      endpoint,
      recordId,
      languages
    });
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): Record<string, {
    averageTime: number;
    requestCount: number;
    minTime: number;
    maxTime: number;
  }> {
    const metrics: Record<string, any> = {};

    for (const [endpoint, times] of this.performanceMetrics.entries()) {
      const sum = times.reduce((a, b) => a + b, 0);
      metrics[endpoint] = {
        averageTime: sum / times.length,
        requestCount: times.length,
        minTime: Math.min(...times),
        maxTime: Math.max(...times)
      };
    }

    return metrics;
  }

  /**
   * Clear performance metrics
   */
  clearMetrics(): void {
    this.performanceMetrics.clear();
  }

  // Private helper methods
  private async performFetch<T>(
    endpoint: string,
    recordId: string,
    fields: string[],
    options: OptimizedFetchOptions,
    startTime: number
  ): Promise<FetchResult<T>> {
    const url = buildAirtableAPIURL(endpoint, {
      fields: fields.join(','),
      lang: options.language
    });

    const fullUrl = `${url}/${recordId}`;

    try {
      const data = await handleLanguageAPIFailure(
        () => this.makeRequest<T>(fullUrl, options.timeout),
        options.language,
        endpoint,
        options.maxRetries
      );

      const fetchTime = Date.now() - startTime;
      this.recordPerformance(endpoint, fetchTime);

      // Validate content if requested
      let availableLanguages: Language[] = [options.language];
      if (options.validateContent && data) {
        const validation = validateContentAvailability(
          data as any,
          options.language,
          fields.filter(f => !f.includes('id') && !f.includes('Time')),
          options.contentType
        );

        if (!validation.isValid) {
          logger.warn('OPTIMIZED_FETCHER', 'Content validation failed', {
            endpoint,
            recordId,
            language: options.language,
            missingFields: validation.missingFields
          });
        }
      }

      // Cache the result
      const cacheKey: LanguageCacheKey = {
        contentType: options.contentType,
        language: options.language,
        recordId,
        fields
      };

      const cacheOptions: LanguageCacheOptions = {
        ttl: this.getCacheTTL(options.cacheStrategy),
        prefetchLanguages: options.prefetchLanguages
      };

      multilingualCacheManager.set(cacheKey, data, {
        ...cacheOptions,
        availableLanguages
      });

      return {
        data,
        language: options.language,
        fromCache: false,
        availableLanguages,
        performance: {
          fetchTime,
          cacheHit: false,
          fieldsOptimized: fields.length !== (options.fields?.length || 0)
        }
      };

    } catch (error) {
      const enhancedError = createClientError((error as Error).message, {
        code: 'FETCH_FAILED',
        debugInfo: { endpoint, recordId, language: options.language }
      });

      logger.error('OPTIMIZED_FETCHER', 'Fetch failed', enhancedError, {
        endpoint,
        recordId,
        language: options.language,
        error: (error as Error).message
      });

      throw enhancedError;
    }
  }

  private async performListFetch<T>(
    endpoint: string,
    params: Record<string, any>,
    fields: string[],
    options: OptimizedFetchOptions,
    startTime: number
  ): Promise<FetchResult<T[]>> {
    const url = buildAirtableAPIURL(endpoint, {
      ...params,
      fields: fields.join(','),
      lang: options.language
    });

    try {
      const response = await handleLanguageAPIFailure(
        () => this.makeRequest<{ records: T[] }>(url, options.timeout),
        options.language,
        endpoint,
        options.maxRetries
      );

      const data = response.records || [];
      const fetchTime = Date.now() - startTime;
      this.recordPerformance(endpoint, fetchTime);

      // Cache the result
      const cacheKey: LanguageCacheKey = {
        contentType: options.contentType,
        language: options.language,
        params,
        fields
      };

      const cacheOptions: LanguageCacheOptions = {
        ttl: this.getCacheTTL(options.cacheStrategy),
        prefetchLanguages: options.prefetchLanguages
      };

      multilingualCacheManager.set(cacheKey, data, cacheOptions);

      return {
        data,
        language: options.language,
        fromCache: false,
        performance: {
          fetchTime,
          cacheHit: false,
          fieldsOptimized: fields.length !== (options.fields?.length || 0)
        }
      };

    } catch (error) {
      const enhancedError = createClientError((error as Error).message, {
        code: 'LIST_FETCH_FAILED',
        debugInfo: { endpoint, language: options.language }
      });

      logger.error('OPTIMIZED_FETCHER', 'List fetch failed', enhancedError, {
        endpoint,
        language: options.language,
        error: (error as Error).message
      });

      throw error;
    }
  }

  private async makeRequest<T>(url: string, timeout = 10000): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async limitConcurrency<T>(
    promises: Promise<T>[],
    limit: number
  ): Promise<T[]> {
    const results: T[] = [];

    for (let i = 0; i < promises.length; i += limit) {
      const batch = promises.slice(i, i + limit);
      const batchResults = await Promise.all(batch);
      results.push(...batchResults);
    }

    return results;
  }

  private recordPerformance(endpoint: string, time: number): void {
    if (!this.performanceMetrics.has(endpoint)) {
      this.performanceMetrics.set(endpoint, []);
    }

    const times = this.performanceMetrics.get(endpoint)!;
    times.push(time);

    // Keep only last 100 measurements
    if (times.length > 100) {
      times.shift();
    }
  }

  private getCacheTTL(strategy?: string): number {
    switch (strategy) {
      case 'aggressive':
        return MULTILINGUAL_CACHE_CONFIGS.static.ttl;
      case 'conservative':
        return MULTILINGUAL_CACHE_CONFIGS.dynamic.ttl;
      case 'balanced':
      default:
        return MULTILINGUAL_CACHE_CONFIGS.content.ttl;
    }
  }
}

// Export singleton instance and convenience functions
export const optimizedMultilingualFetcher = OptimizedMultilingualFetcher.getInstance();

// Convenience functions
export async function fetchOptimizedRecord<T>(
  endpoint: string,
  recordId: string,
  options: OptimizedFetchOptions
): Promise<FetchResult<T>> {
  return optimizedMultilingualFetcher.fetchRecord<T>(endpoint, recordId, options);
}

export async function fetchOptimizedList<T>(
  endpoint: string,
  params: Record<string, any>,
  options: OptimizedFetchOptions
): Promise<FetchResult<T[]>> {
  return optimizedMultilingualFetcher.fetchList<T>(endpoint, params, options);
}

export async function batchFetchOptimized<T>(
  endpoint: string,
  recordIds: string[],
  options: BatchFetchOptions
): Promise<FetchResult<T>[]> {
  return optimizedMultilingualFetcher.batchFetch<T>(endpoint, recordIds, options);
}

export async function preloadLanguageContent<T>(
  endpoint: string,
  recordId: string,
  languages: Language[],
  options: Omit<OptimizedFetchOptions, 'language'>
): Promise<void> {
  return optimizedMultilingualFetcher.preloadLanguages<T>(endpoint, recordId, languages, options);
}