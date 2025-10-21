/**
 * Comprehensive Error Logging for Airtable Field Mapping Issues
 * 
 * This module provides specialized logging for Airtable API errors with detailed
 * context about field mappings, base IDs, and API responses to help debug
 * field mapping issues and base ID problems.
 */

import { ErrorContext, ErrorSeverity, createDataFetchingError, type EnhancedError } from "@/lib/error-handling";
import { LogLevel, logger } from "@/lib/logging";
import { validateBaseId } from "./airtable-constants";

// === Airtable-specific Error Types ===

export enum AirtableErrorType {
  FIELD_MAPPING = 'FIELD_MAPPING',
  BASE_ID_INVALID = 'BASE_ID_INVALID',
  BASE_ID_ACCESS = 'BASE_ID_ACCESS',
  AUTHENTICATION = 'AUTHENTICATION',
  RATE_LIMIT = 'RATE_LIMIT',
  NETWORK = 'NETWORK',
  UNKNOWN_FIELD = 'UNKNOWN_FIELD',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

export interface AirtableErrorContext {
  baseId?: string;
  tableName?: string;
  recordId?: string;
  requestedFields?: string[];
  validFields?: string[];
  invalidFields?: string[];
  fieldSuggestions?: Record<string, string>;
  apiUrl?: string;
  httpStatus?: number;
  responseBody?: string;
  requestParams?: Record<string, any>;
  contentType?: string;
  operation?: string;
  retryAttempt?: number;
  timestamp: number;
}

export interface AirtableError extends EnhancedError {
  airtableErrorType: AirtableErrorType;
  airtableContext: AirtableErrorContext;
}

// === Error Detection Functions ===

export function detectAirtableErrorType(error: Error, response?: Response): AirtableErrorType {
  const message = error.message.toLowerCase();
  const status = response?.status;

  // Field mapping errors (422 with UNKNOWN_FIELD_NAME)
  if (status === 422 && message.includes('unknown_field_name')) {
    return AirtableErrorType.UNKNOWN_FIELD;
  }

  // Base ID validation errors
  if (message.includes('invalid base id') || message.includes('base id format')) {
    return AirtableErrorType.BASE_ID_INVALID;
  }

  // Base access errors (404 for base not found)
  if (status === 404 && message.includes('base')) {
    return AirtableErrorType.BASE_ID_ACCESS;
  }

  // Authentication errors
  if (status === 401 || message.includes('unauthorized') || message.includes('authentication')) {
    return AirtableErrorType.AUTHENTICATION;
  }

  // Rate limiting
  if (status === 429 || message.includes('rate limit')) {
    return AirtableErrorType.RATE_LIMIT;
  }

  // Permission errors
  if (status === 403 || message.includes('permission') || message.includes('forbidden')) {
    return AirtableErrorType.PERMISSION_DENIED;
  }

  // Record not found
  if (status === 404 && message.includes('record')) {
    return AirtableErrorType.RECORD_NOT_FOUND;
  }

  // Validation errors
  if (status === 400 || message.includes('validation')) {
    return AirtableErrorType.VALIDATION_ERROR;
  }

  // Network errors
  if (message.includes('fetch') || message.includes('network') || message.includes('timeout')) {
    return AirtableErrorType.NETWORK;
  }

  // Default to field mapping if we can't determine
  return AirtableErrorType.FIELD_MAPPING;
}

export function extractFieldNamesFromError(errorMessage: string): string[] {
  const fieldMatches = errorMessage.match(/field\s+"([^"]+)"/gi);
  if (!fieldMatches) return [];

  return fieldMatches.map(match => {
    const fieldName = match.match(/field\s+"([^"]+)"/i);
    return fieldName ? fieldName[1] : '';
  }).filter(Boolean);
}

export function parseAirtableErrorResponse(responseBody: string): {
  errorType?: string;
  errorMessage?: string;
  invalidFields?: string[];
  details?: any;
} {
  try {
    const parsed = JSON.parse(responseBody);

    if (parsed.error) {
      return {
        errorType: parsed.error.type,
        errorMessage: parsed.error.message,
        invalidFields: extractFieldNamesFromError(parsed.error.message),
        details: parsed.error
      };
    }

    return { details: parsed };
  } catch {
    // If JSON parsing fails, try to extract field names from raw text
    return {
      invalidFields: extractFieldNamesFromError(responseBody),
      errorMessage: responseBody
    };
  }
}

// === Error Creation Functions ===

