/**
 * Formatting utilities for consistent data presentation.
 * Provides helpers for date, text, number, and other data formatting.
 */

/**
 * Create URL-friendly slug from text while preserving Unicode characters.
 * Unified implementation that handles both ASCII and Unicode text properly.
 */
export function createSlug(text: string): string {
  if (!text || typeof text !== "string") return "";

  // Handle Urdu/Arabic text by preserving Unicode characters
  // Don't convert to lowercase for Unicode preservation
  const slug = text
    .trim()
    .replace(/[\s_]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

  return slug;
}

/**
 * Format numbers with appropriate locale formatting.
 * Unified implementation with flexible locale support.
 */
export function formatNumber(num: number, locale: string = "en-US"): string {
  if (typeof num !== "number" || isNaN(num)) {
    return "0";
  }
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Format a date string for display in the UI
 */
export function formatDate(
  dateString: string,
  locale: string = "ur-PK"
): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }

    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch (error) {
    return dateString;
  }
}

/**
 * Format a date for relative display (e.g., "2 days ago")
 */
export function formatRelativeDate(
  dateString: string,
  locale: string = "en"
): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;

    return `${Math.floor(diffInDays / 365)} years ago`;
  } catch (error) {
    return dateString;
  }
}

/**
 * Truncate text to a specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

/**
 * Format large numbers with abbreviations (1K, 1M, etc.)
 */
export function formatCompactNumber(
  num: number,
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(num);
}

/**
 * Format text for search highlighting
 */
export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm) return text;

  const regex = new RegExp(searchTerm, "gi");
  return text.replace(regex, (match) => `<mark>${match}</mark>`);
}

/**
 * Clean and normalize text for processing
 */
export function normalizeText(text: string): string {
  return text.trim().replace(/\s+/g, " ").normalize("NFC");
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  const sizes = ["B", "KB", "MB", "GB"];
  if (bytes === 0) return "0 B";

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);

  return `${size.toFixed(1)} ${sizes[i]}`;
}
