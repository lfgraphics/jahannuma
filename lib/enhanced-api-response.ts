/**
 * Enhanced API Response Utilities
 * 
 * Provides improved API response handling that works with the new
 * error handling infrastructure and includes proper validation,
 * sanitization, and logging.
 */

import { NextResponse } from "next/server";
import {
  ErrorHandler,
  ErrorSeverity,
  createServerError,
  type EnhancedError
} from "./error-handling";

// Response types
export interface APISuccessResponse<T = any> {
  success: true;
  data: T;
  meta?: {
    timestamp: string;
    requestId?: string;
    version?: string;
  };
}

export interface APIErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    statusCode: number;
    details?: any;
    requestId?: string;
    timestamp: string;
  };
}

export type APIResponse<T = any> = APISuccessResponse<T> | APIErrorResponse;

// Request validation types
export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  min?: number;
  max?: number;
  pattern?: RegExp;
  validator?: (value: any) => boolean | string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Enhanced API response class
export class EnhancedAPIResponse {
  private static errorHandler = ErrorHandler.getInstance();

  // Generate request ID for tracking
  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Success responses
  static ok<T>(data: T, options?: {
    requestId?: string;
    meta?: Record<string, any>;
    headers?: Record<string, string>;
  }): NextResponse {
    const requestId = options?.requestId || this.generateRequestId();

    const response: APISuccessResponse<T> = {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
        version: process.env.API_VERSION || '1.0',
        ...options?.meta
      }
    };

    const headers = {
      'X-Request-ID': requestId,
      'Content-Type': 'application/json',
      ...options?.headers
    };

    return NextResponse.json(response, { headers });
  }

  static created<T>(data: T, options?: {
    requestId?: string;
    location?: string;
    headers?: Record<string, string>;
  }): NextResponse {
    const requestId = options?.requestId || this.generateRequestId();

    const response: APISuccessResponse<T> = {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
        version: process.env.API_VERSION || '1.0'
      }
    };

    const headers = {
      'X-Request-ID': requestId,
      'Content-Type': 'application/json',
      ...(options?.location && { 'Location': options.location }),
      ...options?.headers
    };

    return NextResponse.json(response, { status: 201, headers });
  }

  static noContent(options?: {
    requestId?: string;
    headers?: Record<string, string>;
  }): NextResponse {
    const requestId = options?.requestId || this.generateRequestId();

    const headers = {
      'X-Request-ID': requestId,
      ...options?.headers
    };

    return new NextResponse(null, { status: 204, headers });
  }

  // Error responses
  static error(
    error: EnhancedError | Error | string,
    statusCode = 500,
    options?: {
      requestId?: string;
      details?: any;
      headers?: Record<string, string>;
    }
  ): NextResponse {
    const requestId = options?.requestId || this.generateRequestId();

    let enhancedError: EnhancedError;

    if (typeof error === 'string') {
      enhancedError = createServerError(error, {
        statusCode,
        debugInfo: options?.details
      });
    } else if (error instanceof Error && 'context' in error) {
      enhancedError = error as EnhancedError;
    } else {
      enhancedError = createServerError(error.message, {
        statusCode,
        debugInfo: { originalError: error, ...options?.details }
      });
    }

    // Log the error
    this.errorHandler.logError(enhancedError);

    const response: APIErrorResponse = {
      success: false,
      error: {
        message: enhancedError.userMessage || enhancedError.message,
        code: enhancedError.code || 'UNKNOWN_ERROR',
        statusCode: enhancedError.statusCode || statusCode,
        details: process.env.NODE_ENV === 'development' ? enhancedError.debugInfo : undefined,
        requestId,
        timestamp: new Date().toISOString()
      }
    };

    const headers = {
      'X-Request-ID': requestId,
      'Content-Type': 'application/json',
      ...options?.headers
    };

    return NextResponse.json(response, {
      status: enhancedError.statusCode || statusCode,
      headers
    });
  }

  // Specific error types
  static badRequest(
    message = "Bad Request",
    details?: any,
    options?: { requestId?: string }
  ): NextResponse {
    const error = createServerError(message, {
      code: 'BAD_REQUEST',
      statusCode: 400,
      severity: ErrorSeverity.LOW,
      userMessage: "غلط درخواست",
      debugInfo: details
    });

    return this.error(error, 400, options);
  }

  static unauthorized(
    message = "Unauthorized",
    options?: { requestId?: string }
  ): NextResponse {
    const error = createServerError(message, {
      code: 'UNAUTHORIZED',
      statusCode: 401,
      severity: ErrorSeverity.MEDIUM,
      userMessage: "اجازت نہیں ہے"
    });

    return this.error(error, 401, options);
  }

  static forbidden(
    message = "Forbidden",
    options?: { requestId?: string }
  ): NextResponse {
    const error = createServerError(message, {
      code: 'FORBIDDEN',
      statusCode: 403,
      severity: ErrorSeverity.MEDIUM,
      userMessage: "ممنوع"
    });

    return this.error(error, 403, options);
  }

  static notFound(
    message = "Not Found",
    options?: { requestId?: string }
  ): NextResponse {
    const error = createServerError(message, {
      code: 'NOT_FOUND',
      statusCode: 404,
      severity: ErrorSeverity.LOW,
      userMessage: "نہیں ملا"
    });

    return this.error(error, 404, options);
  }

  static conflict(
    message = "Conflict",
    details?: any,
    options?: { requestId?: string }
  ): NextResponse {
    const error = createServerError(message, {
      code: 'CONFLICT',
      statusCode: 409,
      severity: ErrorSeverity.MEDIUM,
      userMessage: "تضاد",
      debugInfo: details
    });

    return this.error(error, 409, options);
  }

  static tooManyRequests(
    message = "Too Many Requests",
    retryAfter?: number,
    options?: { requestId?: string }
  ): NextResponse {
    const error = createServerError(message, {
      code: 'TOO_MANY_REQUESTS',
      statusCode: 429,
      severity: ErrorSeverity.MEDIUM,
      userMessage: "بہت زیادہ درخواستیں"
    });

    const headers = retryAfter ? { 'Retry-After': retryAfter.toString() } : undefined;

    return this.error(error, 429, { ...options, headers });
  }

  static internal(
    message = "Internal Server Error",
    details?: any,
    options?: { requestId?: string }
  ): NextResponse {
    const error = createServerError(message, {
      code: 'INTERNAL_ERROR',
      statusCode: 500,
      severity: ErrorSeverity.HIGH,
      userMessage: "سرور کی خرابی",
      debugInfo: details
    });

    return this.error(error, 500, options);
  }

  static serviceUnavailable(
    message = "Service Unavailable",
    retryAfter?: number,
    options?: { requestId?: string }
  ): NextResponse {
    const error = createServerError(message, {
      code: 'SERVICE_UNAVAILABLE',
      statusCode: 503,
      severity: ErrorSeverity.HIGH,
      userMessage: "سروس دستیاب نہیں"
    });

    const headers = retryAfter ? { 'Retry-After': retryAfter.toString() } : undefined;

    return this.error(error, 503, { ...options, headers });
  }
}

