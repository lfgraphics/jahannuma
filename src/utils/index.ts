/**
 * Utility functions barrel export.
 * Provides clean imports for all utility functions organized by domain.
 *
 * Import patterns:
 * - `import { formatDate, truncateText } from '@/utils'` - Common utilities
 * - `import { isValidEmail } from '@/utils'` - Validation utilities
 */

// Formatting utilities
export * from "./formatters";

// Validation utilities
export * from "./validators";
