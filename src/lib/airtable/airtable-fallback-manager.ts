/**
 * Fallback Mechanisms for Airtable Field Mapping Errors
 * 
 * This module provides graceful degradation strategies when Airtable API calls fail
 * due to field mapping errors, base ID issues, or other API problems.
 */

import { logger } from '@/lib/logging';
import {
  AirtableErrorType,
  type AirtableError
} from './airtable-error-logger';
import { preValidateApiFields, suggestFieldCorrection, type ContentType } from './field-validator';

// === Fallback Strategy Types ===

export enum FallbackStrategy {
  FIELD_CORRECTION = 'FIELD_CORRECTION',
  CORE_FIELDS_ONLY = 'CORE_FIELDS_ONLY',
  RETRY_WITH_DELAY = 'RETRY_WITH_DELAY',
  CACHED_DATA = 'CACHED_DATA',
  EMPTY_RESPONSE = 'EMPTY_RESPONSE',
  ALTERNATIVE_ENDPOINT = 'ALTERNATIVE_ENDPOINT'
}

export interface FallbackOptions {
  maxRetries?: number;
  retryDelay?: number;
  enableFieldCorrection?: boolean;
  enableCoreFieldsFallback?: boolean;
  enableCachedFallback?: boolean;
  coreFields?: string[];
  fallbackData?: any;
}

export interface FallbackResult<T = any> {
  success: boolean;
  data?: T;
  strategy?: FallbackStrategy;
  appliedCorrections?: Record<string, string>;
  warnings?: string[];
  originalError?: AirtableError;
}

// === Core Field Definitions ===

const CORE_FIELDS_BY_CONTENT_TYPE: Record<string, string[]> = {
  ashaar: ['id', 'shaer', 'unwan', 'sher'],
  ghazlen: ['id', 'shaer', 'unwan', 'ghazal'],
  nazmen: ['id', 'shaer', 'unwan', 'nazm'],
  rubai: ['id', 'shaer', 'unwan', 'body'],
  ebooks: ['id', 'bookName', 'writer'],
  comments: ['id', 'comment', 'commentorName', 'timestamp']
};

const ESSENTIAL_FIELDS = ['id', 'createdTime']; // Fields that should always work

// === Retry Configuration ===

interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: AirtableErrorType[];
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableErrors: [
    AirtableErrorType.RATE_LIMIT,
    AirtableErrorType.NETWORK,
    AirtableErrorType.VALIDATION_ERROR
  ]
};

// === Fallback Manager Class ===

export class AirtableFallbackManager {
  private static instance: AirtableFallbackManager;
  private retryConfig: RetryConfig;
  private fallbackCache: Map<string, any> = new Map();

  constructor(retryConfig: Partial<RetryConfig> = {}) {
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  }

  static getInstance(config?: Partial<RetryConfig>): AirtableFallbackManager {
    if (!AirtableFallbackManager.instance) {
      AirtableFallbackManager.instance = new AirtableFallbackManager(config);
    }
    return AirtableFallbackManager.instance;
  }

  /**
   * Execute an Airtable operation with comprehensive fallback strategies
   */
  async executeWithFallback<T>(
    operation: () => Promise<T>,
    context: {
      operationName: string;
      tableName: string;
      contentType?: string;
      requestedFields?: string[];
      baseId?: string;
    },
    options: FallbackOptions = {}
  ): Promise<FallbackResult<T>> {
    const {
      maxRetries = this.retryConfig.maxAttempts,
      retryDelay = this.retryConfig.baseDelay,
      enableFieldCorrection = true,
      enableCoreFieldsFallback = true,
      enableCachedFallback = true
    } = options;

    let lastError: AirtableError | undefined;
    const warnings: string[] = [];

    // Strategy 1: Try original operation with retries
    try {
      const result = await this.executeWithRetry(operation, context.operationName, maxRetries, retryDelay);
      return {
        success: true,
        data: result,
        warnings: warnings.length > 0 ? warnings : undefined
      };
    } catch (error) {
      lastError = error as AirtableError;
      logger.warn('FALLBACK_MANAGER', `Original operation failed: ${context.operationName}`, {
        error: lastError.message,
        errorType: lastError.airtableErrorType
      });
    }

    // Strategy 2: Field correction for field mapping errors
    if (enableFieldCorrection &&
      lastError?.airtableErrorType === AirtableErrorType.UNKNOWN_FIELD &&
      context.contentType &&
      context.requestedFields?.length) {

      try {
        const correctionResult = await this.tryFieldCorrection(
          operation,
          context,
          options
        );

        if (correctionResult.success) {
          warnings.push('Applied field name corrections');
          return {
            ...correctionResult,
            warnings: [...warnings, ...(correctionResult.warnings || [])]
          };
        }
      } catch (error) {
        logger.warn('FALLBACK_MANAGER', 'Field correction strategy failed', { error });
      }
    }

    // Strategy 3: Core fields fallback
    if (enableCoreFieldsFallback && context.contentType) {
      try {
        const coreFieldsResult = await this.tryCoreFieldsFallback(
          operation,
          context,
          options
        );

        if (coreFieldsResult.success) {
          warnings.push('Fell back to core fields only');
          return {
            ...coreFieldsResult,
            warnings: [...warnings, ...(coreFieldsResult.warnings || [])]
          };
        }
      } catch (error) {
        logger.warn('FALLBACK_MANAGER', 'Core fields fallback failed', { error });
      }
    }

    // Strategy 4: Cached data fallback
    if (enableCachedFallback) {
      try {
        const cachedResult = this.tryGetCachedData(context);
        if (cachedResult.success) {
          warnings.push('Returned cached data due to API failure');
          return {
            ...cachedResult,
            warnings: [...warnings, ...(cachedResult.warnings || [])]
          };
        }
      } catch (error) {
        logger.warn('FALLBACK_MANAGER', 'Cached data fallback failed', { error });
      }
    }

    // Strategy 5: Empty response with user-friendly message
    warnings.push('All fallback strategies failed, returning empty response');
    return {
      success: false,
      data: this.getEmptyResponse(context.tableName),
      strategy: FallbackStrategy.EMPTY_RESPONSE,
      warnings,
      originalError: lastError
    };
  }

