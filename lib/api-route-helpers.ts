/**
 * API Route Helpers
 * 
 * Provides utilities and patterns for creating robust API routes
 * that work with the new error handling and validation infrastructure.
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import {
  EnhancedAPIResponse,
  RequestValidator,
  type ValidationRule
} from "./enhanced-api-response";
import {
  ErrorSeverity,
  createServerError
} from "./error-handling";
import { HTTPCacheHeaders } from "@/lib/cache-strategies";

// Common validation rules
export const commonValidationRules = {
  pageSize: {
    field: 'pageSize',
    type: 'number' as const,
    min: 1,
    max: 100,
    validator: (value: number) => Number.isInteger(value) || 'Page size must be an integer'
  },
  offset: {
    field: 'offset',
    type: 'string' as const,
    required: false
  },
  filterByFormula: {
    field: 'filterByFormula',
    type: 'string' as const,
    required: false,
    validator: (value: string) => {
      // Basic Airtable formula validation
      if (!value) return true;

      // Check for balanced parentheses
      let openParens = 0;
      for (const char of value) {
        if (char === '(') openParens++;
        if (char === ')') openParens--;
        if (openParens < 0) return 'Invalid formula: unmatched closing parenthesis';
      }

      if (openParens > 0) return 'Invalid formula: unmatched opening parenthesis';

      // Check for dangerous patterns
      const dangerousPatterns = [
        /javascript:/i,
        /<script/i,
        /eval\(/i,
        /function\s*\(/i
      ];

      for (const pattern of dangerousPatterns) {
        if (pattern.test(value)) {
          return 'Invalid formula: contains dangerous content';
        }
      }

      return true;
    }
  },
  search: {
    field: 'search',
    type: 'string' as const,
    required: false,
    max: 200
  },
  fields: {
    field: 'fields',
    type: 'string' as const,
    required: false
  },
  sort: {
    field: 'sort',
    type: 'string' as const,
    required: false,
    validator: (value: string) => {
      if (!value) return true;

      // Validate sort format: field:direction,field:direction
      const sortParts = value.split(',');
      for (const part of sortParts) {
        const [field, direction] = part.split(':');
        if (!field) return 'Sort field cannot be empty';
        if (direction && !['asc', 'desc'].includes(direction)) {
          return 'Sort direction must be "asc" or "desc"';
        }
      }

      return true;
    }
  }
};

// Request parsing utilities
export class RequestParser {
  static parseSearchParams(request: NextRequest): Record<string, any> {
    const { searchParams } = new URL(request.url);
    const params: Record<string, any> = {};

    // Parse common parameters
    const pageSize = searchParams.get("pageSize");
    if (pageSize) {
      params.pageSize = parseInt(pageSize);
    }

    params.offset = searchParams.get("offset") || undefined;
    params.filterByFormula = searchParams.get("filterByFormula") || undefined;
    params.search = searchParams.get("search") || undefined;
    params.fields = searchParams.get("fields") || undefined;
    params.sort = searchParams.get("sort") || undefined;
    params.view = searchParams.get("view") || undefined;

    return params;
  }

  static parseSortParameter(sort: string | undefined): Array<{ field: string; direction: "asc" | "desc" }> | undefined {
    if (!sort) return undefined;

    return sort.split(",").map((s: string) => {
      const [field, direction] = s.split(":");
      return {
        field: field.trim(),
        direction: (direction?.trim() as "asc" | "desc") || "desc"
      };
    });
  }

  static async parseJSONBody<T = any>(request: NextRequest): Promise<T> {
    try {
      return await request.json();
    } catch (error) {
      throw createServerError("Invalid JSON in request body", {
        code: 'INVALID_JSON',
        statusCode: 400,
        severity: ErrorSeverity.LOW
      });
    }
  }
}

// Authentication helpers
export class AuthHelper {
  static async requireAuth(request: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
      throw createServerError("Authentication required", {
        code: 'AUTHENTICATION_REQUIRED',
        statusCode: 401,
        severity: ErrorSeverity.MEDIUM,
        userMessage: "لاگ ان کریں"
      });
    }

    return { userId };
  }

  static async getOptionalAuth() {
    try {
      const { userId } = await auth();
      return { userId: userId || null };
    } catch (error) {
      return { userId: null };
    }
  }
}

// Rate limiting helper (basic implementation)
export class RateLimiter {
  private static requests = new Map<string, { count: number; resetTime: number }>();
  private static readonly WINDOW_MS = 60 * 1000; // 1 minute
  private static readonly MAX_REQUESTS = 100; // per window

  static check(identifier: string, maxRequests = this.MAX_REQUESTS): boolean {
    const now = Date.now();
    const windowStart = now - this.WINDOW_MS;

    // Clean up old entries
    for (const [key, data] of this.requests.entries()) {
      if (data.resetTime < windowStart) {
        this.requests.delete(key);
      }
    }

    const current = this.requests.get(identifier);

    if (!current) {
      this.requests.set(identifier, { count: 1, resetTime: now });
      return true;
    }

    if (current.resetTime < windowStart) {
      this.requests.set(identifier, { count: 1, resetTime: now });
      return true;
    }

    if (current.count >= maxRequests) {
      return false;
    }

    current.count++;
    return true;
  }

  static getRemainingTime(identifier: string): number {
    const current = this.requests.get(identifier);
    if (!current) return 0;

    const now = Date.now();
    const windowStart = now - this.WINDOW_MS;

    return Math.max(0, current.resetTime + this.WINDOW_MS - now);
  }
}

// API route wrapper with error handling
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      return await handler(...args);
    } catch (error) {
      console.error(`[${requestId}] API route error:`, error);

      if (error && typeof error === 'object' && 'statusCode' in error) {
        // Already an enhanced error
        return EnhancedAPIResponse.error(error as any, undefined, { requestId });
      }

      // Wrap unknown errors
      const enhancedError = createServerError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        {
          code: 'UNKNOWN_ERROR',
          statusCode: 500,
          severity: ErrorSeverity.HIGH,
          debugInfo: {
            originalError: error,
            requestId
          }
        }
      );

      return EnhancedAPIResponse.error(enhancedError, 500, { requestId });
    }
  };
}

// Validation middleware
export function withValidation(rules: ValidationRule[]) {
  return function <T extends any[]>(
    handler: (validatedData: any, request: NextRequest, ...args: T) => Promise<Response>
  ) {
    return async (request: NextRequest, ...args: T): Promise<Response> => {
      const params = RequestParser.parseSearchParams(request);
      const validation = RequestValidator.validate(params, rules);

      if (!validation.isValid) {
        return EnhancedAPIResponse.badRequest(
          "Validation failed",
          { errors: validation.errors }
        );
      }

      const sanitizedData = RequestValidator.sanitizeObject(params, rules);
      return handler(sanitizedData, request, ...args);
    };
  };
}

// Rate limiting middleware
export function withRateLimit(maxRequests = 100, windowMs = 60000) {
  return function <T extends any[]>(
    handler: (request: NextRequest, ...args: T) => Promise<Response>
  ) {
    return async (request: NextRequest, ...args: T): Promise<Response> => {
      // Use IP address or user ID as identifier
      const forwarded = request.headers.get('x-forwarded-for');
      const ip = forwarded ? forwarded.split(',')[0] : 'unknown';

      if (!RateLimiter.check(ip, maxRequests)) {
        const retryAfter = Math.ceil(RateLimiter.getRemainingTime(ip) / 1000);
        return EnhancedAPIResponse.tooManyRequests(
          "Rate limit exceeded",
          retryAfter
        );
      }

      return handler(request, ...args);
    };
  };
}

// Compose multiple middlewares
export function compose<T extends any[]>(
  ...middlewares: Array<(handler: (request: NextRequest, ...args: T) => Promise<Response>) => (request: NextRequest, ...args: T) => Promise<Response>>
) {
  return function (handler: (request: NextRequest, ...args: T) => Promise<Response>) {
    return middlewares.reduceRight(
      (acc, middleware) => middleware(acc),
      handler
    );
  };
}

// Caching middleware
export function withCaching(options: {
  type?: 'static' | 'dynamic' | 'private';
  maxAge?: number;
  staleWhileRevalidate?: number;
} = {}) {
  return function <T extends any[]>(
    handler: (request: NextRequest, ...args: T) => Promise<Response>
  ) {
    return async (request: NextRequest, ...args: T): Promise<Response> => {
      const response = await handler(request, ...args);

      // Only add cache headers to successful responses
      if (response.status >= 200 && response.status < 300) {
        const headers = options.type === 'static'
          ? HTTPCacheHeaders.staticContentHeaders()
          : options.type === 'private'
            ? HTTPCacheHeaders.privateContentHeaders()
            : HTTPCacheHeaders.dynamicContentHeaders();

        // Apply custom options if provided
        if (options.maxAge || options.staleWhileRevalidate) {
          const customHeaders = HTTPCacheHeaders.generateHeaders({
            maxAge: options.maxAge,
            staleWhileRevalidate: options.staleWhileRevalidate
          });
          Object.assign(headers, customHeaders);
        }

        // Add headers to response
        for (const [key, value] of Object.entries(headers)) {
          response.headers.set(key, value);
        }
      }

      return response;
    };
  };
}

// Example usage patterns
export const createStandardGETHandler = compose(
  withErrorHandling,
  withCaching({ type: 'dynamic', maxAge: 300 }), // 5 minutes cache
  withRateLimit(100),
  withValidation([
    commonValidationRules.pageSize,
    commonValidationRules.offset,
    commonValidationRules.filterByFormula,
    commonValidationRules.search,
    commonValidationRules.fields,
    commonValidationRules.sort
  ])
);

export const createAuthenticatedPOSTHandler = compose(
  withErrorHandling,
  withCaching({ type: 'private' }), // No caching for authenticated requests
  withRateLimit(50)
);