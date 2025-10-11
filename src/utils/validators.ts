/**
 * Validation utilities for form inputs and data validation.
 * Provides common validators used across the application.
 */

/**
 * Check if a string is empty or contains only whitespace
 */
export function isEmpty(value: string | null | undefined): boolean {
  return !value || value.trim().length === 0;
}

/**
 * Check if a value is not empty
 */
export function isNotEmpty(value: string | null | undefined): boolean {
  return !isEmpty(value);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
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
 * Check if a string has minimum length
 */
export function hasMinLength(value: string, minLength: number): boolean {
  return value.length >= minLength;
}

/**
 * Check if a string has maximum length
 */
export function hasMaxLength(value: string, maxLength: number): boolean {
  return value.length <= maxLength;
}

/**
 * Check if a string is within length range
 */
export function isWithinLength(
  value: string,
  minLength: number,
  maxLength: number
): boolean {
  return hasMinLength(value, minLength) && hasMaxLength(value, maxLength);
}

/**
 * Validate comment content
 */
export function isValidComment(comment: string): boolean {
  return (
    isNotEmpty(comment) &&
    hasMinLength(comment.trim(), 4) &&
    hasMaxLength(comment, 1000)
  );
}

/**
 * Validate Airtable record ID format
 */
export function isValidRecordId(id: string): boolean {
  // Airtable record IDs start with 'rec' followed by 14 alphanumeric characters
  const recordIdRegex = /^rec[a-zA-Z0-9]{14}$/;
  return recordIdRegex.test(id);
}

/**
 * Check if a string is a valid domain ID
 * (non-empty, length <= 100, allowed characters)
 */
export function isValidDomainId(id: string): boolean {
  if (!id || typeof id !== "string") return false;
  if (id.length === 0 || id.length > 100) return false;
  // Allow alphanumeric characters, hyphens, underscores, and dots
  const domainIdRegex = /^[a-zA-Z0-9\-_.]+$/;
  return domainIdRegex.test(id);
}

/**
 * Check if a value is a positive number
 */
export function isPositiveNumber(value: number): boolean {
  return typeof value === "number" && value > 0 && !isNaN(value);
}

/**
 * Check if a value is a non-negative number
 */
export function isNonNegativeNumber(value: number): boolean {
  return typeof value === "number" && value >= 0 && !isNaN(value);
}

/**
 * Validate pagination parameters
 */
export function isValidPageSize(pageSize: number): boolean {
  return isPositiveNumber(pageSize) && pageSize <= 100;
}

/**
 * Check if a string contains only allowed characters for search
 */
export function isValidSearchTerm(searchTerm: string): boolean {
  if (isEmpty(searchTerm)) return true; // Empty search is valid

  // Allow letters, numbers, spaces, and common punctuation
  const allowedCharsRegex = /^[\p{L}\p{N}\s\-_.،؍؎؏ؘؙؚؐؑؒؓؔؕؖؗ؛؞؟]+$/u;
  return allowedCharsRegex.test(searchTerm) && searchTerm.length <= 100;
}

/**
 * Validate filter by formula syntax (basic check)
 */
export function isValidFilterFormula(formula: string): boolean {
  if (isEmpty(formula)) return true; // Empty filter is valid

  // Basic check for balanced parentheses and valid characters
  let openParens = 0;
  for (const char of formula) {
    if (char === "(") openParens++;
    if (char === ")") openParens--;
    if (openParens < 0) return false;
  }

  return openParens === 0 && formula.length <= 500;
}

/**
 * Comprehensive validation for comment form data
 */
export interface CommentValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateCommentData(data: {
  dataId: string;
  comment: string;
  commentorName?: string;
}): CommentValidationResult {
  const errors: string[] = [];

  if (!isValidRecordId(data.dataId)) {
    errors.push("Invalid record ID format");
  }

  if (!isValidComment(data.comment)) {
    errors.push("Comment must be between 4 and 1000 characters");
  }

  if (
    data.commentorName &&
    (isEmpty(data.commentorName) || !hasMaxLength(data.commentorName, 100))
  ) {
    errors.push(
      "Commentor name must not be empty and less than 100 characters"
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