export function createAirtableError(
  message: string,
  errorType: AirtableErrorType,
  context: Partial<AirtableErrorContext>,
  originalError?: Error,
  response?: Response
): AirtableError {
  const severity = getErrorSeverity(errorType);
  const userMessage = getUserFriendlyMessage(errorType);

  const enhancedError = createDataFetchingError(
    message,
    ErrorContext.API_ROUTE,
    {
      severity,
      userMessage,
      code: errorType,
      statusCode: response?.status,
      retryable: isRetryableError(errorType),
      debugInfo: {
        originalError: originalError?.message,
        originalStack: originalError?.stack
      }
    }
  ) as AirtableError;

  enhancedError.airtableErrorType = errorType;
  enhancedError.airtableContext = {
    timestamp: Date.now(),
    ...context
  };

  return enhancedError;
}

export function createFieldMappingError(
  tableName: string,
  invalidFields: string[],
  context: Partial<AirtableErrorContext> = {}
): AirtableError {
  const message = `Field mapping error in table "${tableName}": Unknown fields [${invalidFields.join(', ')}]`;

  return createAirtableError(
    message,
    AirtableErrorType.UNKNOWN_FIELD,
    {
      tableName,
      invalidFields,
      operation: 'field_validation',
      ...context
    }
  );
}

export function createBaseIdError(
  baseId: string,
  tableName?: string,
  context: Partial<AirtableErrorContext> = {}
): AirtableError {
  const isValidFormat = validateBaseId(baseId);
  const errorType = isValidFormat ? AirtableErrorType.BASE_ID_ACCESS : AirtableErrorType.BASE_ID_INVALID;

  const message = isValidFormat
    ? `Cannot access Airtable base "${baseId}"${tableName ? ` for table "${tableName}"` : ''}`
    : `Invalid Airtable base ID format: "${baseId}". Expected format: app + 14 alphanumeric characters`;

  return createAirtableError(
    message,
    errorType,
    {
      baseId,
      tableName,
      operation: 'base_validation',
      ...context
    }
  );
}

// === Error Severity and User Messages ===

function getErrorSeverity(errorType: AirtableErrorType): ErrorSeverity {
  switch (errorType) {
    case AirtableErrorType.BASE_ID_INVALID:
    case AirtableErrorType.AUTHENTICATION:
      return ErrorSeverity.CRITICAL;

    case AirtableErrorType.UNKNOWN_FIELD:
    case AirtableErrorType.BASE_ID_ACCESS:
    case AirtableErrorType.PERMISSION_DENIED:
      return ErrorSeverity.HIGH;

    case AirtableErrorType.RATE_LIMIT:
    case AirtableErrorType.VALIDATION_ERROR:
      return ErrorSeverity.MEDIUM;

    case AirtableErrorType.RECORD_NOT_FOUND:
    case AirtableErrorType.NETWORK:
      return ErrorSeverity.LOW;

    default:
      return ErrorSeverity.MEDIUM;
  }
}

function getUserFriendlyMessage(errorType: AirtableErrorType): string {
  switch (errorType) {
    case AirtableErrorType.UNKNOWN_FIELD:
      return "ڈیٹا فیلڈ کی خرابی، براہ کرم دوبارہ کوشش کریں۔";

    case AirtableErrorType.BASE_ID_INVALID:
    case AirtableErrorType.BASE_ID_ACCESS:
      return "ڈیٹابیس کنکشن کی خرابی، براہ کرم بعد میں کوشش کریں۔";

    case AirtableErrorType.AUTHENTICATION:
      return "اجازت کی خرابی، براہ کرم دوبارہ لاگ ان کریں۔";

    case AirtableErrorType.RATE_LIMIT:
      return "بہت زیادہ درخواستیں، براہ کرم کچھ دیر انتظار کریں۔";

    case AirtableErrorType.PERMISSION_DENIED:
      return "اس ڈیٹا تک رسائی کی اجازت نہیں ہے۔";

    case AirtableErrorType.RECORD_NOT_FOUND:
      return "یہ ڈیٹا دستیاب نہیں ہے۔";

    case AirtableErrorType.NETWORK:
      return "انٹرنیٹ کنکشن کی خرابی، براہ کرم دوبارہ کوشش کریں۔";

    default:
      return "ڈیٹا لوڈ کرنے میں خرابی، براہ کرم دوبارہ کوشش کریں۔";
  }
}

function isRetryableError(errorType: AirtableErrorType): boolean {
  switch (errorType) {
    case AirtableErrorType.RATE_LIMIT:
    case AirtableErrorType.NETWORK:
      return true;

    case AirtableErrorType.BASE_ID_INVALID:
    case AirtableErrorType.AUTHENTICATION:
    case AirtableErrorType.PERMISSION_DENIED:
    case AirtableErrorType.UNKNOWN_FIELD:
      return false;

    default:
      return true;
  }
}

// === Logging Functions ===

