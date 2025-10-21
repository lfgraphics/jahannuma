/**
 * Multilingual text formatting utilities
 * Handles proper formatting and display of language-specific text content
 */

import type { Language } from "@/lib/multilingual-texts";
import { getEnhancedLanguageFieldValue } from "./language-field-utils";

/**
 * Format multilingual text content with proper line breaks and structure
 * @param content - The text content to format
 * @param preserveLineBreaks - Whether to preserve line breaks in the content
 * @returns Formatted text content
 */
export function formatMultilingualText(
  content: string | string[] | undefined,
  preserveLineBreaks: boolean = true
): string {
  if (!content) return '';

  if (Array.isArray(content)) {
    return content.join(preserveLineBreaks ? '\n' : ' ');
  }

  if (typeof content === 'string') {
    if (preserveLineBreaks) {
      return content.replace(/\r\n?/g, '\n');
    }
    return content.replace(/\r\n?/g, ' ').replace(/\s+/g, ' ').trim();
  }

  return String(content || '');
}

/**
 * Split multilingual text into lines for display
 * @param content - The text content to split
 * @returns Array of text lines
 */
export function splitMultilingualText(
  content: string | string[] | undefined
): string[] {
  if (!content) return [];

  if (Array.isArray(content)) {
    return content.flatMap(line =>
      String(line).replace(/\r\n?/g, '\n').split('\n').filter(Boolean)
    );
  }

  return String(content).replace(/\r\n?/g, '\n').split('\n').filter(Boolean);
}

/**
 * Format description text with language awareness
 * @param record - The record containing description fields
 * @param language - Target language
 * @param contentType - Type of content for better field selection
 * @param fallbackLanguages - Fallback languages in order of preference
 * @returns Formatted description text
 */
export function formatLanguageAwareDescription(
  record: Record<string, any>,
  language: Language,
  contentType?: string,
  fallbackLanguages: Language[] = ['UR', 'EN', 'HI']
): string {
  const description = getEnhancedLanguageFieldValue(
    record,
    'description',
    language,
    contentType as any,
    fallbackLanguages
  );

  return formatMultilingualText(description, true);
}

/**
 * Format tafseel text with language awareness
 * @param record - The record containing tafseel fields
 * @param language - Target language
 * @param contentType - Type of content for better field selection
 * @param fallbackLanguages - Fallback languages in order of preference
 * @returns Formatted tafseel text
 */
export function formatLanguageAwareTafseel(
  record: Record<string, any>,
  language: Language,
  contentType?: string,
  fallbackLanguages: Language[] = ['UR', 'EN', 'HI']
): string {
  const tafseel = getEnhancedLanguageFieldValue(
    record,
    'tafseel',
    language,
    contentType as any,
    fallbackLanguages
  );

  return formatMultilingualText(tafseel, true);
}

/**
 * Get formatted lines for display components
 * @param record - The record containing text fields
 * @param fieldName - Name of the field to format
 * @param language - Target language
 * @param contentType - Type of content for better field selection
 * @param fallbackLanguages - Fallback languages in order of preference
 * @returns Array of formatted text lines
 */
export function getFormattedLanguageLines(
  record: Record<string, any>,
  fieldName: string,
  language: Language,
  contentType?: string,
  fallbackLanguages: Language[] = ['UR', 'EN', 'HI']
): string[] {
  const content = getEnhancedLanguageFieldValue(
    record,
    fieldName,
    language,
    contentType as any,
    fallbackLanguages
  );

  return splitMultilingualText(content);
}

/**
 * Format text for metadata and SEO purposes
 * @param content - The text content to format
 * @param maxLength - Maximum length for the formatted text
 * @returns Formatted text suitable for metadata
 */
export function formatTextForMetadata(
  content: string | string[] | undefined,
  maxLength: number = 160
): string {
  const formatted = formatMultilingualText(content, false);

  if (formatted.length <= maxLength) {
    return formatted;
  }

  // Truncate at word boundary
  const truncated = formatted.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...';
  }

  return truncated + '...';
}

/**
 * Language-specific text direction utilities
 */
export const TEXT_DIRECTION = {
  EN: 'ltr',
  UR: 'rtl',
  HI: 'ltr'
} as const;

/**
 * Get text direction for a language
 * @param language - The language code
 * @returns Text direction (ltr or rtl)
 */
export function getTextDirection(language: Language): 'ltr' | 'rtl' {
  return TEXT_DIRECTION[language] || 'ltr';
}

/**
 * Format content with proper text direction
 * @param content - The content to format
 * @param language - The language of the content
 * @returns Object with formatted content and text direction
 */
export function formatContentWithDirection(
  content: string | string[] | undefined,
  language: Language
): { content: string; direction: 'ltr' | 'rtl'; lines: string[] } {
  const formattedContent = formatMultilingualText(content, true);
  const lines = splitMultilingualText(content);
  const direction = getTextDirection(language);

  return {
    content: formattedContent,
    direction,
    lines
  };
}