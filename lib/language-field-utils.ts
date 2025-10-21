import { MultilingualError, handleMissingTranslation } from "@/lib/multilingual-error-handler";
import type { Language } from "@/lib/multilingual-texts";

/**
 * Language-aware field name resolution utility
 * Maps base field names to language-specific field names following the existing naming convention
 */

/**
 * Maps a base field name to its language-specific equivalent
 * @param baseField - The base field name (e.g., 'description', 'name', 'location')
 * @param language - The target language ('EN', 'UR', 'HI')
 * @returns The language-specific field name or the base field for Urdu
 * 
 * Examples:
 * - getLanguageFieldName('description', 'EN') → 'enDescription'
 * - getLanguageFieldName('description', 'HI') → 'hiDescription'
 * - getLanguageFieldName('description', 'UR') → 'description' (no prefix for default)
 */
export function getLanguageFieldName(baseField: string, language: Language): string {
  if (!baseField || typeof baseField !== 'string') {
    return baseField;
  }

  // Urdu is the default language - no prefix needed
  if (language === 'UR') {
    return baseField;
  }

  // For EN and HI, add language prefix with camelCase
  const prefix = language.toLowerCase(); // 'en' or 'hi'
  const capitalizedField = baseField.charAt(0).toUpperCase() + baseField.slice(1);

  return `${prefix}${capitalizedField}`;
}

/**
 * Gets the value of a field in the specified language with fallback logic and error handling
 * @param record - The record object containing the fields
 * @param baseField - The base field name
 * @param language - The target language
 * @param fallbackLanguages - Array of fallback languages to try if the primary language field is missing
 * @param contentType - Optional content type for better error reporting
 * @param handleErrors - Whether to handle errors through the multilingual error handler
 * @returns The field value in the requested language or fallback
 */
export function getLanguageFieldValue<T = any>(
  record: Record<string, any>,
  baseField: string,
  language: Language,
  fallbackLanguages: Language[] = ['UR', 'EN', 'HI'],
  contentType?: string,
  handleErrors = false
): T | undefined {
  if (!record || !baseField) {
    return undefined;
  }

  // Try the requested language first
  const primaryFieldName = getLanguageFieldName(baseField, language);
  const primaryValue = record[primaryFieldName];

  if (primaryValue !== undefined && primaryValue !== null && primaryValue !== '') {
    return primaryValue as T;
  }

  // If error handling is enabled, use the multilingual error handler
  if (handleErrors) {
    const result = handleMissingTranslation(
      language,
      baseField,
      record,
      contentType,
      fallbackLanguages
    );

    return result.value as T;
  }

  // Try fallback languages in order (original behavior)
  for (const fallbackLang of fallbackLanguages) {
    if (fallbackLang === language) continue; // Skip the already tried language

    const fallbackFieldName = getLanguageFieldName(baseField, fallbackLang);
    const fallbackValue = record[fallbackFieldName];

    if (fallbackValue !== undefined && fallbackValue !== null && fallbackValue !== '') {
      return fallbackValue as T;
    }
  }

  return undefined;
}

/**
 * Creates a mapping of base field names to their language-specific equivalents
 * @param baseFields - Array of base field names
 * @param language - The target language
 * @returns Object mapping base fields to language-specific field names
 */
export function createLanguageFieldMap(
  baseFields: string[],
  language: Language
): Record<string, string> {
  const fieldMap: Record<string, string> = {};

  for (const baseField of baseFields) {
    fieldMap[baseField] = getLanguageFieldName(baseField, language);
  }

  return fieldMap;
}

/**
 * Transforms a record by selecting language-specific fields
 * @param record - The source record with all language fields
 * @param baseFields - Array of base field names to transform
 * @param language - The target language
 * @param fallbackLanguages - Array of fallback languages
 * @returns New record with language-specific field values
 */
export function transformRecordForLanguage<T extends Record<string, any>>(
  record: T,
  baseFields: string[],
  language: Language,
  fallbackLanguages: Language[] = ['UR', 'EN', 'HI']
): T {
  const transformed = { ...record };

  for (const baseField of baseFields) {
    const value = getLanguageFieldValue(record, baseField, language, fallbackLanguages);
    (transformed as any)[baseField] = value;
  }

  return transformed;
}

