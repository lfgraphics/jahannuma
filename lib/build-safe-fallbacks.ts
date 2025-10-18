/**
 * Build-Time Safe Fallback Mechanisms
 * 
 * This module provides graceful fallbacks when APIs are unavailable during build time,
 * implements cached data fallback systems, and provides comprehensive error logging
 * for debugging build-time data fetching issues.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { AirtableSWRKey } from './airtable-fetcher';

// Build-time error types
export class BuildTimeError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable: boolean = true,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'BuildTimeError';
  }
}

export class FallbackDataError extends Error {
  constructor(message: string, public fallbackUsed: boolean = false) {
    super(message);
    this.name = 'FallbackDataError';
  }
}

// Fallback data structure
export interface FallbackData<T = any> {
  /** The fallback data */
  data: T;
  /** When this fallback was created */
  timestamp: number;
  /** Source of the fallback data */
  source: 'cache' | 'static' | 'empty';
  /** Expiration time in milliseconds */
  expiresAt?: number;
  /** Metadata about the original request */
  metadata?: {
    baseId: string;
    table: string;
    kind: string;
    params?: Record<string, any>;
  };
}

// Build-time logging configuration
export interface BuildLogger {
  /** Log info messages */
  info(message: string, data?: any): void;
  /** Log warning messages */
  warn(message: string, data?: any): void;
  /** Log error messages */
  error(message: string, error?: Error, data?: any): void;
  /** Log debug messages */
  debug(message: string, data?: any): void;
}

// Default build logger implementation
class DefaultBuildLogger implements BuildLogger {
  private logLevel: 'debug' | 'info' | 'warn' | 'error';

  constructor(logLevel: 'debug' | 'info' | 'warn' | 'error' = 'info') {
    this.logLevel = logLevel;
  }

