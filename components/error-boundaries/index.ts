/**
 * Error Boundaries for Multilingual Application
 * 
 * Provides comprehensive error handling for multilingual content scenarios,
 * including missing translations, language-specific failures, and content localization issues.
 */

// Main multilingual error boundary
export {
  MultilingualErrorBoundary,
  useMultilingualErrorBoundary
} from './MultilingualErrorBoundary';

// Language-aware error boundaries
export {
  ContentErrorBoundary, LanguageAwareErrorBoundary, RouteErrorBoundary, useLanguageAwareErrorHandler, withLanguageAwareErrorBoundary
} from './LanguageAwareErrorBoundary';

// Missing content error boundary
export {
  MissingContentErrorBoundary,
  useMissingContentHandler
} from './MissingContentErrorBoundary';

// Re-export error handler utilities
export {
  MultilingualErrorHandler, MultilingualErrorType, createContentLocalizationError, createFallbackChainExhaustedError,
  createLanguageAPIFailureError, createLanguageFieldNotFoundError, createMissingTranslationError, handleLanguageAPIFailure, handleMissingTranslation, multilingualErrorHandler, validateContentAvailability
} from '@/lib/multilingual-error-handler';

// Type exports
export type {
  MultilingualError,
  MultilingualPerformanceMetrics
} from '@/src/types/multilingual';