/**
 * Common field names used across different content types
 */
export const COMMON_TRANSLATABLE_FIELDS = [
  'description',
  'name',
  'takhallus',
  'location',
  'title',
  'content',
  'unwan',
  'tafseel',
  'tag'
] as const;

/**
 * Poetry-specific field names
 */
export const POETRY_TRANSLATABLE_FIELDS = [
  'sher',
  'sherHead',
  'wholeSher',
  'ghazal',
  'nazm',
  'body'
] as const;

/**
 * All translatable field names
 */
export const ALL_TRANSLATABLE_FIELDS = [
  ...COMMON_TRANSLATABLE_FIELDS,
  ...POETRY_TRANSLATABLE_FIELDS
] as const;

/**
 * Content type specific field mappings for comprehensive multilingual support
 */
export const CONTENT_TYPE_FIELDS = {
  ashaar: [
    'sher', 'body', 'unwan', 'shaer', 'takhallus', 'sherHead', 'wholeSher'
  ],
  ghazlen: [
    'ghazal', 'unwan', 'shaer', 'takhallus'
  ],
  nazmen: [
    'nazm', 'unwan', 'shaer', 'takhallus', 'paband'
  ],
  rubai: [
    'body', 'unwan', 'shaer', 'takhallus'
  ],
  shaer: [
    'name', 'takhallus', 'location'
  ],
  ebooks: [
    'bookName', 'writer', 'title'
  ]
} as const;

/**
 * Enhanced record transformation with content type awareness
 * @param record - The source record with all language fields
 * @param contentType - The type of content (ashaar, ghazlen, etc.)
 * @param language - The target language
 * @param fallbackLanguages - Array of fallback languages
 * @returns New record with language-specific field values
 */
export function transformRecordForContentType<T extends Record<string, any>>(
  record: T,
  contentType: keyof typeof CONTENT_TYPE_FIELDS,
  language: Language,
  fallbackLanguages: Language[] = ['UR', 'EN', 'HI']
): T {
  const transformed = { ...record };
  const fieldsToTransform = CONTENT_TYPE_FIELDS[contentType];

  for (const baseField of fieldsToTransform) {
    const value = getLanguageFieldValue(record, baseField, language, fallbackLanguages);
    if (value !== undefined) {
      (transformed as any)[baseField] = value;
    }
  }

  return transformed;
}

/**
 * Batch transform multiple records for a specific content type
 * @param records - Array of records to transform
 * @param contentType - The type of content
 * @param language - The target language
 * @param fallbackLanguages - Array of fallback languages
 * @returns Array of transformed records
 */
export function transformRecordsForContentType<T extends Record<string, any>>(
  records: T[],
  contentType: keyof typeof CONTENT_TYPE_FIELDS,
  language: Language,
  fallbackLanguages: Language[] = ['UR', 'EN', 'HI']
): T[] {
  return records.map(record =>
    transformRecordForContentType(record, contentType, language, fallbackLanguages)
  );
}

/**
 * Check if a record has content in the specified language
 * @param record - The record to check
 * @param contentType - The type of content
 * @param language - The language to check for
 * @returns Boolean indicating if content exists in the language
 */
export function hasContentInLanguage(
  record: Record<string, any>,
  contentType: keyof typeof CONTENT_TYPE_FIELDS,
  language: Language
): boolean {
  const fieldsToCheck = CONTENT_TYPE_FIELDS[contentType];

  return fieldsToCheck.some(baseField => {
    const fieldName = getLanguageFieldName(baseField, language);
    const value = record[fieldName];
    return value !== undefined && value !== null && value !== '';
  });
}

/**
 * Get available languages for a record
 * @param record - The record to analyze
 * @param contentType - The type of content
 * @returns Array of languages that have content in the record
 */
export function getAvailableLanguages(
  record: Record<string, any>,
  contentType: keyof typeof CONTENT_TYPE_FIELDS
): Language[] {
  const languages: Language[] = ['UR', 'EN', 'HI'];

  return languages.filter(lang =>
    hasContentInLanguage(record, contentType, lang)
  );
}

/**
 * Enhanced field value getter with content type awareness and better fallback logic
 * @param record - The record object containing the fields
 * @param baseField - The base field name
 * @param language - The target language
 * @param contentType - The type of content for better fallback decisions
 * @param fallbackLanguages - Array of fallback languages to try
 * @returns The field value in the requested language or fallback
 */
