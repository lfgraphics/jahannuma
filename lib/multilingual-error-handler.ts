/**
 * Multilingual Error Handler
 * 
 * Provides specialized error handling for multilingual content scenarios,
 * including missing translations, language-specific API failures, and
 * content localization issues.
 */

import type { Language } from "@/lib/multilingual-texts";
import {
  ErrorContext,
  ErrorHandler,
  ErrorSeverity,
  createDataFetchingError,
  type EnhancedError
} from "./error-handling";
import { logger } from "./logging";
import { getMessageText } from "./multilingual-texts";

// Multilingual-specific error types
export enum MultilingualErrorType {
  MISSING_TRANSLATION = 'MISSING_TRANSLATION',
  LANGUAGE_FIELD_NOT_FOUND = 'LANGUAGE_FIELD_NOT_FOUND',
  CONTENT_TYPE_MISMATCH = 'CONTENT_TYPE_MISMATCH',
  FALLBACK_CHAIN_EXHAUSTED = 'FALLBACK_CHAIN_EXHAUSTED',
  LANGUAGE_API_FAILURE = 'LANGUAGE_API_FAILURE',
  INVALID_LANGUAGE_CODE = 'INVALID_LANGUAGE_CODE',
  CONTENT_LOCALIZATION_ERROR = 'CONTENT_LOCALIZATION_ERROR'
}

// Enhanced error interface for multilingual scenarios
export interface MultilingualError extends EnhancedError {
  errorType: MultilingualErrorType;
  language: Language;
  requestedField?: string;
  contentType?: string;
  availableLanguages?: Language[];
  fallbackUsed?: Language;
  missingFields?: string[];
}

// Error factory functions for multilingual scenarios
export function createMissingTranslationError(
  language: Language,
  field: string,
  contentType?: string,
  availableLanguages?: Language[]
): MultilingualError {
  const error = createDataFetchingError(
    `Missing translation for field '${field}' in language '${language}'`,
    ErrorContext.CLIENT_SIDE,
    {
      code: 'MISSING_TRANSLATION',
      severity: ErrorSeverity.LOW,
      userMessage: getMessageText('noData', language),
      debugInfo: {
        field,
        contentType,
        availableLanguages
      }
    }
  ) as MultilingualError;

  (error as any).errorType = MultilingualErrorType.MISSING_TRANSLATION;
  (error as any).language = language;
  (error as any).requestedField = field;
  (error as any).contentType = contentType;
  (error as any).availableLanguages = availableLanguages;

  return error;
}

export function createLanguageFieldNotFoundError(
  language: Language,
  field: string,
  record: Record<string, any>
): MultilingualError {
  const availableFields = Object.keys(record);

  const error = createDataFetchingError(
    `Language-specific field '${field}' not found in record for language '${language}'`,
    ErrorContext.CLIENT_SIDE,
    {
      code: 'LANGUAGE_FIELD_NOT_FOUND',
      severity: ErrorSeverity.MEDIUM,
      userMessage: getMessageText('error', language),
      debugInfo: {
        field,
        availableFields,
        recordKeys: availableFields.length
      }
    }
  ) as MultilingualError;

  (error as any).errorType = MultilingualErrorType.LANGUAGE_FIELD_NOT_FOUND;
  (error as any).language = language;
  (error as any).requestedField = field;

  return error;
}

export function createFallbackChainExhaustedError(
  language: Language,
  field: string,
  fallbackChain: Language[],
  contentType?: string
): MultilingualError {
  const error = createDataFetchingError(
    `Fallback chain exhausted for field '${field}' in language '${language}'. Tried: ${fallbackChain.join(', ')}`,
    ErrorContext.CLIENT_SIDE,
    {
      code: 'FALLBACK_CHAIN_EXHAUSTED',
      severity: ErrorSeverity.HIGH,
      userMessage: getMessageText('noData', language),
      debugInfo: {
        field,
        fallbackChain,
        contentType
      }
    }
  ) as MultilingualError;

  (error as any).errorType = MultilingualErrorType.FALLBACK_CHAIN_EXHAUSTED;
  (error as any).language = language;
  (error as any).requestedField = field;
  (error as any).contentType = contentType;

  return error;
}