// Request validation utilities
export class RequestValidator {
  static validate(data: any, rules: ValidationRule[]): ValidationResult {
    const errors: string[] = [];

    for (const rule of rules) {
      const value = data[rule.field];

      // Check required fields
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`Field '${rule.field}' is required`);
        continue;
      }

      // Skip validation if field is not required and not present
      if (!rule.required && (value === undefined || value === null)) {
        continue;
      }

      // Type validation
      if (rule.type) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        if (actualType !== rule.type) {
          errors.push(`Field '${rule.field}' must be of type ${rule.type}, got ${actualType}`);
          continue;
        }
      }

      // Length/size validation
      if (rule.min !== undefined) {
        const length = typeof value === 'string' || Array.isArray(value) ? value.length : value;
        if (length < rule.min) {
          errors.push(`Field '${rule.field}' must be at least ${rule.min}`);
        }
      }

      if (rule.max !== undefined) {
        const length = typeof value === 'string' || Array.isArray(value) ? value.length : value;
        if (length > rule.max) {
          errors.push(`Field '${rule.field}' must be at most ${rule.max}`);
        }
      }

      // Pattern validation
      if (rule.pattern && typeof value === 'string') {
        if (!rule.pattern.test(value)) {
          errors.push(`Field '${rule.field}' does not match required pattern`);
        }
      }

      // Custom validator
      if (rule.validator) {
        const result = rule.validator(value);
        if (result !== true) {
          errors.push(typeof result === 'string' ? result : `Field '${rule.field}' is invalid`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static sanitizeString(value: string, options?: {
    maxLength?: number;
    allowHTML?: boolean;
    trim?: boolean;
  }): string {
    let sanitized = value;

    if (options?.trim !== false) {
      sanitized = sanitized.trim();
    }

    if (options?.maxLength) {
      sanitized = sanitized.substring(0, options.maxLength);
    }

    if (!options?.allowHTML) {
      // Basic HTML sanitization - remove script tags and event handlers
      sanitized = sanitized
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .replace(/on\w+='[^']*'/gi, '');
    }

    return sanitized;
  }

  static sanitizeObject(obj: any, rules: ValidationRule[]): any {
    const sanitized: any = {};

    for (const rule of rules) {
      const value = obj[rule.field];

      if (value !== undefined && value !== null) {
        if (rule.type === 'string' && typeof value === 'string') {
          sanitized[rule.field] = this.sanitizeString(value, {
            maxLength: rule.max,
            trim: true
          });
        } else {
          sanitized[rule.field] = value;
        }
      }
    }

    return sanitized;
  }
}

// Backward compatibility exports
export const ok = EnhancedAPIResponse.ok;
export const created = EnhancedAPIResponse.created;
export const noContent = EnhancedAPIResponse.noContent;

export const errors = {
  badRequest: EnhancedAPIResponse.badRequest,
  unauthorized: EnhancedAPIResponse.unauthorized,
  forbidden: EnhancedAPIResponse.forbidden,
  notFound: EnhancedAPIResponse.notFound,
  conflict: EnhancedAPIResponse.conflict,
  tooManyRequests: EnhancedAPIResponse.tooManyRequests,
  internal: EnhancedAPIResponse.internal,
  serviceUnavailable: EnhancedAPIResponse.serviceUnavailable,
};

// Classes are already exported above