export function getEnhancedLanguageFieldValue<T = any>(
  record: Record<string, any>,
  baseField: string,
  language: Language,
  contentType?: keyof typeof CONTENT_TYPE_FIELDS,
  fallbackLanguages: Language[] = ['UR', 'EN', 'HI']
): T | undefined {
  if (!record || !baseField) {
    return undefined;
  }

  // Try the requested language first
  const primaryFieldName = getLanguageFieldName(baseField, language);
  const primaryValue = record[primaryFieldName];

  if (primaryValue !== undefined && primaryValue !== null && primaryValue !== '') {
    return primaryValue as T;
  }

  // If content type is provided, check if the record has any content in the requested language
  // If not, prioritize fallback languages that do have content
  if (contentType) {
    const availableLanguages = getAvailableLanguages(record, contentType);
    const prioritizedFallbacks = fallbackLanguages.filter(lang =>
      lang !== language && availableLanguages.includes(lang)
    );

    // Try prioritized fallbacks first
    for (const fallbackLang of prioritizedFallbacks) {
      const fallbackFieldName = getLanguageFieldName(baseField, fallbackLang);
      const fallbackValue = record[fallbackFieldName];

      if (fallbackValue !== undefined && fallbackValue !== null && fallbackValue !== '') {
        return fallbackValue as T;
      }
    }
  }

  // Try remaining fallback languages in order
  for (const fallbackLang of fallbackLanguages) {
    if (fallbackLang === language) continue; // Skip the already tried language

    const fallbackFieldName = getLanguageFieldName(baseField, fallbackLang);
    const fallbackValue = record[fallbackFieldName];

    if (fallbackValue !== undefined && fallbackValue !== null && fallbackValue !== '') {
      return fallbackValue as T;
    }
  }

  return undefined;
}

/**
 * Safe field value getter with comprehensive error handling and user-friendly fallbacks
 * @param record - The record object containing the fields
 * @param baseField - The base field name
 * @param language - The target language
 * @param options - Configuration options for error handling and fallbacks
 * @returns Object containing value, fallback info, and any errors
 */
export function getSafeLanguageFieldValue<T = any>(
  record: Record<string, any>,
  baseField: string,
  language: Language,
  options: {
    contentType?: keyof typeof CONTENT_TYPE_FIELDS;
    fallbackLanguages?: Language[];
    handleErrors?: boolean;
    showUserMessages?: boolean;
    defaultValue?: T;
  } = {}
): {
  value: T | undefined;
  fallbackUsed?: Language;
  error?: MultilingualError;
  isDefault?: boolean;
} {
  const {
    contentType,
    fallbackLanguages = ['UR', 'EN', 'HI'],
    handleErrors = true,
    showUserMessages = false,
    defaultValue
  } = options;

  if (!record || !baseField) {
    return { value: defaultValue, isDefault: !!defaultValue };
  }

  // Try the requested language first
  const primaryFieldName = getLanguageFieldName(baseField, language);
  const primaryValue = record[primaryFieldName];

  if (primaryValue !== undefined && primaryValue !== null && primaryValue !== '') {
    return { value: primaryValue as T };
  }

  // Use multilingual error handler for comprehensive fallback handling
  if (handleErrors) {
    const result = handleMissingTranslation(
      language,
      baseField,
      record,
      contentType,
      fallbackLanguages
    );

    if (result.value !== undefined) {
      return {
        value: result.value as T,
        fallbackUsed: result.fallbackUsed,
        error: result.error
      };
    }

    // If no fallback found and we have a default value
    if (defaultValue !== undefined) {
      return {
        value: defaultValue,
        isDefault: true,
        error: result.error
      };
    }

    return {
      value: undefined,
      error: result.error
    };
  }

  // Fallback to original behavior if error handling is disabled
  const fallbackValue = getEnhancedLanguageFieldValue<T>(
    record,
    baseField,
    language,
    contentType,
    fallbackLanguages
  );

  if (fallbackValue !== undefined) {
    return { value: fallbackValue };
  }

  return {
    value: defaultValue,
    isDefault: !!defaultValue
  };
}