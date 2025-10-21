/**
 * Field validation system for Airtable API calls
 * Validates field names against known schema and provides suggestions for invalid fields
 * 
 * Requirements: 1.5, 5.3
 */

import { BASE_FIELDS, ENGLISH_FIELDS, FIELD_ALIASES, HINDI_FIELDS, MULTILINGUAL_FIELDS } from '../../../lib/multilingual-field-constants';

// Types for validation results
export interface ValidationResult {
  isValid: boolean;
  validFields: string[];
  invalidFields: string[];
  suggestions: Record<string, string | null>;
  warnings: string[];
}

export interface FieldSuggestion {
  field: string;
  suggestion: string | null;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
}

// Content type mapping for validation
export type ContentType = keyof typeof MULTILINGUAL_FIELDS;

// Known field patterns for suggestion algorithm
const FIELD_PATTERNS = {
  // Language prefixes
  ENGLISH_PREFIX: /^en[A-Z]/,
  HINDI_PREFIX: /^hi[A-Z]/,

  // Common field suffixes
  HEAD_SUFFIX: /Head$/,
  DESCRIPTION_SUFFIX: /Description$/,

  // Common field names
  COMMON_FIELDS: ['id', 'likes', 'shares', 'comments', 'unwan', 'shaer', 'body', 'sher', 'ghazal', 'nazm']
} as const;

/**
 * Validate field names against the known schema for a content type
 */
export function validateFields(contentType: ContentType, fields: string[]): ValidationResult {
  const validFieldsForType = MULTILINGUAL_FIELDS[contentType] as readonly string[];
  const validFields: string[] = [];
  const invalidFields: string[] = [];
  const suggestions: Record<string, string | null> = {};
  const warnings: string[] = [];

  for (const field of fields) {
    if (validFieldsForType.includes(field)) {
      validFields.push(field);
    } else {
      invalidFields.push(field);
      const suggestion = suggestCorrectField(contentType, field);
      suggestions[field] = suggestion.suggestion;

      if (suggestion.suggestion) {
        warnings.push(`Field '${field}' not found. Did you mean '${suggestion.suggestion}'? (${suggestion.reason})`);
      } else {
        warnings.push(`Field '${field}' not found in ${contentType} schema. No similar field found.`);
      }
    }
  }

  return {
    isValid: invalidFields.length === 0,
    validFields,
    invalidFields,
    suggestions,
    warnings
  };
}

/**
 * Get all valid fields for a content type
 */
export function getValidFields(contentType: ContentType): string[] {
  return [...MULTILINGUAL_FIELDS[contentType]];
}

/**
 * Suggest correct field name for an invalid field using multiple strategies
 */
export function suggestCorrectField(contentType: ContentType, invalidField: string): FieldSuggestion {
  const validFields = MULTILINGUAL_FIELDS[contentType] as readonly string[];

  // Strategy 1: Check field aliases (highest confidence)
  const aliasedField = FIELD_ALIASES[invalidField as keyof typeof FIELD_ALIASES];
  if (aliasedField && validFields.includes(aliasedField)) {
    return {
      field: invalidField,
      suggestion: aliasedField,
      confidence: 'high',
      reason: 'Known field alias mapping'
    };
  }

  // Strategy 2: Exact case-insensitive match
  const caseInsensitiveMatch = validFields.find(
    field => field.toLowerCase() === invalidField.toLowerCase()
  );
  if (caseInsensitiveMatch) {
    return {
      field: invalidField,
      suggestion: caseInsensitiveMatch,
      confidence: 'high',
      reason: 'Case mismatch'
    };
  }

  // Strategy 3: Handle common field transformations
  const transformationSuggestion = getTransformationSuggestion(contentType, invalidField, validFields);
  if (transformationSuggestion) {
    return transformationSuggestion;
  }

  // Strategy 4: Fuzzy string matching (Levenshtein distance)
  const fuzzySuggestion = getFuzzyMatch(invalidField, validFields);
  if (fuzzySuggestion) {
    return {
      field: invalidField,
      suggestion: fuzzySuggestion,
      confidence: 'medium',
      reason: 'Similar field name found'
    };
  }

  // Strategy 5: Partial substring matching
  const partialMatch = getPartialMatch(invalidField, validFields);
  if (partialMatch) {
    return {
      field: invalidField,
      suggestion: partialMatch,
      confidence: 'low',
      reason: 'Partial field name match'
    };
  }

  return {
    field: invalidField,
    suggestion: null,
    confidence: 'low',
    reason: 'No similar field found'
  };
}