export class AirtableErrorLogger {
  private static instance: AirtableErrorLogger;
  private errorCounts: Map<string, number> = new Map();
  private lastErrors: Map<string, AirtableError> = new Map();

  static getInstance(): AirtableErrorLogger {
    if (!AirtableErrorLogger.instance) {
      AirtableErrorLogger.instance = new AirtableErrorLogger();
    }
    return AirtableErrorLogger.instance;
  }

  /**
   * Log an Airtable error with comprehensive context
   */
  logAirtableError(error: AirtableError): void {
    const context = error.airtableContext;
    const errorKey = this.getErrorKey(error);

    // Track error frequency
    const count = (this.errorCounts.get(errorKey) || 0) + 1;
    this.errorCounts.set(errorKey, count);
    this.lastErrors.set(errorKey, error);

    // Log with appropriate level based on severity
    const logLevel = this.getLogLevel(error.severity);
    const logContext = 'AIRTABLE_ERROR';

    // Create detailed log message
    const logMessage = this.formatErrorMessage(error, count);

    // Create comprehensive log data
    const logData = {
      errorType: error.airtableErrorType,
      errorCount: count,
      baseId: context.baseId,
      tableName: context.tableName,
      contentType: context.contentType,
      operation: context.operation,
      httpStatus: context.httpStatus,
      requestedFields: context.requestedFields,
      invalidFields: context.invalidFields,
      fieldSuggestions: context.fieldSuggestions,
      apiUrl: context.apiUrl,
      retryAttempt: context.retryAttempt,
      isRetryable: error.retryable,
      timestamp: new Date(context.timestamp).toISOString()
    };

    // Log using the enhanced logger
    switch (logLevel) {
      case LogLevel.DEBUG:
        logger.debug(logContext, logMessage, logData);
        break;
      case LogLevel.INFO:
        logger.info(logContext, logMessage, logData);
        break;
      case LogLevel.WARN:
        logger.warn(logContext, logMessage, logData);
        break;
      case LogLevel.ERROR:
        logger.error(logContext, logMessage, error, logData);
        break;
      case LogLevel.CRITICAL:
        logger.critical(logContext, logMessage, error, logData);
        break;
    }

    // Log field mapping details if available
    if (error.airtableErrorType === AirtableErrorType.UNKNOWN_FIELD && context.invalidFields?.length) {
      this.logFieldMappingDetails(context);
    }

    // Log base ID validation details
    if (error.airtableErrorType === AirtableErrorType.BASE_ID_INVALID ||
      error.airtableErrorType === AirtableErrorType.BASE_ID_ACCESS) {
      this.logBaseIdDetails(context);
    }
  }

  /**
   * Log field mapping validation results
   */
  logFieldValidation(
    tableName: string,
    contentType: string,
    requestedFields: string[],
    validFields: string[],
    invalidFields: string[],
    corrections: Record<string, string>
  ): void {
    const hasErrors = invalidFields.length > 0;
    const hasCorrections = Object.keys(corrections).length > 0;

    if (hasErrors || hasCorrections) {
      const message = `Field validation for ${tableName} (${contentType})`;
      const logLevel = hasErrors ? LogLevel.WARN : LogLevel.INFO;

      if (logLevel === LogLevel.WARN) {
        logger.warn('FIELD_VALIDATION', message, {
          tableName,
          contentType,
          requestedFields,
          validFields,
          invalidFields,
          corrections,
          validationResult: hasErrors ? 'failed' : 'success_with_corrections'
        });
      } else {
        logger.info('FIELD_VALIDATION', message, {
          tableName,
          contentType,
          requestedFields,
          validFields,
          invalidFields,
          corrections,
          validationResult: hasErrors ? 'failed' : 'success_with_corrections'
        });
      }
    }
  }

  /**
   * Log base ID usage and validation
   */
  logBaseIdUsage(
    baseId: string,
    tableName: string,
    operation: string,
    success: boolean,
    details?: any
  ): void {
    const message = `Base ID usage: ${baseId} for ${tableName} (${operation}) - ${success ? 'success' : 'failed'}`;
    const logLevel = success ? LogLevel.DEBUG : LogLevel.ERROR;

    if (logLevel === LogLevel.DEBUG) {
      logger.debug('BASE_ID_USAGE', message, {
        baseId,
        tableName,
        operation,
        success,
        isValidFormat: validateBaseId(baseId),
        details
      });
    } else {
      logger.error('BASE_ID_USAGE', message, undefined, {
        baseId,
        tableName,
        operation,
        success,
        isValidFormat: validateBaseId(baseId),
        details
      });
    }
  }