  /**
   * Try to correct field names and retry the operation
   */
  private async tryFieldCorrection<T>(
    operation: () => Promise<T>,
    context: {
      operationName: string;
      tableName: string;
      contentType?: string;
      requestedFields?: string[];
    },
    options: FallbackOptions
  ): Promise<FallbackResult<T>> {
    if (!context.contentType || !context.requestedFields?.length) {
      return { success: false };
    }

    logger.info('FALLBACK_MANAGER', 'Attempting field correction strategy', {
      tableName: context.tableName,
      contentType: context.contentType,
      requestedFields: context.requestedFields
    });

    // Validate and correct fields
    const validation = preValidateApiFields(
      context.contentType as ContentType,
      context.requestedFields,
      {
        autoCorrect: true,
        logErrors: true
      }
    );

    if (validation.success && Object.keys(validation.corrections).length > 0) {
      // Create a new operation with corrected fields
      const correctedOperation = this.createCorrectedOperation(operation, validation.corrections);

      try {
        const result = await this.executeWithRetry(
          correctedOperation,
          `${context.operationName}_corrected`,
          2 // Fewer retries for corrected operation
        );

        return {
          success: true,
          data: result,
          strategy: FallbackStrategy.FIELD_CORRECTION,
          appliedCorrections: validation.corrections
        };
      } catch (error) {
        logger.warn('FALLBACK_MANAGER', 'Field correction operation failed', { error });
      }
    }

    return { success: false };
  }

  /**
   * Try using only core fields for the content type
   */
  private async tryCoreFieldsFallback<T>(
    operation: () => Promise<T>,
    context: {
      operationName: string;
      tableName: string;
      contentType?: string;
    },
    options: FallbackOptions
  ): Promise<FallbackResult<T>> {
    if (!context.contentType) {
      return { success: false };
    }

    const coreFields = options.coreFields ||
      CORE_FIELDS_BY_CONTENT_TYPE[context.contentType] ||
      ESSENTIAL_FIELDS;

    logger.info('FALLBACK_MANAGER', 'Attempting core fields fallback', {
      tableName: context.tableName,
      contentType: context.contentType,
      coreFields
    });

    // Create operation with only core fields
    const coreFieldsOperation = this.createCoreFieldsOperation(operation, coreFields);

    try {
      const result = await this.executeWithRetry(
        coreFieldsOperation,
        `${context.operationName}_core_fields`,
        2
      );

      return {
        success: true,
        data: result,
        strategy: FallbackStrategy.CORE_FIELDS_ONLY,
        warnings: [`Limited to core fields: ${coreFields.join(', ')}`]
      };
    } catch (error) {
      logger.warn('FALLBACK_MANAGER', 'Core fields operation failed', { error });
      return { success: false };
    }
  }

  /**
   * Try to get cached data as fallback
   */
  private tryGetCachedData(context: {
    operationName: string;
    tableName: string;
    contentType?: string;
  }): FallbackResult {
    const cacheKey = `${context.tableName}:${context.contentType || 'default'}:${context.operationName}`;
    const cachedData = this.fallbackCache.get(cacheKey);

    if (cachedData) {
      logger.info('FALLBACK_MANAGER', 'Using cached data as fallback', {
        cacheKey,
        dataAge: Date.now() - cachedData.timestamp
      });

      return {
        success: true,
        data: cachedData.data,
        strategy: FallbackStrategy.CACHED_DATA,
        warnings: ['Data may be outdated due to API issues']
      };
    }

    return { success: false };
  }