  private shouldLog(level: 'debug' | 'info' | 'warn' | 'error'): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentIndex = levels.indexOf(this.logLevel);
    const messageIndex = levels.indexOf(level);
    return messageIndex >= currentIndex;
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [BUILD-${level.toUpperCase()}]`;
    const dataStr = data ? ` ${JSON.stringify(data, null, 2)}` : '';
    return `${prefix} ${message}${dataStr}`;
  }

  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message, data));
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, data));
    }
  }

  error(message: string, error?: Error, data?: any): void {
    if (this.shouldLog('error')) {
      const errorData = error ? {
        message: error.message,
        stack: error.stack,
        ...data
      } : data;
      console.error(this.formatMessage('error', message, errorData));
    }
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, data));
    }
  }
}

// Fallback cache manager
export class FallbackCacheManager {
  private cacheDir: string;
  private logger: BuildLogger;

  constructor(cacheDir: string = '.next/cache/fallbacks', logger?: BuildLogger) {
    this.cacheDir = cacheDir;
    this.logger = logger || new DefaultBuildLogger();
    this.ensureCacheDir();
  }

  private ensureCacheDir(): void {
    try {
      if (!existsSync(this.cacheDir)) {
        mkdirSync(this.cacheDir, { recursive: true });
        this.logger.debug('Created fallback cache directory', { cacheDir: this.cacheDir });
      }
    } catch (error) {
      this.logger.error('Failed to create cache directory', error as Error, { cacheDir: this.cacheDir });
    }
  }

  private generateCacheKey(key: AirtableSWRKey): string {
    const { baseId, table, kind } = key;

    if (kind === 'record') {
      const recordKey = key as any;
      return `${baseId}_${table}_record_${recordKey.recordId}`;
    } else {
      const listKey = key as any;
      const paramsHash = listKey.params ?
        Buffer.from(JSON.stringify(listKey.params)).toString('base64').slice(0, 8) :
        'default';
      return `${baseId}_${table}_list_${paramsHash}`;
    }
  }

  private getCacheFilePath(cacheKey: string): string {
    return join(this.cacheDir, `${cacheKey}.json`);
  }

  /**
   * Store fallback data in cache
   */
  storeFallback<T>(key: AirtableSWRKey, data: T, source: 'cache' | 'static' | 'empty' = 'cache'): void {
    try {
      const cacheKey = this.generateCacheKey(key);
      const filePath = this.getCacheFilePath(cacheKey);

      const fallbackData: FallbackData<T> = {
        data,
        timestamp: Date.now(),
        source,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        metadata: {
          baseId: key.baseId,
          table: key.table,
          kind: key.kind,
          params: (key as any).params,
        },
      };

      writeFileSync(filePath, JSON.stringify(fallbackData, null, 2), 'utf8');
      this.logger.debug('Stored fallback data', { cacheKey, source, dataSize: JSON.stringify(data).length });
    } catch (error) {
      this.logger.error('Failed to store fallback data', error as Error, { key });
    }
  }

  /**
   * Retrieve fallback data from cache
   */
  getFallback<T>(key: AirtableSWRKey): FallbackData<T> | null {
    try {
      const cacheKey = this.generateCacheKey(key);
      const filePath = this.getCacheFilePath(cacheKey);

      if (!existsSync(filePath)) {
        this.logger.debug('No fallback data found', { cacheKey });
        return null;
      }

      const fileContent = readFileSync(filePath, 'utf8');
      const fallbackData: FallbackData<T> = JSON.parse(fileContent);

      // Check if data has expired
      if (fallbackData.expiresAt && Date.now() > fallbackData.expiresAt) {
        this.logger.debug('Fallback data expired', { cacheKey, expiresAt: fallbackData.expiresAt });
        return null;
      }

      this.logger.debug('Retrieved fallback data', {
        cacheKey,
        source: fallbackData.source,
        age: Date.now() - fallbackData.timestamp
      });

      return fallbackData;
    } catch (error) {
      this.logger.error('Failed to retrieve fallback data', error as Error, { key });
      return null;
    }
  }

  /**
   * Clear expired fallback data
   */
  clearExpired(): void {
    try {
      // This would be implemented to clean up expired cache files
      this.logger.debug('Clearing expired fallback data');
    } catch (error) {
      this.logger.error('Failed to clear expired fallback data', error as Error);
    }
  }
}

// Build-safe data fetcher with fallbacks
export class BuildSafeDataFetcher {
  private cacheManager: FallbackCacheManager;
  private logger: BuildLogger;

  constructor(cacheManager?: FallbackCacheManager, logger?: BuildLogger) {
    this.cacheManager = cacheManager || new FallbackCacheManager();
    this.logger = logger || new DefaultBuildLogger();
  }

  /**
   * Fetch data with build-time safe fallbacks
   */
  async fetchWithFallback<T>(
    key: AirtableSWRKey,
    fetcher: () => Promise<T>,
    options?: {
      /** Static fallback data to use if all else fails */
      staticFallback?: T;
      /** Whether to use empty data as fallback */
      allowEmpty?: boolean;
      /** Maximum age of cached fallback data in milliseconds */
      maxFallbackAge?: number;
    }
  ): Promise<T> {
    const { staticFallback, allowEmpty = true, maxFallbackAge = 7 * 24 * 60 * 60 * 1000 } = options || {};

    this.logger.debug('Attempting to fetch data', { key });

    try {
      // Try to fetch fresh data
      const data = await fetcher();

      // Store successful fetch as fallback for future builds
      this.cacheManager.storeFallback(key, data, 'cache');
      this.logger.info('Successfully fetched and cached data', {
        baseId: key.baseId,
        table: key.table,
        kind: key.kind
      });

      return data;
    } catch (error) {
      this.logger.warn('Primary data fetch failed, attempting fallback', {
        error: error instanceof Error ? error.message : String(error),
        key
      });

      // Try to get cached fallback data
      const fallbackData = this.cacheManager.getFallback<T>(key);

      if (fallbackData) {
        const age = Date.now() - fallbackData.timestamp;

        if (age <= maxFallbackAge) {
          this.logger.info('Using cached fallback data', {
            source: fallbackData.source,
            age,
            baseId: key.baseId,
            table: key.table
          });
          return fallbackData.data;
        } else {
          this.logger.warn('Cached fallback data too old', { age, maxFallbackAge });
        }
      }

      // Try static fallback if provided
      if (staticFallback !== undefined) {
        this.logger.info('Using static fallback data', { baseId: key.baseId, table: key.table });
        this.cacheManager.storeFallback(key, staticFallback, 'static');
        return staticFallback;
      }

      // Use empty data if allowed
      if (allowEmpty) {
        const emptyData = this.createEmptyData<T>(key);
        this.logger.warn('Using empty fallback data', { baseId: key.baseId, table: key.table });
        this.cacheManager.storeFallback(key, emptyData, 'empty');
        return emptyData;
      }

      // If all fallbacks fail, throw a build-time error
      throw new BuildTimeError(
        `Failed to fetch data and no fallback available for ${key.baseId}/${key.table}`,
        'NO_FALLBACK_AVAILABLE',
        false,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Create appropriate empty data structure based on the key type
   */
  private createEmptyData<T>(key: AirtableSWRKey): T {
    if (key.kind === 'list') {
      return { records: [], offset: undefined } as T;
    } else {
      return { fields: {} } as T;
    }
  }

  /**
   * Pre-warm cache with static data for critical content
   */
  preWarmCache<T>(key: AirtableSWRKey, data: T): void {
    this.logger.info('Pre-warming cache with static data', {
      baseId: key.baseId,
      table: key.table,
      kind: key.kind
    });
    this.cacheManager.storeFallback(key, data, 'static');
  }

  /**
   * Validate build environment and log warnings
   */
  validateBuildEnvironment(): void {
    const requiredEnvVars = [
      'AIRTABLE_API_KEY',
      'NEXT_PUBLIC_Api_Token',
      'AIRTABLE_BASE_ID'
    ];

    const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);

    if (missing.length > 0) {
      this.logger.warn('Missing environment variables for Airtable API', { missing });
    }

    // Check if we're in a build environment
    const isBuild = process.env.NODE_ENV === 'production' &&
      process.env.NEXT_PHASE === 'phase-production-build';

    if (isBuild) {
      this.logger.info('Running in build environment, fallbacks will be used for API failures');
    }
  }
}

// Singleton instances
let buildSafeFetcherInstance: BuildSafeDataFetcher | null = null;
let cacheManagerInstance: FallbackCacheManager | null = null;
let loggerInstance: BuildLogger | null = null;

/**
 * Get singleton build-safe data fetcher instance
 */
export function getBuildSafeFetcher(): BuildSafeDataFetcher {
  if (!buildSafeFetcherInstance) {
    buildSafeFetcherInstance = new BuildSafeDataFetcher();
  }
  return buildSafeFetcherInstance;
}

/**
 * Get singleton cache manager instance
 */
export function getCacheManager(): FallbackCacheManager {
  if (!cacheManagerInstance) {
    cacheManagerInstance = new FallbackCacheManager();
  }
  return cacheManagerInstance;
}

/**
 * Get singleton logger instance
 */
export function getBuildLogger(): BuildLogger {
  if (!loggerInstance) {
    const logLevel = (process.env.BUILD_LOG_LEVEL as any) || 'info';
    loggerInstance = new DefaultBuildLogger(logLevel);
  }
  return loggerInstance;
}

/**
 * Convenience function to fetch data with automatic fallbacks
 */
export async function fetchWithBuildSafety<T>(
  key: AirtableSWRKey,
  fetcher: () => Promise<T>,
  options?: {
    staticFallback?: T;
    allowEmpty?: boolean;
    maxFallbackAge?: number;
  }
): Promise<T> {
  const buildSafeFetcher = getBuildSafeFetcher();
  return buildSafeFetcher.fetchWithFallback(key, fetcher, options);
}

/**
 * Initialize build-time safety mechanisms
 */
export function initializeBuildSafety(): void {
  const fetcher = getBuildSafeFetcher();
  fetcher.validateBuildEnvironment();

  // Clear expired cache on initialization
  const cacheManager = getCacheManager();
  cacheManager.clearExpired();
}

/**
 * Get build-safe fallback data for specific content types
 */
export function getBuildSafeFallback(contentType: string, kind: 'list' | 'record'): any {
  const logger = getBuildLogger();

  logger.debug('Getting build-safe fallback', { contentType, kind });

  if (kind === 'list') {
    // Return empty list structure for all content types
    return {
      records: [],
      offset: undefined
    };
  } else {
    // Return empty record structure
    const emptyFields: Record<string, any> = {};

    // Add content-type specific empty fields
    switch (contentType) {
      case 'ashaar':
        emptyFields.sher = '';
        emptyFields.body = '';
        emptyFields.unwan = '';
        emptyFields.shaer = '';
        emptyFields.likes = 0;
        emptyFields.comments = 0;
        emptyFields.shares = 0;
        break;
      case 'ghazlen':
        emptyFields.sher = '';
        emptyFields.body = '';
        emptyFields.unwan = '';
        emptyFields.shaer = '';
        emptyFields.likes = 0;
        emptyFields.comments = 0;
        emptyFields.shares = 0;
        break;
      case 'nazmen':
        emptyFields.sher = '';
        emptyFields.body = '';
        emptyFields.unwan = '';
        emptyFields.shaer = '';
        emptyFields.likes = 0;
        emptyFields.comments = 0;
        emptyFields.shares = 0;
        break;
      case 'rubai':
        emptyFields.shaer = '';
        emptyFields.unwan = '';
        emptyFields.body = '';
        emptyFields.likes = 0;
        emptyFields.comments = 0;
        emptyFields.shares = 0;
        break;
      default:
        // Generic empty fields
        emptyFields.title = '';
        emptyFields.content = '';
        emptyFields.likes = 0;
        emptyFields.comments = 0;
        emptyFields.shares = 0;
    }

    return {
      id: 'fallback-record',
      fields: emptyFields,
      createdTime: new Date().toISOString()
    };
  }
}

// Export error types for external use
export { DefaultBuildLogger };

/**
 * Main build-safe fallback function - alias for getBuildSafeFallback
 */
export const buildSafeFallback = getBuildSafeFallback;
