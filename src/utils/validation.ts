/**
 * Validation utilities for forms and data.
 */

/**
 * Email validation
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Phone number validation (basic)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ""));
}

/**
 * URL validation
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if string is not empty after trimming
 */
export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Check if value is within length limits
 */
export function isValidLength(
  value: string,
  min: number,
  max: number
): boolean {
  const length = value.trim().length;
  return length >= min && length <= max;
}

/**
 * Validate comment content
 */
export function isValidComment(comment: string): {
  isValid: boolean;
  error?: string;
} {
  const trimmed = comment.trim();

  if (trimmed.length === 0) {
    return { isValid: false, error: "Comment cannot be empty" };
  }

  if (trimmed.length < 3) {
    return {
      isValid: false,
      error: "Comment must be at least 3 characters long",
    };
  }

  if (trimmed.length > 1000) {
    return {
      isValid: false,
      error: "Comment must be less than 1000 characters",
    };
  }

  return { isValid: true };
}

/**
 * Validate search query
 */
export function isValidSearchQuery(query: string): {
  isValid: boolean;
  error?: string;
} {
  const trimmed = query.trim();

  if (trimmed.length === 0) {
    return { isValid: false, error: "Search query cannot be empty" };
  }

  if (trimmed.length < 2) {
    return {
      isValid: false,
      error: "Search query must be at least 2 characters long",
    };
  }

  if (trimmed.length > 100) {
    return {
      isValid: false,
      error: "Search query must be less than 100 characters",
    };
  }

  return { isValid: true };
}

/**
 * Sanitize HTML input
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Check if value exists and is not null/undefined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type guard for checking if value is string
 */
export function isString(value: unknown): value is string {
  return typeof value === "string";
}

/**
 * Type guard for checking if value is number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value);
}

/**
 * Type guard for checking if value is boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}