export function createLanguageAPIFailureError(
  language: Language,
  endpoint: string,
  originalError: Error,
  missingFields?: string[]
): MultilingualError {
  const error = createDataFetchingError(
    `API failure for language '${language}' at endpoint '${endpoint}': ${originalError.message}`,
    ErrorContext.CLIENT_SIDE,
    {
      code: 'LANGUAGE_API_FAILURE',
      severity: ErrorSeverity.HIGH,
      userMessage: getMessageText('error', language),
      debugInfo: {
        endpoint,
        originalError: originalError.message,
        stack: originalError.stack,
        missingFields
      }
    }
  ) as MultilingualError;

  (error as any).errorType = MultilingualErrorType.LANGUAGE_API_FAILURE;
  (error as any).language = language;
  (error as any).missingFields = missingFields;

  return error;
}

export function createContentLocalizationError(
  language: Language,
  contentType: string,
  recordId?: string,
  details?: string
): MultilingualError {
  const error = createDataFetchingError(
    `Content localization error for ${contentType} in language '${language}'${recordId ? ` (ID: ${recordId})` : ''}${details ? `: ${details}` : ''}`,
    ErrorContext.CLIENT_SIDE,
    {
      code: 'CONTENT_LOCALIZATION_ERROR',
      severity: ErrorSeverity.MEDIUM,
      userMessage: getMessageText('error', language),
      debugInfo: {
        contentType,
        recordId,
        details
      }
    }
  ) as MultilingualError;

  (error as any).errorType = MultilingualErrorType.CONTENT_LOCALIZATION_ERROR;
  (error as any).language = language;
  (error as any).contentType = contentType;

  return error;
}

// Multilingual Error Handler class
export class MultilingualErrorHandler {
  private static instance: MultilingualErrorHandler;
  private errorHandler: ErrorHandler;
  private errorStats: Map<string, number> = new Map();

  constructor() {
    this.errorHandler = ErrorHandler.getInstance();
  }

  static getInstance(): MultilingualErrorHandler {
    if (!MultilingualErrorHandler.instance) {
      MultilingualErrorHandler.instance = new MultilingualErrorHandler();
    }
    return MultilingualErrorHandler.instance;
  }

  // Handle multilingual-specific errors
  handleMultilingualError(error: MultilingualError, showToast = true): void {
    // Update error statistics
    this.updateErrorStats(error);

    // Log the error with multilingual context
    logger.error('MULTILINGUAL_ERROR', 'Multilingual error occurred', error, {
      errorType: error.errorType,
      language: error.language,
      field: error.requestedField,
      contentType: error.contentType,
      message: error.message
    });

    // Handle the error through the base error handler
    this.errorHandler.handleError(error, showToast);

    // Perform multilingual-specific recovery actions
    this.attemptMultilingualRecovery(error);
  }

  // Handle missing translation with graceful fallback
  handleMissingTranslation(
    language: Language,
    field: string,
    record: Record<string, any>,
    contentType?: string,
    fallbackLanguages: Language[] = ['UR', 'EN', 'HI']
  ): { value: any; fallbackUsed?: Language; error?: MultilingualError } {
    // Try to find the value in fallback languages
    for (const fallbackLang of fallbackLanguages) {
      if (fallbackLang === language) continue;

      const fallbackFieldName = this.getLanguageFieldName(field, fallbackLang);
      const fallbackValue = record[fallbackFieldName];

      if (this.isValidValue(fallbackValue)) {
        logger.debug('MULTILINGUAL_FALLBACK', `Using fallback language '${fallbackLang}' for field '${field}'`);

        return {
          value: fallbackValue,
          fallbackUsed: fallbackLang
        };
      }
    }

    // No fallback found, create error
    const error = createMissingTranslationError(language, field, contentType, fallbackLanguages);
    this.handleMultilingualError(error, false); // Don't show toast for missing translations

    return { value: undefined, error };
  }

  // Handle API failures with language-aware retry logic
  async handleLanguageAPIFailure<T>(
    operation: () => Promise<T>,
    language: Language,
    endpoint: string,
    maxRetries = 2
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          const multilingualError = createLanguageAPIFailureError(
            language,
            endpoint,
            lastError
          );

          this.handleMultilingualError(multilingualError);
          throw multilingualError;
        }

