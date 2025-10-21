/**
 * Comprehensive language-aware data transformation utilities
 * Handles complete multilingual data transformation with robust fallback mechanisms
 */

import type { Language } from "@/lib/multilingual-texts";
import {
  CONTENT_TYPE_FIELDS,
  getAvailableLanguages,
  getEnhancedLanguageFieldValue,
  hasContentInLanguage,
  transformRecordForContentType
} from "./language-field-utils";

/**
 * Configuration for language transformation
 */
export interface LanguageTransformConfig {
  language: Language;
  fallbackLanguages: Language[];
  preserveOriginalFields: boolean;
  contentType?: keyof typeof CONTENT_TYPE_FIELDS;
}

/**
 * Default transformation configuration
 */
export const DEFAULT_TRANSFORM_CONFIG: LanguageTransformConfig = {
  language: 'UR',
  fallbackLanguages: ['UR', 'EN', 'HI'],
  preserveOriginalFields: true
};

/**
 * Transform a single record with enhanced language support
 * @param record - The source record
 * @param config - Transformation configuration
 * @returns Transformed record with language-specific content
 */
export function transformRecord<T extends Record<string, any>>(
  record: T,
  config: LanguageTransformConfig = DEFAULT_TRANSFORM_CONFIG
): T & { _languageInfo?: LanguageInfo } {
  if (!record) return record;

  const { language, contentType, preserveOriginalFields } = config;

  let transformed: T;

  if (contentType) {
    transformed = transformRecordForContentType(record, contentType, language, config.fallbackLanguages);
  } else {
    // Fallback to generic transformation
    transformed = { ...record };
  }

  // Add language metadata
  const languageInfo: LanguageInfo = {
    requestedLanguage: language,
    availableLanguages: contentType ? getAvailableLanguages(record, contentType) : [language],
    hasContentInRequestedLanguage: contentType ? hasContentInLanguage(record, contentType, language) : true,
    fallbacksUsed: []
  };

  // Track which fields used fallbacks
  if (contentType) {
    const fieldsToCheck = CONTENT_TYPE_FIELDS[contentType];
    for (const field of fieldsToCheck) {
      const requestedValue = getEnhancedLanguageFieldValue(record, field, language, contentType, [language]);
      const actualValue = getEnhancedLanguageFieldValue(record, field, language, contentType, config.fallbackLanguages);

      if (requestedValue !== actualValue && actualValue !== undefined) {
        // Find which fallback language was used
        for (const fallbackLang of config.fallbackLanguages) {
          if (fallbackLang === language) continue;
          const fallbackValue = getEnhancedLanguageFieldValue(record, field, fallbackLang, contentType, [fallbackLang]);
          if (fallbackValue === actualValue) {
            languageInfo.fallbacksUsed.push({
              field,
              requestedLanguage: language,
              usedLanguage: fallbackLang
            });
            break;
          }
        }
      }
    }
  }

  return {
    ...transformed,
    _languageInfo: languageInfo
  };
}

/**
 * Transform multiple records with language support
 * @param records - Array of records to transform
 * @param config - Transformation configuration
 * @returns Array of transformed records
 */
export function transformRecords<T extends Record<string, any>>(
  records: T[],
  config: LanguageTransformConfig = DEFAULT_TRANSFORM_CONFIG
): (T & { _languageInfo?: LanguageInfo })[] {
  if (!records || !Array.isArray(records)) return [];

  return records.map(record => transformRecord(record, config));
}

/**
 * Language information metadata
 */
export interface LanguageInfo {
  requestedLanguage: Language;
  availableLanguages: Language[];
  hasContentInRequestedLanguage: boolean;
  fallbacksUsed: FallbackInfo[];
}

/**
 * Information about fallback usage
 */
export interface FallbackInfo {
  field: string;
  requestedLanguage: Language;
  usedLanguage: Language;
}

/**
 * Content type specific transformers
 */
export class ContentTypeTransformer {
  private config: LanguageTransformConfig;

  constructor(config: Partial<LanguageTransformConfig> = {}) {
    this.config = { ...DEFAULT_TRANSFORM_CONFIG, ...config };
  }

  /**
   * Transform Ashaar records
   */
  transformAshaar<T extends Record<string, any>>(records: T[]): (T & { _languageInfo?: LanguageInfo })[] {
    return transformRecords(records, { ...this.config, contentType: 'ashaar' });
  }

  /**
   * Transform Ghazlen records
   */
  transformGhazlen<T extends Record<string, any>>(records: T[]): (T & { _languageInfo?: LanguageInfo })[] {
    return transformRecords(records, { ...this.config, contentType: 'ghazlen' });
  }

  /**
   * Transform Nazmen records
   */
  transformNazmen<T extends Record<string, any>>(records: T[]): (T & { _languageInfo?: LanguageInfo })[] {
    return transformRecords(records, { ...this.config, contentType: 'nazmen' });
  }

  /**
   * Transform Rubai records
   */
  transformRubai<T extends Record<string, any>>(records: T[]): (T & { _languageInfo?: LanguageInfo })[] {
    return transformRecords(records, { ...this.config, contentType: 'rubai' });
  }

  /**
   * Transform Shaer (poet) records
   */
  transformShaer<T extends Record<string, any>>(records: T[]): (T & { _languageInfo?: LanguageInfo })[] {
    return transformRecords(records, { ...this.config, contentType: 'shaer' });
  }

  /**
   * Transform E-books records
   */
  transformEbooks<T extends Record<string, any>>(records: T[]): (T & { _languageInfo?: LanguageInfo })[] {
    return transformRecords(records, { ...this.config, contentType: 'ebooks' });
  }

  /**
   * Update transformer configuration
   */
  updateConfig(newConfig: Partial<LanguageTransformConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): LanguageTransformConfig {
    return { ...this.config };
  }
}

/**
 * Utility function to create a transformer for a specific language
 * @param language - Target language
 * @param fallbackLanguages - Fallback languages in order of preference
 * @returns ContentTypeTransformer instance
 */
export function createLanguageTransformer(
  language: Language,
  fallbackLanguages: Language[] = ['UR', 'EN', 'HI']
): ContentTypeTransformer {
  return new ContentTypeTransformer({
    language,
    fallbackLanguages,
    preserveOriginalFields: true
  });
}

/**
 * Hook-friendly transformer function for React components
 * @param data - Data to transform
 * @param contentType - Type of content
 * @param language - Target language
 * @param fallbackLanguages - Fallback languages
 * @returns Transformed data with language metadata
 */
export function useLanguageTransform<T extends Record<string, any>>(
  data: T[] | null | undefined,
  contentType: keyof typeof CONTENT_TYPE_FIELDS,
  language: Language,
  fallbackLanguages: Language[] = ['UR', 'EN', 'HI']
): (T & { _languageInfo?: LanguageInfo })[] {
  if (!data || !Array.isArray(data)) return [];

  return transformRecords(data, {
    language,
    contentType,
    fallbackLanguages,
    preserveOriginalFields: true
  });
}