/**
 * Handle common field transformations and patterns
 */
function getTransformationSuggestion(
  contentType: ContentType,
  invalidField: string,
  validFields: readonly string[]
): FieldSuggestion | null {
  // Handle "Head" suffix fields (e.g., ghazalHead -> ghazal)
  if (FIELD_PATTERNS.HEAD_SUFFIX.test(invalidField)) {
    const baseField = invalidField.replace(/Head$/, '');
    if (validFields.includes(baseField)) {
      return {
        field: invalidField,
        suggestion: baseField,
        confidence: 'high',
        reason: 'Head suffix should be derived from base field'
      };
    }

    // Try with language prefixes
    const enField = `en${baseField.charAt(0).toUpperCase()}${baseField.slice(1)}`;
    const hiField = `hi${baseField.charAt(0).toUpperCase()}${baseField.slice(1)}`;

    if (validFields.includes(enField)) {
      return {
        field: invalidField,
        suggestion: enField,
        confidence: 'medium',
        reason: 'Head field should use English prefix'
      };
    }

    if (validFields.includes(hiField)) {
      return {
        field: invalidField,
        suggestion: hiField,
        confidence: 'medium',
        reason: 'Head field should use Hindi prefix'
      };
    }
  }

  // Handle Description fields (commonly not present in schema)
  if (FIELD_PATTERNS.DESCRIPTION_SUFFIX.test(invalidField)) {
    // Description fields are often not present, suggest alternatives
    const baseField = invalidField.replace(/Description$/, '');
    const alternatives = ['body', 'sher', 'nazm', 'ghazal'].filter(alt => validFields.includes(alt));

    if (alternatives.length > 0) {
      return {
        field: invalidField,
        suggestion: alternatives[0],
        confidence: 'medium',
        reason: 'Description field not available, use content field instead'
      };
    }
  }

  // Handle language prefix mismatches
  if (FIELD_PATTERNS.ENGLISH_PREFIX.test(invalidField)) {
    const baseField = invalidField.replace(/^en/, '').toLowerCase();
    const matchingField = validFields.find(field =>
      field.toLowerCase().includes(baseField) && field.startsWith('en')
    );
    if (matchingField) {
      return {
        field: invalidField,
        suggestion: matchingField,
        confidence: 'high',
        reason: 'English field name case mismatch'
      };
    }
  }

  if (FIELD_PATTERNS.HINDI_PREFIX.test(invalidField)) {
    const baseField = invalidField.replace(/^hi/, '').toLowerCase();
    const matchingField = validFields.find(field =>
      field.toLowerCase().includes(baseField) && field.startsWith('hi')
    );
    if (matchingField) {
      return {
        field: invalidField,
        suggestion: matchingField,
        confidence: 'high',
        reason: 'Hindi field name case mismatch'
      };
    }
  }

  return null;
}

/**
 * Find fuzzy matches using Levenshtein distance
 */
function getFuzzyMatch(invalidField: string, validFields: readonly string[]): string | null {
  const threshold = Math.max(2, Math.floor(invalidField.length * 0.3)); // Allow 30% difference
  let bestMatch: string | null = null;
  let bestDistance = Infinity;

  for (const validField of validFields) {
    const distance = levenshteinDistance(invalidField.toLowerCase(), validField.toLowerCase());
    if (distance <= threshold && distance < bestDistance) {
      bestDistance = distance;
      bestMatch = validField;
    }
  }

  return bestMatch;
}

/**
 * Find partial matches (substring matching)
 */