  /**
   * Log API request details for debugging
   */
  logApiRequest(
    method: string,
    url: string,
    params: any,
    response?: Response,
    error?: Error
  ): void {
    const success = !error && response?.ok;
    const message = `Airtable API ${method} ${url} - ${success ? 'success' : 'failed'}`;
    const logLevel = success ? LogLevel.DEBUG : LogLevel.ERROR;

    if (logLevel === LogLevel.DEBUG) {
      logger.debug('AIRTABLE_API', message, {
        method,
        url,
        params,
        status: response?.status,
        statusText: response?.statusText,
        error: error?.message,
        success
      });
    } else {
      logger.error('AIRTABLE_API', message, error ? error as EnhancedError : undefined, {
        method,
        url,
        params,
        status: response?.status,
        statusText: response?.statusText,
        error: error?.message,
        success
      });
    }
  }

  // === Private Helper Methods ===

  private getErrorKey(error: AirtableError): string {
    const context = error.airtableContext;
    return `${error.airtableErrorType}:${context.baseId}:${context.tableName}:${context.invalidFields?.join(',')}`;
  }

  private getLogLevel(severity: ErrorSeverity): LogLevel {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return LogLevel.CRITICAL;
      case ErrorSeverity.HIGH:
        return LogLevel.ERROR;
      case ErrorSeverity.MEDIUM:
        return LogLevel.WARN;
      case ErrorSeverity.LOW:
        return LogLevel.INFO;
      default:
        return LogLevel.ERROR;
    }
  }

  private formatErrorMessage(error: AirtableError, count: number): string {
    const context = error.airtableContext;
    const countSuffix = count > 1 ? ` (occurred ${count} times)` : '';

    return `${error.airtableErrorType}: ${error.message}${countSuffix}`;
  }

  private logFieldMappingDetails(context: AirtableErrorContext): void {
    if (!context.invalidFields?.length) return;

    logger.warn('FIELD_MAPPING_DETAILS', 'Invalid field mapping detected', {
      tableName: context.tableName,
      contentType: context.contentType,
      invalidFields: context.invalidFields,
      suggestions: context.fieldSuggestions,
      requestedFields: context.requestedFields,
      validFields: context.validFields
    });
  }

  private logBaseIdDetails(context: AirtableErrorContext): void {
    if (!context.baseId) return;

    const isValidFormat = validateBaseId(context.baseId);

    logger.error('BASE_ID_DETAILS', 'Base ID validation failed', undefined, {
      baseId: context.baseId,
      tableName: context.tableName,
      isValidFormat,
      expectedFormat: 'app + 14 alphanumeric characters',
      actualLength: context.baseId.length,
      startsWithApp: context.baseId.startsWith('app')
    });
  }
}

// === Convenience Functions ===

export const airtableErrorLogger = AirtableErrorLogger.getInstance();

export function logAirtableError(error: AirtableError): void {
  airtableErrorLogger.logAirtableError(error);
}

export function logFieldValidation(
  tableName: string,
  contentType: string,
  requestedFields: string[],
  validFields: string[],
  invalidFields: string[],
  corrections: Record<string, string>
): void {
  airtableErrorLogger.logFieldValidation(
    tableName,
    contentType,
    requestedFields,
    validFields,
    invalidFields,
    corrections
  );
}

export function logBaseIdUsage(
  baseId: string,
  tableName: string,
  operation: string,
  success: boolean,
  details?: any
): void {
  airtableErrorLogger.logBaseIdUsage(baseId, tableName, operation, success, details);
}

export function logApiRequest(
  method: string,
  url: string,
  params: any,
  response?: Response,
  error?: Error
): void {
  airtableErrorLogger.logApiRequest(method, url, params, response, error);
}

// === Error Handling Wrapper ===

/**
 * Wrap Airtable API calls with comprehensive error logging
 */
export async function withAirtableErrorLogging<T>(
  operation: string,
  context: Partial<AirtableErrorContext>,
  apiCall: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await apiCall();

    // Log successful operation
    if (context.baseId && context.tableName) {
      logBaseIdUsage(context.baseId, context.tableName, operation, true, {
        duration: Date.now() - startTime
      });
    }

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    // Create and log Airtable error
    const airtableError = error instanceof Error
      ? createAirtableError(
        `${operation} failed: ${error.message}`,
        detectAirtableErrorType(error),
        {
          ...context,
          operation,
          timestamp: startTime
        },
        error
      )
      : createAirtableError(
        `${operation} failed with unknown error`,
        AirtableErrorType.FIELD_MAPPING,
        {
          ...context,
          operation,
          timestamp: startTime
        }
      );

    logAirtableError(airtableError);

    // Log failed base ID usage
    if (context.baseId && context.tableName) {
      logBaseIdUsage(context.baseId, context.tableName, operation, false, {
        duration,
        error: error instanceof Error ? error.message : String(error)
      });
    }

    throw airtableError;
  }
}