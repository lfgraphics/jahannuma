/**
 * String manipulation utilities for text processing.
 */

/**
 * Truncate text to a specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Clean and sanitize text input
 */
export function cleanText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .replace(
      /[^\w\s\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u0900-\u097F]/g,
      ""
    ); // Keep only letters, numbers, spaces, Arabic, Urdu, Hindi chars
}

// Re-export the centralized createSlug function
export { createSlug } from "@/utils/formatters";

/**
 * Capitalize first letter of each word
 */
export function titleCase(text: string): string {
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Extract initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Check if text contains Urdu/Arabic characters
 */
export function hasUrduText(text: string): boolean {
  const urduRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  return urduRegex.test(text);
}

/**
 * Check if text contains Hindi/Devanagari characters
 */
export function hasHindiText(text: string): boolean {
  const hindiRegex = /[\u0900-\u097F]/;
  return hindiRegex.test(text);
}

/**
 * Remove HTML tags from text
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

/**
 * Convert newlines to HTML breaks
 */
export function nlToBr(text: string): string {
  return text.replace(/\n/g, "<br>");
}