        // Wait before retry with exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  // Validate content availability in language
  validateContentAvailability(
    record: Record<string, any>,
    language: Language,
    requiredFields: string[],
    contentType?: string
  ): { isValid: boolean; missingFields: string[]; errors: MultilingualError[] } {
    const missingFields: string[] = [];
    const errors: MultilingualError[] = [];

    for (const field of requiredFields) {
      const fieldName = this.getLanguageFieldName(field, language);
      const value = record[fieldName];

      if (!this.isValidValue(value)) {
        missingFields.push(field);

        const error = createMissingTranslationError(
          language,
          field,
          contentType
        );
        errors.push(error);
      }
    }

    return {
      isValid: missingFields.length === 0,
      missingFields,
      errors
    };
  }

  // Get error statistics
  getErrorStats(): Record<string, number> {
    return Object.fromEntries(this.errorStats);
  }

  // Clear error statistics
  clearErrorStats(): void {
    this.errorStats.clear();
  }

  // Private helper methods
  private updateErrorStats(error: MultilingualError): void {
    const key = `${error.errorType}_${error.language}`;
    const current = this.errorStats.get(key) || 0;
    this.errorStats.set(key, current + 1);
  }

  private attemptMultilingualRecovery(error: MultilingualError): void {
    switch (error.errorType) {
      case MultilingualErrorType.MISSING_TRANSLATION:
        this.recoverFromMissingTranslation(error);
        break;
      case MultilingualErrorType.LANGUAGE_API_FAILURE:
        this.recoverFromAPIFailure(error);
        break;
      case MultilingualErrorType.FALLBACK_CHAIN_EXHAUSTED:
        this.recoverFromExhaustedFallback(error);
        break;
      default:
        logger.debug('MULTILINGUAL_RECOVERY', 'No recovery strategy for error type', error.errorType);
    }
  }

  private recoverFromMissingTranslation(error: MultilingualError): void {
    logger.info('MULTILINGUAL_RECOVERY', 'Attempting recovery from missing translation', {
      language: error.language,
      field: error.requestedField
    });

    // Could implement caching of successful fallbacks
    // or trigger background translation requests
  }

  private recoverFromAPIFailure(error: MultilingualError): void {
    logger.info('MULTILINGUAL_RECOVERY', 'Attempting recovery from API failure', {
      language: error.language
    });

    // Could implement offline mode or alternative data sources
  }

  private recoverFromExhaustedFallback(error: MultilingualError): void {
    logger.warn('MULTILINGUAL_RECOVERY', 'All fallback options exhausted', {
      language: error.language,
      field: error.requestedField
    });

    // Could implement default content or user notification
  }

  private getLanguageFieldName(baseField: string, language: Language): string {
    if (language === 'UR') {
      return baseField;
    }

    const prefix = language.toLowerCase();
    const capitalizedField = baseField.charAt(0).toUpperCase() + baseField.slice(1);
    return `${prefix}${capitalizedField}`;
  }

  private isValidValue(value: any): boolean {
    return value !== undefined && value !== null && value !== '';
  }
}

// Convenience functions
export function handleMissingTranslation(
  language: Language,
  field: string,
  record: Record<string, any>,
  contentType?: string,
  fallbackLanguages?: Language[]
): { value: any; fallbackUsed?: Language; error?: MultilingualError } {
  return MultilingualErrorHandler.getInstance().handleMissingTranslation(
    language,
    field,
    record,
    contentType,
    fallbackLanguages
  );
}

export function handleLanguageAPIFailure<T>(
  operation: () => Promise<T>,
  language: Language,
  endpoint: string,
  maxRetries?: number
): Promise<T> {
  return MultilingualErrorHandler.getInstance().handleLanguageAPIFailure(
    operation,
    language,
    endpoint,
    maxRetries
  );
}

export function validateContentAvailability(
  record: Record<string, any>,
  language: Language,
  requiredFields: string[],
  contentType?: string
): { isValid: boolean; missingFields: string[]; errors: MultilingualError[] } {
  return MultilingualErrorHandler.getInstance().validateContentAvailability(
    record,
    language,
    requiredFields,
    contentType
  );
}

// Export singleton instance
export const multilingualErrorHandler = MultilingualErrorHandler.getInstance();