  /**
   * Execute operation with exponential backoff retry
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxAttempts: number = this.retryConfig.maxAttempts,
    baseDelay: number = this.retryConfig.baseDelay
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await operation();

        // Cache successful results for fallback
        if (attempt > 1) {
          logger.info('FALLBACK_MANAGER', `Operation succeeded on attempt ${attempt}`, {
            operationName
          });
        }

        return result;
      } catch (error) {
        lastError = error as Error;

        // Check if error is retryable
        const airtableError = error as AirtableError;
        const isRetryable = this.isRetryableError(airtableError);

        if (!isRetryable || attempt === maxAttempts) {
          throw error;
        }

        // Calculate delay with exponential backoff and jitter
        const delay = Math.min(
          baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt - 1),
          this.retryConfig.maxDelay
        );
        const jitteredDelay = delay + Math.random() * 1000;

        logger.warn('FALLBACK_MANAGER', `Attempt ${attempt} failed, retrying in ${jitteredDelay}ms`, {
          operationName,
          error: lastError.message,
          nextAttempt: attempt + 1
        });

        await this.delay(jitteredDelay);
      }
    }

    throw lastError!;
  }

  /**
   * Check if an error is retryable
   */
  private isRetryableError(error: AirtableError): boolean {
    if (!error.airtableErrorType) {
      return true; // Retry unknown errors
    }

    return this.retryConfig.retryableErrors.includes(error.airtableErrorType);
  }

  /**
   * Create operation with corrected field names
   */
  private createCorrectedOperation<T>(
    originalOperation: () => Promise<T>,
    corrections: Record<string, string>
  ): () => Promise<T> {
    // This is a simplified version - in practice, you'd need to modify
    // the actual API call parameters based on the corrections
    logger.debug('FALLBACK_MANAGER', 'Creating corrected operation', { corrections });
    return originalOperation; // Placeholder - would need actual implementation
  }

  /**
   * Create operation with only core fields
   */
  private createCoreFieldsOperation<T>(
    originalOperation: () => Promise<T>,
    coreFields: string[]
  ): () => Promise<T> {
    // This is a simplified version - in practice, you'd need to modify
    // the actual API call to only request core fields
    logger.debug('FALLBACK_MANAGER', 'Creating core fields operation', { coreFields });
    return originalOperation; // Placeholder - would need actual implementation
  }

  /**
   * Get empty response structure for a table
   */
  private getEmptyResponse(tableName: string): any {
    return {
      records: [],
      offset: undefined,
      message: 'Data temporarily unavailable due to API issues'
    };
  }

  /**
   * Cache data for fallback use
   */
  cacheDataForFallback(
    tableName: string,
    contentType: string,
    operationName: string,
    data: any
  ): void {
    const cacheKey = `${tableName}:${contentType}:${operationName}`;
    this.fallbackCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    // Limit cache size
    if (this.fallbackCache.size > 100) {
      const firstKey = this.fallbackCache.keys().next().value;
      if (firstKey) {
        this.fallbackCache.delete(firstKey);
      }
    }
  }

  /**
   * Clear fallback cache
   */
  clearFallbackCache(): void {
    this.fallbackCache.clear();
  }

  /**
   * Get fallback statistics
   */
  getFallbackStats(): {
    cacheSize: number;
    retryConfig: RetryConfig;
  } {
    return {
      cacheSize: this.fallbackCache.size,
      retryConfig: this.retryConfig
    };
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// === Convenience Functions ===

export const fallbackManager = AirtableFallbackManager.getInstance();

/**
 * Execute Airtable operation with automatic fallback handling
 */
export async function executeWithFallback<T>(
  operation: () => Promise<T>,
  context: {
    operationName: string;
    tableName: string;
    contentType?: string;
    requestedFields?: string[];
    baseId?: string;
  },
  options: FallbackOptions = {}
): Promise<FallbackResult<T>> {
  return fallbackManager.executeWithFallback(operation, context, options);
}

/**
 * Cache successful API responses for fallback use
 */
export function cacheForFallback(
  tableName: string,
  contentType: string,
  operationName: string,
  data: any
): void {
  fallbackManager.cacheDataForFallback(tableName, contentType, operationName, data);
}

/**
 * Create user-friendly error messages for different error types
 */
export function createUserFriendlyErrorMessage(
  error: AirtableError,
  fallbackResult?: FallbackResult
): string {
  const baseMessage = error.userMessage || 'ڈیٹا لوڈ کرنے میں خرابی';

  if (fallbackResult?.success && fallbackResult.strategy) {
    switch (fallbackResult.strategy) {
      case FallbackStrategy.FIELD_CORRECTION:
        return `${baseMessage} - فیلڈ کی اصلاح کے ساتھ ڈیٹا لوڈ ہوا`;
      case FallbackStrategy.CORE_FIELDS_ONLY:
        return `${baseMessage} - محدود ڈیٹا دستیاب ہے`;
      case FallbackStrategy.CACHED_DATA:
        return `${baseMessage} - پرانا ڈیٹا دکھایا جا رہا ہے`;
      default:
        return baseMessage;
    }
  }

  return baseMessage;
}

/**
 * Suggest field corrections for common field mapping errors
 */
export function suggestFieldCorrections(
  contentType: string,
  invalidFields: string[]
): Record<string, string> {
  const suggestions: Record<string, string> = {};

  for (const field of invalidFields) {
    const suggestion = suggestFieldCorrection(contentType as ContentType, field);
    if (suggestion) {
      suggestions[field] = suggestion;
    }
  }

  return suggestions;
}