function getPartialMatch(invalidField: string, validFields: readonly string[]): string | null {
  const lowerInvalid = invalidField.toLowerCase();

  // Find fields that contain the invalid field as substring
  const containsMatch = validFields.find(field =>
    field.toLowerCase().includes(lowerInvalid) || lowerInvalid.includes(field.toLowerCase())
  );

  return containsMatch || null;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Validate and clean field list for API calls
 * Returns only valid fields and logs warnings for invalid ones
 */
export function validateAndCleanFields(
  contentType: ContentType,
  fields: string[],
  options: {
    logWarnings?: boolean;
    throwOnInvalid?: boolean;
    includeSuggestions?: boolean;
  } = {}
): {
  validFields: string[];
  removedFields: string[];
  suggestions: Record<string, string | null>;
} {
  const { logWarnings = true, throwOnInvalid = false, includeSuggestions = true } = options;

  const validation = validateFields(contentType, fields);

  if (logWarnings && validation.warnings.length > 0) {
    console.warn(`Field validation warnings for ${contentType}:`, validation.warnings);
  }

  if (throwOnInvalid && !validation.isValid) {
    const errorMessage = `Invalid fields found for ${contentType}: ${validation.invalidFields.join(', ')}`;
    const suggestionsText = includeSuggestions && Object.keys(validation.suggestions).length > 0
      ? `\nSuggestions: ${Object.entries(validation.suggestions)
        .filter(([, suggestion]) => suggestion)
        .map(([field, suggestion]) => `${field} -> ${suggestion}`)
        .join(', ')}`
      : '';
    throw new Error(errorMessage + suggestionsText);
  }

  return {
    validFields: validation.validFields,
    removedFields: validation.invalidFields,
    suggestions: validation.suggestions
  };
}

/**
 * Get field categories for a content type (base, English, Hindi)
 */
export function getFieldCategories(contentType: ContentType): {
  base: string[];
  english: string[];
  hindi: string[];
} {
  return {
    base: [...(BASE_FIELDS[contentType] || [])],
    english: [...(ENGLISH_FIELDS[contentType] || [])],
    hindi: [...(HINDI_FIELDS[contentType] || [])]
  };
}

/**
 * Check if a field exists in any content type (useful for debugging)
 */
export function findFieldInAllContentTypes(fieldName: string): {
  contentType: ContentType;
  category: 'base' | 'english' | 'hindi';
}[] {
  const results: { contentType: ContentType; category: 'base' | 'english' | 'hindi' }[] = [];

  for (const contentType of Object.keys(MULTILINGUAL_FIELDS) as ContentType[]) {
    const categories = getFieldCategories(contentType);

    if (categories.base.includes(fieldName)) {
      results.push({ contentType, category: 'base' });
    }
    if (categories.english.includes(fieldName)) {
      results.push({ contentType, category: 'english' });
    }
    if (categories.hindi.includes(fieldName)) {
      results.push({ contentType, category: 'hindi' });
    }
  }

  return results;
}

/**
 * Validate field names before making API calls (pre-call validation)
 * This is the main function to be used in API routes
 */
export function preValidateApiFields(
  contentType: ContentType,
  fields: string[],
  options: {
    autoCorrect?: boolean;
    logErrors?: boolean;
  } = {}
): {
  success: boolean;
  validatedFields: string[];
  errors: string[];
  corrections: Record<string, string>;
} {
  const { autoCorrect = true, logErrors = true } = options;

  const validation = validateFields(contentType, fields);
  const corrections: Record<string, string> = {};
  const errors: string[] = [];

  let finalFields = [...validation.validFields];

  // Handle invalid fields
  for (const invalidField of validation.invalidFields) {
    const suggestion = validation.suggestions[invalidField];

    if (autoCorrect && suggestion) {
      // Auto-correct using suggestion
      finalFields.push(suggestion);
      corrections[invalidField] = suggestion;

      if (logErrors) {
        console.warn(`Auto-corrected field '${invalidField}' to '${suggestion}' for ${contentType}`);
      }
    } else {
      // Cannot correct, add to errors
      const errorMsg = suggestion
        ? `Invalid field '${invalidField}' for ${contentType}. Suggestion: '${suggestion}'`
        : `Invalid field '${invalidField}' for ${contentType}. No suggestion available.`;

      errors.push(errorMsg);

      if (logErrors) {
        console.error(errorMsg);
      }
    }
  }

  return {
    success: errors.length === 0,
    validatedFields: [...new Set(finalFields)], // Remove duplicates
    errors,
    corrections
  };
}
/*
*
 * Suggest a single field correction for invalid field names
 */
export function suggestFieldCorrection(contentType: ContentType, field: string): string | null {
  // Common field corrections based on known issues
  const commonCorrections: Record<string, string> = {
    'ghazalHead': 'unwan',
    'enDescription': 'body',
    'description': 'body',
    'title': 'unwan',
    'author': 'shaer',
    'text': 'sher'
  };

  // Check direct corrections first
  if (commonCorrections[field]) {
    return commonCorrections[field];
  }

  // Try to find similar field names using simple string matching
  const validFields = MULTILINGUAL_FIELDS[contentType] as readonly string[];

  for (const validField of validFields) {
    // Check if field is a substring of valid field or vice versa
    if (validField.toLowerCase().includes(field.toLowerCase()) ||
      field.toLowerCase().includes(validField.toLowerCase())) {
      return validField;
    }

    // Check for similar patterns (e.g., removing prefixes)
    if (field.startsWith('en') && validField === field.substring(2).toLowerCase()) {
      return validField;
    }
  }

  return null;
}